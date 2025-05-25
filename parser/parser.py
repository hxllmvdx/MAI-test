from bs4 import BeautifulSoup
import requests as req
from config import Config

config = Config(_env_file='../.env')
first_lvl = config.first_lvl
second_lvl = config.second_lvl
third_lvl = config.third_lvl
months_urls = config.months_urls
subjects_urls = config.subjects_urls


def get_subjects(url: str):
    result = dict()

    all_name_university = first_lvl + second_lvl + third_lvl

    nt = req.get(url)
    university = BeautifulSoup(nt.text, 'html.parser')

    all_links = university.find_all('a')
    for link in all_links:
        if link.text in all_name_university:
            nt1 = req.get(link['href'])
            university_site = BeautifulSoup(nt1.text, 'html.parser')
            subjects_list_dirty = university_site.find_all("div", class_="su-spoiler-title")[:-3]
            subjects_list_clear = []

            for subjects in subjects_list_dirty:
                subjects_list_clear.append(subjects.text)

            if 'Подготовка' in university_site.find("div", class_="su-tabs-nav").text:
                result[link.text] = subjects_list_clear
            else:
                result[link.text] = None

    return result


def get_months_olimp(url: str):
    months = dict()
    resp = req.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')

    data = soup.find_all("td", class_="day-with-date weekend has-events")

    #разбор по дням 
    for i in data:
        day = i.find("div", class_="day-number").text if i.find("div", class_="day-number") else ""
        #target_div = i.find('ul', class_='events') (может потом понадобится)
        full_name = i.find_all("div", class_="event-details-title")
        time = i.find_all("div", class_="ecwd-time")
        date = i.find_all("div", class_="ecwd-date")
        
        # Получаем уникальные ссылки
        links = [a['href'] for a in i.select('ul.events a[href]')]
        unique_links = list(dict.fromkeys(links))
        
        # Для каждой ссылки делаем отдельный запрос
        for p, link in enumerate(unique_links):
            try:
                desired_site = req.get(link)
                desired_site.raise_for_status()
                site_soup = BeautifulSoup(desired_site.text, 'html.parser')
                
                # Ищем нужную информацию на второстепенном сайте
                url = site_soup.find("div", class_="ecwd-url")
                url_text = url.text.replace('\n', '').replace('\t', '') if url else "URL не найден"

                university_name = full_name[p].text.split('–')[0].strip() if p < len(full_name) else "Название не найдено"
                #real_name = full_name[p].text.split('–')[0] может потом понадобится
                key = f'{day}_{p+1}'

                #распределение по уровням
                for i in university_name.split(' '):
                    if i in first_lvl:
                        level = 'first'
                    elif i in second_lvl:
                        level = 'second'
                    elif i in third_lvl:
                        level = 'third' 
                    else:
                        level = '-'

                #закносим каждую олимпиаду в месяц
                months[key] = {
                    'name': full_name[p].text if p < len(full_name) else "Нет данных",
                    'time': time[p].text if p < len(time) else "Нет данных",
                    'date': date[p].text if p < len(date) else "Нет данных",
                    'url': url_text,
                    'university': university_name,
                    'level' : level,
                }
                
            except Exception as e:
                print(f"Ошибка при обработке ссылки {link}: {str(e)}")
                continue

    return months
