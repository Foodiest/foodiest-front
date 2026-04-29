import time
import csv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

# 브라우저 설정
chrome_options = Options()
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

# 다시 크롤링할 식당 리스트
target_restaurants = [
    "유메노키친"
]

def crawl_specific_list(restaurant_list, filename="restaurant_retry_fixed.csv"):
    # 1. 헤더 설정
    header = ['식당이름', '메뉴정보', '업체사진1', '업체사진2', '업체사진3', '업체사진4']
    for i in range(1, 11):
        header.append(f'리뷰{i}_내용')
        header.append(f'리뷰{i}_사진링크')
    
    try:
        f = open(filename, 'w', encoding='utf-8-sig', newline='')
        writer = csv.writer(f)
        writer.writerow(header)
    except PermissionError:
        print(f"에러: {filename}이 열려있습니다. 엑셀을 닫으세요.")
        return

    # 2. 리스트 순회 시작
    for res_query in restaurant_list:
        try:
            print(f"\n>>> [{res_query}] 수집 시작...")
            # 직접 검색 URL로 이동
            driver.get(f"https://map.naver.com/p/search/{res_query}")
            time.sleep(4) # 로딩 대기

            # 상세페이지(entryIframe) 진입 시도 (목록이 뜨는 경우 클릭)
            try:
                driver.switch_to.frame("searchIframe")
                items = driver.find_elements(By.CSS_SELECTOR, "li.UEzoS a.YTJkH")
                if items:
                    items[0].click()
                    time.sleep(2)
            except:
                # searchIframe이 없거나 목록이 없으면 바로 entryIframe이 뜬 것으로 간주
                pass

            # 메인 컨텍스트로 복귀 후 entryIframe으로 전환
            driver.switch_to.default_content()
            time.sleep(1)
            driver.switch_to.frame("entryIframe")

            # --- 데이터 추출: 식당 이름 ---
            res_name = res_query # 기본값은 검색어
            try:
                res_name = driver.find_element(By.CSS_SELECTOR, "span.GHAhO, span.Fc1rA").text
            except: pass

            # --- 데이터 추출: 업체 사진 4개 ---
            business_photos = ["", "", "", ""]
            try:
                # 사진 탭 찾기
                tabs = driver.find_elements(By.CSS_SELECTOR, "a.tpj9w")
                for tab in tabs:
                    if "사진" in tab.text:
                        tab.click()
                        time.sleep(1)
                        # '업체' 서브탭 클릭
                        sub_tabs = driver.find_elements(By.CSS_SELECTOR, "div.XHruq")
                        for sub in sub_tabs:
                            if "업체" in sub.text:
                                sub.find_element(By.XPATH, "..").click()
                                time.sleep(1)
                                break
                        break
                # 사진 이미지들 수집
                photo_elements = driver.find_elements(By.CSS_SELECTOR, "div.uDR4i img.K0PDV, div.Nd2nM img.K0PDV")
                for idx, img in enumerate(photo_elements[:4]):
                    business_photos[idx] = img.get_attribute("src")
            except: pass

            # --- 데이터 추출: 메뉴 ---
            menu_list = []
            try:
                tabs = driver.find_elements(By.CSS_SELECTOR, "a.tpj9w")
                for tab in tabs:
                    if "메뉴" in tab.text:
                        tab.click()
                        time.sleep(1)
                        menus = driver.find_elements(By.CSS_SELECTOR, "li.E2jtL, li.g9vPa")
                        menu_list = [m.text.replace("\n", " ") for m in menus[:5]]
                        break
            except: pass

            # --- 데이터 추출: 리뷰 및 사진 세트 (10개) ---
            review_sets = []
            try:
                tabs = driver.find_elements(By.CSS_SELECTOR, "a.tpj9w")
                for tab in tabs:
                    if "리뷰" in tab.text:
                        tab.click()
                        time.sleep(2)
                        break
                
                # 스크롤 및 더보기
                for _ in range(2):
                    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                    try: 
                        driver.find_element(By.CSS_SELECTOR, "a.fvwqf").click()
                        time.sleep(1)
                    except: pass

                reviews_li = driver.find_elements(By.CSS_SELECTOR, "li.EjjAW, li.place_apply_pui")
                for r_li in reviews_li[:10]:
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", r_li)
                    time.sleep(0.5)
                    
                    content = ""
                    try: content = r_li.find_element(By.CSS_SELECTOR, "div.pui__vn15t2").text.replace("\n", " ")
                    except: pass

                    r_photos = []
                    try:
                        imgs = r_li.find_elements(By.CSS_SELECTOR, "div.HH5sZ img.K0PDV, img[alt='방문자리뷰사진']")
                        for img in imgs:
                            src = img.get_attribute("src")
                            if src and "pup-review-phinf" in src:
                                r_photos.append(src)
                            if len(r_photos) >= 4: break
                    except: pass
                    
                    review_sets.append(content)
                    review_sets.append(" | ".join(r_photos))
            except: pass

            # 빈칸 채우기
            while len(review_sets) < 20: review_sets.append("")

            # 파일 기록
            writer.writerow([res_name, " / ".join(menu_list)] + business_photos + review_sets)
            f.flush()
            print(f"   ㄴ [{res_name}] 수집 완료!")

        except Exception as e:
            print(f"   ㄴ [{res_query}] 처리 중 오류 발생: {e}")
            continue

    f.close()
    print(f"\n모든 식당({len(restaurant_list)}개) 수집 완료!")

# 실행
crawl_specific_list(target_restaurants)
driver.quit()