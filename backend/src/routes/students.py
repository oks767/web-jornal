from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from dependencies import get_current_user
from models import User, Class, Student
from schemas import  StudentCreate, StudentResponse


router = APIRouter(prefix="/students", tags=["entries"])


@router.post("/", response_model=StudentResponse)
def create_student(
    student: StudentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    class_ = db.query(Class).filter(Class.id == student.class_id).first()
    
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    new_student = Student(
        first_name=student.first_name,
        last_name=student.last_name,
        email=student.email,
        class_id=student.class_id
    )
    
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    student_response = StudentResponse(
        id=new_student.id,
        first_name=new_student.first_name,
        last_name=new_student.last_name,
        email=new_student.email,
        class_id=new_student.class_id,
        class_name=class_.name
    )
    return student_response

@router.get("/", response_model=List[StudentResponse])
def get_students(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    students = db.query(Student).all()
    
    result = []
    for student in students:
        class_name = ""
        if student.class_id:
            class_ = db.query(Class).filter(Class.id == student.class_id).first()
            class_name = class_.name if class_ else ""
        
        student_response = StudentResponse(
            id=student.id,
            first_name=student.first_name,
            last_name=student.last_name,
            email=student.email,
            class_id=student.class_id,
            class_name=class_name
        )
        result.append(student_response)
    return result