from pydantic import BaseModel
from datetime import datetime

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
    attendance: str
    homework: str

class JournalEntryResponse(BaseModel):
    id: int
    subject_id: int
    date: datetime
    topic: str
    attendance: str
    homework: str

    class Config:
        orm_mode = True