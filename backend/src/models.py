from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

# Промежуточные таблицы для many-to-many отношений
teacher_classes = Table(
    'teacher_classes',
    Base.metadata,
    Column('teacher_id', Integer, ForeignKey('users.id')),
    Column('class_id', Integer, ForeignKey('classes.id'))
)

teacher_students = Table(
    'teacher_students', 
    Base.metadata,
    Column('teacher_id', Integer, ForeignKey('users.id')),
    Column('student_id', Integer, ForeignKey('students.id'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Отношения
    subjects = relationship("Subject", back_populates="teacher")
    user_classes = relationship("Class", secondary=teacher_classes, back_populates="teachers")
    students = relationship("Student", secondary=teacher_students, back_populates="teachers")


class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))  # Убедитесь, что этот ForeignKey есть
    
    journal_entries = relationship("JournalEntry", back_populates="subject")
    schedules = relationship("Schedule", back_populates="subject")
    teacher = relationship("User", back_populates="subjects")


class Class(Base):
    __tablename__ = "classes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    
    # Отношения
    teachers = relationship("User", secondary=teacher_classes, back_populates="user_classes")
    students = relationship("Student", back_populates="class_")
    journal_entries = relationship("JournalEntry", back_populates="class_")
    schedules = relationship("Schedule", back_populates="class_")


class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    
    # Отношения
    class_ = relationship("Class", back_populates="students")
    teachers = relationship("User", secondary=teacher_students, back_populates="students")



class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    date = Column(DateTime)
    topic = Column(String)
    attendance = Column(Text, nullable=True)  # Используем Text для больших JSON
    homework = Column(Text)
    grades = Column(Text, nullable=True)  # Используем Text для JSON
    
    # Relationships
    subject = relationship("Subject")
    class_ = relationship("Class")


class Schedule(Base):
    __tablename__ = "schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    day_of_week = Column(Integer)  # 0-6 (понедельник-воскресенье)
    lesson_number = Column(Integer)  # Номер урока
    
    teacher = relationship("User")
    subject = relationship("Subject", back_populates="schedules")
    class_ = relationship("Class", back_populates="schedules")