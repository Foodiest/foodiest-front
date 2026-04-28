import time
import csv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager

# 브라우저 설정
chrome_options = Options()
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

# 누락된 식당 리스트
target_restaurants = [
    "도원 중식뷔페"
    
    
]

def crawl_specific_restaurants(restaurant_list, filename="restaurant_retry_data.csv"):
    # 헤더 설정
    header = ['식당이름', '메뉴정보', '업체사진1', '업체사진2', '업체사진3', '업체사진4']
    for i in range(1, 11):
        header.append(f'리뷰{i}_내용')
        header.append(f'리뷰{i}_사진링크')
    
    try:
        f = open(filename, 'w', encoding='utf-8-sig', newline='')
        writer = csv.writer(f)
        writer.writerow(header)
    except PermissionError:
        print(f"에러: {filename}이 열려있습니다. 닫고 다시 실행하세요.")
        return

    for res_query in restaurant_list:
        try:
            print(f"\n>>> [{res_query}] 수집 시작...")
            # 1. 네이버 지도 접속 및 개별 검색
            driver.get(f"https://map.naver.com/p/search/{res_query}")
            time.sleep(3)

            # 검색 결과가 바로 상세페이지(entryIframe)로 뜨는 경우와 목록으로 뜨는 경우 대응
            try:
                driver.switch_to.frame("searchIframe")
                # 목록에서 첫 번째 항목 클릭
                first_result = driver.find_element(By.CSS_SELECTOR, "li.UEzoS a.YTJkH")
                first_result.click()
                time.sleep(2)
            except:
                # 목록 없이 바로 상세페이지가 뜬 경우
                pass

            driver.switch_to.default_content()
            driver.switch_to.frame("entryIframe")

            # --- 데이터 추출 로직 시작 ---
            # 1. 업체 사진 4개
            business_photos = ["", "", "", ""]
            try:
                tabs = driver.find_elements(By.CSS_SELECTOR, "a.tpj9w")
                for tab in tabs:
                    if "사진" in tab.text:
                        tab.click()
                        time.sleep(1)
                        sub_tabs = driver.find_elements(By.CSS_SELECTOR, "div.XHruq")
                        for sub in sub_tabs:
                            if "업체" in sub.text:
                                sub.find_element(By.XPATH, "..").click()
                                time.sleep(1)
                                break
                        photo_elements = driver.find_elements(By.CSS_SELECTOR, "div.Nd2nM img.K0PDV")
                        for idx, img in enumerate(photo_elements[:4]):
                            business_photos[idx] = img.get_attribute("src")
                        break
            except: pass

            # 2. 메뉴 정보
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

            # 3. 리뷰 & 리뷰별 사진 (10세트)
            review_sets = []
            try:
                tabs = driver.find_elements(By.CSS_SELECTOR, "a.tpj9w")
                for tab in tabs:
                    if "리뷰" in tab.text:
                        tab.click()
                        time.sleep(1.5)
                        break
                
                # 스크롤 및 더보기
                for _ in range(2):
                    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                    try: driver.find_element(By.CSS_SELECTOR, "a.fvwqf").click(); time.sleep(1)
                    except: pass

                reviews_li = driver.find_elements(By.CSS_SELECTOR, "li.EjjAW, li.place_apply_pui")
                for r_li in reviews_li[:10]:
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", r_li)
                    time.sleep(0.5)
                    
                    try: # 텍스트 더보기
                        m_btn = r_li.find_element(By.CSS_SELECTOR, "a[data-pui-click-code='rvshowmore']")
                        driver.execute_script("arguments[0].click();", m_btn)
                    except: pass

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

            while len(review_sets) < 20: review_sets.append("")

            # 저장
            writer.writerow([res_query, " / ".join(menu_list)] + business_photos + review_sets)
            f.flush()
            print(f"   ㄴ 완료!")

        except Exception as e:
            print(f"   ㄴ 오류 발생({res_query}): {e}")
            continue

    f.close()
    print(f"\n재크롤링 완료! 파일: {filename}")

# 실행
crawl_specific_restaurants(target_restaurants)
driver.quit()