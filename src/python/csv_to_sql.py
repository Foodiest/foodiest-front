"""
csv_to_sql.py  —  CSV -> Supabase SQL 변환기
==============================================
아래 설정만 바꾸고  python csv_to_sql.py  실행하면 끝!
"""

import re
import sys
import uuid
from pathlib import Path

# =============================================
# 여기만 수정하세요
# =============================================

# 변환할 CSV 파일 이름 (프로젝트 루트 기준)
INPUT_CSV = "restaurant_retry_fixed.csv"

# 기존 DB의 기준 CSV (id 중복 방지용). 처음 시드라면 None 으로
BASE_CSV = "restaurant_final_complete.csv"

# 리뷰에 사용할 user_id (Supabase users 테이블에 실제 존재하는 id)
USER_ID = 1

# =============================================

try:
    import pandas as pd
except ImportError:
    print("❌ pandas가 설치되어 있지 않습니다. 아래 명령으로 설치하세요:")
    print("   pip install pandas")
    sys.exit(1)


# ─────────────────────────────────────────────
# 유틸 함수
# ─────────────────────────────────────────────

def escape_sql(s) -> str | None:
    """SQL 문자열 이스케이프 (None/NaN → None)"""
    if s is None or (isinstance(s, float) and pd.isna(s)):
        return None
    return str(s).strip().replace("'", "''")


def pg_array(lst: list) -> str:
    """Python 리스트 → PostgreSQL 배열 리터럴"""
    if not lst:
        return "'{}'"
    inner = ",".join(
        '"' + str(e).replace("'", "''").replace('"', '\\"') + '"'
        for e in lst if e
    )
    return f"'{{{inner}}}'"


def parse_menu(menu_str) -> list[tuple[str, int]]:
    """
    메뉴 문자열에서 (메뉴명, 가격) 리스트 추출
    예: '대표 짜장면 맛있는 짜장 9,500원 / 대표 짬뽕 13,000원'
    """
    if pd.isna(menu_str):
        return []
    results = []
    for name, price in re.findall(r'([^/\n]+?)\s+(\d[\d,]+)원', str(menu_str)):
        name = name.strip()
        name = re.sub(r'^대표\s*', '', name)
        name = re.sub(r'^\[.*?\]\s*', '', name)
        name = re.sub(r'★.*?★\s*', '', name).strip()
        price_int = int(price.replace(',', ''))
        if name and price_int > 0:
            results.append((name[:200], price_int))
    return results


def parse_images(img_str) -> list[str]:
    """파이프(|) 구분 이미지 URL 리스트 파싱"""
    if pd.isna(img_str) or str(img_str).strip() in ('nan', ''):
        return []
    return [u.strip() for u in str(img_str).split('|') if u.strip()]


def clean_review(text: str) -> str:
    """리뷰 끝에 붙는 '더보기'/'접기' UI 잔재 제거"""
    return re.sub(r'\s*(더보기|접기)\s*$', '', str(text).strip())


def infer_rating(text: str) -> int:
    """리뷰 내용 기반 별점 추론 (부정 키워드 → 4점, 기본 5점)"""
    neg_keywords = ['아쉬', '느리', '별로', '실망', '불친절', '별로']
    return 4 if any(kw in text for kw in neg_keywords) else 5


# ─────────────────────────────────────────────
# SQL 생성 함수
# ─────────────────────────────────────────────

def build_restaurant_sql(rid: int, name: str, all_imgs: list, is_new: bool) -> list[str]:
    main_image = f"'{escape_sql(all_imgs[0])}'" if all_imgs else 'NULL'
    sub_images_sql = pg_array([escape_sql(u) for u in all_imgs[1:]])

    lines = []
    if is_new:
        lines.append(f"-- [INSERT] {name} (id={rid})")
        lines.append("INSERT INTO public.restaurants (id, name, image, sub_images, tags, vibes, flavors, dietary)")
        lines.append("VALUES (")
        lines.append(f"  {rid},")
        lines.append(f"  '{escape_sql(name)}',")
        lines.append(f"  {main_image},")
        lines.append(f"  {sub_images_sql},")
        lines.append("  '{}', '{}', '{}', '{}'")
        lines.append(");")
    else:
        lines.append(f"-- [UPDATE] {name} (id={rid}) — image/sub_images 갱신")
        lines.append("UPDATE public.restaurants SET")
        lines.append(f"  image = {main_image},")
        lines.append(f"  sub_images = {sub_images_sql}")
        lines.append(f"WHERE id = {rid};")
    return lines


def build_menu_sql(rid: int, name: str, menus: list, menu_id: int, is_new: bool) -> tuple[list[str], int]:
    lines = []
    if not menus:
        return lines, menu_id

    if not is_new:
        lines.append(f"-- 기존 메뉴 삭제: {name}")
        lines.append(f"DELETE FROM public.menus WHERE restaurant_id = {rid};")

    for mname, mprice in menus:
        lines.append("INSERT INTO public.menus (restaurant_id, name, price)")
        lines.append(f"VALUES ({rid}, '{escape_sql(mname)}', {mprice});")

    return lines, menu_id


