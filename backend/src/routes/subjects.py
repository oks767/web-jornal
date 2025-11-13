from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from dependencies import get_current_user
from models import User, Subject
from schemas import  SubjectCreate, SubjectResponse


router = APIRouter(prefix="/subjects", tags=["entries"])


@router.post("/", response_model=SubjectResponse)
def create_subject(
    subject: SubjectCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    existing_subject = db.query(Subject).filter(
        Subject.name == subject.name,
        Subject.teacher_id == current_user.id
    ).first()
    
    if existing_subject:
        raise HTTPException(
            status_code=400,
            detail="Subject with this name already exists"
        )
    
    new_subject = Subject(name=subject.name, teacher_id=current_user.id)
    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)
    return SubjectResponse(
        id=new_subject.id,
        name=new_subject.name,
        teacher_id=new_subject.teacher_id
    )

@router.get("/", response_model=List[SubjectResponse])
def get_subjects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subjects = db.query(Subject).filter(Subject.teacher_id == current_user.id).all()
    return [SubjectResponse(id=s.id, name=s.name, teacher_id=s.teacher_id) for s in subjects]

@router.delete("/{subject_id}")
def delete_subject(
    subject_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.teacher_id == current_user.id
    ).first()
    
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    db.delete(subject)
    db.commit()
    return {"message": "Subject deleted successfully"}