from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Dict, Any

class ClassCreate(BaseModel):
    name: str

class ClassResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes  = True

class SubjectCreate(BaseModel):
    name: str

class SubjectResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class JournalEntryCreate(BaseModel):
    subject_id: int
    class_id: int
    date: datetime
    topic: str
    attendance: Dict[str, str] = {}  # Значение по умолчанию
    homework: str
    grades: Dict[str, Any] = {}      # Значение по умолчанию

    
class JournalEntryResponse(BaseModel):
    id: int
    subject_id: int
    class_id: int
    date: datetime
    topic: str
    attendance: Dict[str, str]
    homework: str
    grades: Dict[str, Any]
    subject_name: Optional[str] = None
    class_name: Optional[str] = None

    class Config:
        from_attributes = True

class StudentCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    class_id: int

class StudentResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    class_id: int
    class_name: Optional[str] = None

    class Config:
        from_attributes = True

class ClassWithStudents(BaseModel):
    id: int
    name: str
    students: List[StudentResponse] = []

    class Config:
        from_attributes = True

class StudentWithSubjects(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    subjects: List[str] = []

    class Config:
        orm_mode = True

class ScheduleCreate(BaseModel):
    class_id: int
    subject_id: int
    day_of_week: int
    lesson_number: int
    classroom: Optional[str] = None

class ScheduleResponse(BaseModel):
    id: int
    class_id: int
    subject_id: int
    day_of_week: int
    lesson_number: int
    classroom: Optional[str] = None
    class_name: Optional[str] = None
    subject_name: Optional[str] = None

    class Config:
        from_attributes = True

class DaySchedule(BaseModel):
    day_of_week: int
    day_name: str
    lessons: List[ScheduleResponse] = []

class WeekSchedule(BaseModel):
    start_date: str
    end_date: str
    days: List[DaySchedule] = []