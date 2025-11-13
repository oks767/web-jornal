from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from models import User, Base

from services import get_password_hash
from database import SessionLocal, engine
from auth import router as auth_router

from routes.entries import router as entries_router
from routes.classes import router as classes_router, classes_with_students_router
from routes.students import router as students_router
from routes.subjects import router as subjects_router
from routes.shedules import router as schedules_router

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Подключаем роутеры
app.include_router(auth_router)
app.include_router(entries_router)
app.include_router(classes_router)
app.include_router(students_router)
app.include_router(subjects_router)
app.include_router(schedules_router)
app.include_router(classes_with_students_router)


# Функция для создания таблиц
def create_tables():
    print("Создание таблиц базы данных...")
    Base.metadata.create_all(bind=engine)
    print("Таблицы успешно созданы!")

# Упрощенная функция для создания тестового пользователя
def create_test_user(db: Session):
    try:
        # Простая проверка - пытаемся найти любого пользователя
        user = db.query(User).first()
        if not user:
            # Создаем тестового пользователя
            test_user = User(
                username="test",
                email="test@example.com",
                hashed_password=get_password_hash("test123"),
                is_active=True
            )
            db.add(test_user)
            db.commit()
            print("Тестовый пользователь создан: test/test123")
        else:
            print("Пользователи уже существуют в базе")
    except Exception as e:
        print(f"Ошибка при создании тестового пользователя: {e}")
        # Продолжаем работу даже если не удалось создать тестового пользователя


# Событие при старте приложения
@app.on_event("startup")
def startup_event():
    # Создаем таблицы
    create_tables()
    
    # Создаем тестового пользователя
    db = SessionLocal()
    try:
        create_test_user(db)
    except Exception as e:
        print(f"Ошибка при старте: {e}")
    finally:
        db.close()




# Упрощенная функция для создания тестового пользователя
def create_test_user(db: Session):
    try:
        # Проверяем, есть ли уже пользователь test
        user = db.query(User).filter(User.username == "test").first()
        if not user:
            # Создаем тестового пользователя
            test_user = User(
                username="test",
                email="test@example.com",
                hashed_password=get_password_hash("test123"),
                is_active=True
            )
            db.add(test_user)
            db.commit()
            print("Тестовый пользователь создан: test/test123")
        else:
            print("естовый пользователь уже существует")
            
        # Выводим список всех пользователей для отладки
        users = db.query(User).all()
        print(f"Всего пользователей в базе: {len(users)}")
        for u in users:
            print(f"  - {u.username} ({u.email})")
            
    except Exception as e:
        print(f"Ошибка при создании тестового пользователя: {e}")
        # Создаем пользователя без проверки, если есть проблемы с запросами
        try:
            test_user = User(
                username="test",
                email="test@example.com",
                hashed_password=get_password_hash("test123"),
                is_active=True
            )
            db.add(test_user)
            db.commit()
            print("Тестовый пользователь создан (обходным путем)")
        except Exception as e2:
            print(f"Критическая ошибка: {e2}")



# Базовые endpoints
@app.get("/")
def read_root():
    return {"message": "Веб-журнал преподавателей"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080, reload=True)