def build_review_sql(rid: int, name: str, row, is_new: bool, user_id: int) -> list[str]:
    lines = []
    reviews_data = []

    for n in range(1, 11):
        content = row.get(f'리뷰{n}_내용')
        if pd.isna(content) or not str(content).strip():
            continue
        content_clean = clean_review(str(content))
        photos = parse_images(row.get(f'리뷰{n}_사진링크'))
        score = infer_rating(content_clean)
        reviews_data.append((content_clean, photos, score))

    if not reviews_data:
        return lines

    if not is_new:
        lines.append(f"-- 기존 리뷰 삭제: {name}")
        lines.append(f"DELETE FROM public.reviews WHERE restaurant_id = {rid};")

    for content_clean, photos, score in reviews_data:
        images_sql = pg_array([escape_sql(u) for u in photos])
        lines.append("INSERT INTO public.reviews (id, restaurant_id, review_text, rating, images, keywords, negative_keywords, user_id)")
        lines.append("VALUES (")
        lines.append(f"  '{uuid.uuid4()}',")
        lines.append(f"  {rid},")
        lines.append(f"  '{escape_sql(content_clean)}',")
        lines.append(f"  {score},")
        lines.append(f"  {images_sql},")
        lines.append("  '{}'::jsonb,")
        lines.append("  '{}',")
        lines.append(f"  {user_id}")
        lines.append(");")

    return lines


# ─────────────────────────────────────────────
# 메인 변환 로직
# ─────────────────────────────────────────────

def convert(
    input_path: str,
    output_path: str,
    base_path: str | None,
    id_start: int | None,
    menu_id_start: int | None,
    user_id: int,
):
    df = pd.read_csv(input_path)

    # 기존 파일 로드해서 id 매핑 및 시작값 자동 계산
    base_names: list[str] = []
    if base_path:
        base_df = pd.read_csv(base_path)
        base_names = base_df['식당이름'].tolist()

        # --id-start 미지정 시 기존 식당 수 + 1
        if id_start is None:
            id_start = len(base_names) + 1

        # --menu-id-start 미지정 시 기존 메뉴 총 수 + 1
        if menu_id_start is None:
            total_menus = sum(len(parse_menu(r['메뉴정보'])) for _, r in base_df.iterrows())
            menu_id_start = total_menus + 1
    else:
        if id_start is None:
            id_start = 1
        if menu_id_start is None:
            menu_id_start = 1

    # 식당별 id 매핑
    new_id_counter = id_start
    rid_map: dict[str, int] = {}
    is_new_map: dict[str, bool] = {}
    for _, row in df.iterrows():
        name = row['식당이름']
        if name in base_names:
            rid_map[name] = base_names.index(name) + 1
            is_new_map[name] = False
        else:
            rid_map[name] = new_id_counter
            is_new_map[name] = True
            new_id_counter += 1

    # 통계
    total_menus = sum(len(parse_menu(r['메뉴정보'])) for _, r in df.iterrows())
    total_reviews = sum(
        1 for _, r in df.iterrows()
        for n in range(1, 11)
        if not pd.isna(r.get(f'리뷰{n}_내용', None)) and str(r.get(f'리뷰{n}_내용', '')).strip()
    )
    new_count = sum(1 for v in is_new_map.values() if v)
    update_count = len(df) - new_count

    # 헤더
    lines = [
        "-- =============================================",
        f"-- 생성 파일: {Path(output_path).name}",
        f"-- 원본 CSV:  {Path(input_path).name}",
        f"-- 식당: {len(df)}개 (NEW {new_count}개 / UPDATE {update_count}개)",
        f"-- 메뉴: {total_menus}건 / 리뷰: {total_reviews}건",
        f"-- user_id={user_id} 고정 — 실제 존재하는 users.id로 변경 필요",
        "-- =============================================",
        "",
    ]

    current_menu_id = menu_id_start

    for _, row in df.iterrows():
        name = row['식당이름']
        rid = rid_map[name]
        is_new = is_new_map[name]

        all_imgs = []
        for i in range(1, 5):
            all_imgs.extend(parse_images(row.get(f'업체사진{i}')))

        menus = parse_menu(row['메뉴정보'])

        lines.append(f"-- ─── {name} (id={rid}, {'NEW' if is_new else 'UPDATE'}) ───")
        lines.append("")

        # restaurants
        lines.extend(build_restaurant_sql(rid, name, all_imgs, is_new))
        lines.append("")

        # menus
        menu_lines, current_menu_id = build_menu_sql(rid, name, menus, current_menu_id, is_new)
        if menu_lines:
            lines.extend(menu_lines)
            lines.append("")

        # reviews
        review_lines = build_review_sql(rid, name, row, is_new, user_id)
        if review_lines:
            lines.extend(review_lines)
        lines.append("")

    # 파일 저장
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print(f"완료: 식당 {len(df)}개 (NEW {new_count} / UPDATE {update_count}), 메뉴 {total_menus}건, 리뷰 {total_reviews}건")


# ─────────────────────────────────────────────
# 실행
# ─────────────────────────────────────────────

if __name__ == '__main__':
    # CSV 파일은 프로젝트 루트(src/python 두 단계 위)에서 찾음
    root = Path(__file__).parent.parent.parent
    input_path = root / INPUT_CSV
    base_path  = (root / BASE_CSV) if BASE_CSV else None
    output_path = input_path.with_suffix('.sql')

    if not input_path.exists():
        print(f"파일을 찾을 수 없습니다: {input_path}")
        sys.exit(1)

    if base_path and not base_path.exists():
        print(f"BASE_CSV 파일을 찾을 수 없습니다: {base_path}")
        sys.exit(1)

    convert(
        input_path=str(input_path),
        output_path=str(output_path),
        base_path=str(base_path) if base_path else None,
        id_start=None,
        menu_id_start=None,
        user_id=USER_ID,
    )
    print(f"SQL 저장 위치: {output_path}")
