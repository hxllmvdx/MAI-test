from bs4 import BeautifulSoup
import requests as req
from config import Config
import pandas as pd
from re import search
from backend.database import engine

config = Config(_env_file='../.env')
first_lvl = [i.lower() for i in config.first_lvl]
second_lvl = [i.lower() for i in config.second_lvl]
third_lvl = [i.lower() for i in config.third_lvl]
months_urls = config.months_urls
subjects_urls = config.subjects_urls


def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False


def get_subjects(url: str, all_name_university: list):
    result = dict()
    temp = dict()

    nt = req.get(url)
    university = BeautifulSoup(nt.text, 'html.parser')

    all_links = university.find_all('a')
    for link in all_links:
        for name in all_name_university:
            if not link.text or is_number(link.text):
                break
            if search(rf'\b{link.text.lower()}\b', name.lower()):
                nt1 = req.get(link['href'])
                university_site = BeautifulSoup(nt1.text, 'html.parser')
                subjects_list_dirty = university_site.find_all("div", class_="su-spoiler-title")[:-3]
                subjects_list_clear = []

                for subjects in subjects_list_dirty:
                    subjects_list_clear.append(subjects.text)
                if 'Вступление' in subjects_list_clear:
                    subjects_list_clear.remove('Вступление')
                if 'Классика' in subjects_list_clear:
                    subjects_list_clear.remove('Классика')

                try:
                    if 'Подготовка' in university_site.find("div", class_="su-tabs-nav").text:
                        temp[name] = f"{subjects_list_clear}".replace('\'', "\"")
                    else:
                        temp[name] = "-"
                except:
                    pass

    for name in all_name_university:
        if name not in temp:
            temp[name] = "-"

    for k, v in temp.items():
        result['title'] = result.get('title', []) + [k]
        result['subjects'] = result.get('subjects', []) + [v]

    return result


def get_months_olimp():
    months = {'title': []}

    for url in months_urls.values():
        resp = req.get(url)
        soup = BeautifulSoup(resp.text, 'html.parser')

        data1 = soup.find_all("td", class_="day-with-date weekend has-events")
        data2 = soup.find_all("td", class_="day-with-date has-events")
        data = data1 + data2

        #разбор по дням
        for i in data:
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

                    #распределение по уровням:
                    if university_name.lower() in first_lvl:
                        level = '1'
                    elif university_name.lower()  in second_lvl:
                        level = '2'
                    elif university_name.lower()  in third_lvl:
                        level = '3'
                    else:
                        level = '-'

                    name = full_name[p].text if p < len(full_name) else "Нет данных"

                    dates = (date[p].text if p < len(date) else "Нет данных").split('-')
                    start_date = dates[0].strip()
                    end_date = dates[0].strip() if len(dates) == 1 else dates[1].strip()

                    if name not in months['title']:
                        months['title'] = months.get('title', []) + [name.strip()]
                        months['duration'] = months.get('duration', []) + [time[p].text.strip() if p < len(time) else "Нет данных"]
                        months['start_date'] = months.get('start_date', []) + [start_date]
                        months['end_date'] = months.get('end_date', []) + [end_date]
                        months['registration_link'] = months.get('registration_link', []) + [url_text.strip()]
                        months['university'] = months.get('university', []) + [university_name.strip()]
                        months['level'] = months.get('level', []) + [level]

                except Exception as e:
                    print(f"Ошибка при обработке ссылки {link}: {str(e)}")
                    continue

    return months, months['title']


def upload_to_db():
    months = get_months_olimp()
    months_df = pd.DataFrame(months[0])
    months_df = months_df.sort_values(by='title', ascending=False)
    months_df = months_df.reset_index(drop=True)

    subjects = get_subjects(subjects_urls, months[1])
    subjects_df = pd.DataFrame(subjects)
    subjects_df = subjects_df.sort_values(by='title', ascending=False)
    subjects_df = subjects_df.drop(columns='title')
    subjects_df = subjects_df.reset_index(drop=True)

    df = pd.concat([months_df, subjects_df], axis=1)
    df = df.dropna()
    df['id'] = list(range(len(df)))

    df.to_sql(
        name='olympiads',
        con=engine,
        if_exists='replace',
        index=False
    )


upload_to_db()