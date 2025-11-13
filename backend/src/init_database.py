from sqlalchemy import create_engine
from models import Base
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'journal.db')}"
engine = create_engine(SQLALCHEMY_DATABASE_URL)

print("Создание таблиц базы данных...")
Base.metadata.create_all(bind=engine)
print("Таблицы успешно созданы!")

# Проверим созданные таблицы
import sqlite3
conn = sqlite3.connect('journal.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Созданные таблицы:", [table[0] for table in tables])
conn.close()
