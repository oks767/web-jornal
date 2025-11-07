from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from database import Base

# Таблица для связи многие-ко-многим между учителями и учениками
teacher_student = Table(
    'teacher_student',
    Base.metadata,
    Column('teacher_id', Integer, ForeignKey('users.id')),
    Column('student_id', Integer, ForeignKey('students.id'))
)

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    teachers = relationship("User", secondary=teacher_student, back_populates="students")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    students = relationship("Student", secondary=teacher_student, back_populates="teachers")
    subjects = relationship("Subject", back_populates="teacher")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    teacher = relationship("User", back_populates="subjects")
    entries = relationship("JournalEntry", back_populates="subject")

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    date = Column(DateTime)
    topic = Column(String)
    attendance = Column(String)  # JSON с данными о посещаемости
    homework = Column(String)
    grades = Column(String)  # JSON с оценками
    subject = relationship("Subject", back_populates="entries")