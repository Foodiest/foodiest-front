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

def crawl_restaurant_expert(url, filename="restaurant_final_complete.csv"):
    driver.get(url)
    time.sleep(3)

    # 헤더 설정: 식당이름, 메뉴, 업체사진(4개), 그리고 리뷰 10세트(내용+사진)
    header = ['식당이름', '메뉴정보', '업체사진1', '업체사진2', '업체사진3', '업체사진4']
    for i in range(1, 11):
        header.append(f'리뷰{i}_내용')
        header.append(f'리뷰{i}_사진링크')
    
    try:
        f = open(filename, 'w', encoding='utf-8-sig', newline='')
    except PermissionError:
        print(f"에러: {filename}이 열려있습니다. 엑셀을 닫고 다시 실행하세요.")
        return

    writer = csv.writer(f)
    writer.writerow(header)
    f.flush()

    count = 0
    max_items = 25

    while count < max_items:
        driver.switch_to.default_content()
        driver.switch_to.frame("searchIframe")
        
        scroll_container = driver.find_element(By.ID, "_pcmap_list_scroll_container")
        for _ in range(3):
            driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", scroll_container)
            time.sleep(1)

        restaurants = driver.find_elements(By.CSS_SELECTOR, "li.UEzoS")

        for i in range(len(restaurants)):
            if count >= max_items: break
            
            try:
                driver.switch_to.default_content()
                driver.switch_to.frame("searchIframe")
                items = driver.find_elements(By.CSS_SELECTOR, "li.UEzoS")
                if i >= len(items): break

                res_name = items[i].find_element(By.CSS_SELECTOR, "span.TYaxT").text
                print(f"[{count+1}/{max_items}] {res_name} 수집 중...")
                
                items[i].find_element(By.CSS_SELECTOR, "a.YTJkH").click()
                time.sleep(2)

                driver.switch_to.default_content()
                driver.switch_to.frame("entryIframe")

                # --- 1. '업체' 사진 4개 추출 ---
                business_photos = ["", "", "", ""]
                try:
                    tabs = driver.find_elements(By.CSS_SELECTOR, "a.tpj9w")
                    for tab in tabs:
                        if "사진" in tab.text:
                            tab.click()
                            time.sleep(1)
                            break
                    
                    sub_tabs = driver.find_elements(By.CSS_SELECTOR, "div.XHruq")
                    for sub in sub_tabs:
                        if "업체" in sub.text:
                            sub.find_element(By.XPATH, "..").click()
                            time.sleep(1.5)
                            break
                    
                    photo_elements = driver.find_elements(By.CSS_SELECTOR, "div.Nd2nM img.K0PDV")
                    for idx, img in enumerate(photo_elements[:4]):
                        src = img.get_attribute("src")
                        if src: business_photos[idx] = src
                except: pass

                # --- 2. 메뉴 추출 ---
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

                # --- 3. 리뷰 & 리뷰별 사진 추출 (각 10개 세트 유지) ---
                review_sets = []
                try:
                    tabs = driver.find_elements(By.CSS_SELECTOR, "a.tpj9w")
                    for tab in tabs:
                        if "리뷰" in tab.text:
                            tab.click()
                            time.sleep(1.5)
                            break
                    
                    # 더보기 클릭 (10개 확보용)
                    try:
                        for _ in range(2):
                            driver.find_element(By.CSS_SELECTOR, "a.fvwqf").click()
                            time.sleep(1)
                    except: pass

                    reviews_li = driver.find_elements(By.CSS_SELECTOR, "li.EjjAW, li.place_apply_pui") 
                    for r_li in reviews_li[:10]:
                        # 사진 로딩을 위한 스크롤
                        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", r_li)
                        time.sleep(0.5)

                        # 내용 추출
                        try:
                            content = r_li.find_element(By.CSS_SELECTOR, "div.pui__vn15t2 a, div.pui__vn15t2").text.replace("\n", " ")
                        except: content = ""
                        
                        # 리뷰별 사진 추출
                        r_photos = []
                        try:
                            imgs = r_li.find_elements(By.CSS_SELECTOR, "div.HH5sZ img.K0PDV, img[alt='방문자리뷰사진']")
                            for img in imgs:
                                src = img.get_attribute("src")
                                if src and "pup-review-phinf" in src:
                                    if src not in r_photos: r_photos.append(src)
                                if len(r_photos) >= 4: break 
                        except: pass
                        
                        review_sets.append(content)
                        review_sets.append(" | ".join(r_photos))
                except: pass

                while len(review_sets) < 20:
                    review_sets.append("")

                # 최종 저장 행 구성
                row = [res_name, " / ".join(menu_list)] + business_photos + review_sets
                writer.writerow(row)
                f.flush()
                count += 1
                print(f"   ㄴ 완료! ({count}/{max_items})")

            except Exception as e:
                print(f"   ㄴ 오류 발생: {e}")
                continue

    f.close()
    print(f"\n작업 완료! {filename} 파일을 확인하세요.")

# 실행
target_url = "https://map.naver.com/p/search/%EC%98%A4%EB%A6%AC%EC%97%AD%20%EC%9D%8C%EC%8B%9D%EC%A0%90"
crawl_restaurant_expert(target_url)
driver.quit()