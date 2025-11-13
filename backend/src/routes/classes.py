from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from dependencies import get_current_user
from models import User, Class, Student
from schemas import  ClassCreate, ClassResponse, ClassWithStudents, StudentResponse


router = APIRouter(prefix="/classes", tags=["entries"])
@router.post("/", response_model=ClassResponse)
def create_class(
    class_data: ClassCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_class = db.query(Class).filter(Class.name == class_data.name).first()
    if existing_class:
        raise HTTPException(status_code=400, detail="Class with this name already exists")
    
    new_class = Class(name=class_data.name)
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class

@router.get("/", response_model=List[ClassResponse])
def get_classes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    classes = db.query(Class).all()
    return classes


classes_with_students_router = APIRouter(tags=["classes"])

# Endpoint для получения классов с учениками
@classes_with_students_router.get("/classes-with-students", response_model=List[ClassWithStudents])
def get_classes_with_students(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    classes = db.query(Class).all()
    
    result = []
    for class_ in classes:
        students_list = db.query(Student).filter(Student.class_id == class_.id).all()
        
        class_data = ClassWithStudents(
            id=class_.id,
            name=class_.name,
            students=[StudentResponse(
                id=student.id,
                first_name=student.first_name,
                last_name=student.last_name,
                email=student.email,
                class_id=student.class_id,
                class_name=class_.name
            ) for student in students_list]
        )
        result.append(class_data)
    return result