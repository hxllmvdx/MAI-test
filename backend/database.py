from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import Config

config = Config(_env_file='../.env')
db_url = config.db_url

engine = create_engine(db_url) #, echo=True
Session = sessionmaker(bind=engine)


class Base(DeclarativeBase): pass


Base.metadata.create_all(bind=engine)