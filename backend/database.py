from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

engine = create_engine("sqlite:////home/kerbzyxer/olimpiads/backend/database.db") #, echo=True
Session = sessionmaker(bind=engine)

class Base(DeclarativeBase): pass

Base.metadata.create_all(bind=engine)