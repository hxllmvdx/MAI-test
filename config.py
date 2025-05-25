from pydantic_settings import BaseSettings

class Config(BaseSettings):
    # for parser
    first_lvl: list[str]
    second_lvl: list[str]
    third_lvl: list[str]
    months_urls: dict
    subjects_urls: str
    # database
    db_url: str
