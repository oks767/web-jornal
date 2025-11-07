from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        orm_mode = True

class SubjectCreate(BaseModel):
    name: str

class SubjectResponse(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class JournalEntryCreate(BaseModel):
    subject_id: int
    date: datetime
    topic: str
    attendance: str  # Должно быть строкой, как во фронтенде
    homework: str
    

class JournalEntryResponse(BaseModel):
    id: int
    subject_id: int
    date: datetime
    topic: str
    attendance: str
    homework: str
    subject_name: Optional[str] = None

    class Config:
        orm_mode = True

class StudentCreate(BaseModel):
    first_name: str
    last_name: str
    email: str

class StudentResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str

    class Config:
        orm_mode = True

class StudentWithSubjects(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    subjects: List[str] = []

    class Config:
        orm_mode = True

# class JournalEntryCreate(BaseModel):
#     subject_id: int
#     date: datetime
#     topic: str
#     attendance: dict  # Теперь как JSON объект
#     homework: str
#     grades: dict  # JSON объект с оценками

# class JournalEntryResponse(BaseModel):
#     id: int
#     subject_id: int
#     date: datetime
#     topic: str
#     attendance: dict
#     homework: str
#     grades: dict
#     subject_name: Optional[str] = None

#     class Config:
#         orm_mode = True