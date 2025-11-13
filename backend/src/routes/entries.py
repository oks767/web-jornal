from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from typing import List

from database import get_db
from dependencies import get_current_user
from models import User, JournalEntry, Subject, Class
from schemas import JournalEntryCreate, JournalEntryResponse
router = APIRouter(prefix="/entries", tags=["entries"])

@router.post("/", response_model=JournalEntryResponse)
def create_entry(
    entry: JournalEntryCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    try:
        # Проверяем существование предмета и класса
        subject = db.query(Subject).filter(Subject.id == entry.subject_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        class_ = db.query(Class).filter(Class.id == entry.class_id).first()
        if not class_:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Создаем запись с сериализацией JSON
        new_entry = JournalEntry(
            subject_id=entry.subject_id,
            class_id=entry.class_id,
            date=entry.date,
            topic=entry.topic,
            attendance=json.dumps(entry.attendance) if entry.attendance else None,
            homework=entry.homework,
            grades=json.dumps(entry.grades) if entry.grades else None  # ИСПРАВЛЕНО: сериализуем grades
        )
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        
        # Создаем ответ
        return JournalEntryResponse(
            id=new_entry.id,
            subject_id=new_entry.subject_id,
            subject_name=subject.name,
            class_id=new_entry.class_id,
            class_name=class_.name,
            date=new_entry.date,
            topic=new_entry.topic,
            attendance=json.loads(new_entry.attendance) if new_entry.attendance else {},
            homework=new_entry.homework,
            grades=json.loads(new_entry.grades) if new_entry.grades else {}  # ИСПРАВЛЕНО: десериализуем grades
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating entry: {str(e)}")

@router.get("/", response_model=List[JournalEntryResponse])
def get_entries(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    entries = db.query(JournalEntry).all()
    result = []
    
    for entry in entries:
        subject_name = entry.subject.name if entry.subject else ""
        class_name = entry.class_.name if entry.class_ else ""
        
        result.append(JournalEntryResponse(
            id=entry.id,
            subject_id=entry.subject_id,
            subject_name=subject_name,
            class_id=entry.class_id,
            class_name=class_name,
            date=entry.date,
            topic=entry.topic,
            attendance=json.loads(entry.attendance) if entry.attendance else {},
            homework=entry.homework,
            grades=json.loads(entry.grades) if entry.grades else {}  # ИСПРАВЛЕНО: десериализуем grades
        ))
    
    return result

@router.get("/{entry_id}", response_model=JournalEntryResponse)
def get_entry(
    entry_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    subject_name = entry.subject.name if entry.subject else ""
    class_name = entry.class_.name if entry.class_ else ""
    
    return JournalEntryResponse(
        id=entry.id,
        subject_id=entry.subject_id,
        subject_name=subject_name,
        class_id=entry.class_id,
        class_name=class_name,
        date=entry.date,
        topic=entry.topic,
        attendance=json.loads(entry.attendance) if entry.attendance else {},
        homework=entry.homework,
        grades=json.loads(entry.grades) if entry.grades else {}  # ИСПРАВЛЕНО: десериализуем grades
    )

@router.put("/{entry_id}", response_model=JournalEntryResponse)
def update_entry(
    entry_id: int, 
    updated_entry: JournalEntryCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # Обновляем поля
    entry.subject_id = updated_entry.subject_id
    entry.class_id = updated_entry.class_id
    entry.date = updated_entry.date
    entry.topic = updated_entry.topic
    entry.attendance = json.dumps(updated_entry.attendance) if updated_entry.attendance else None
    entry.homework = updated_entry.homework
    entry.grades = json.dumps(updated_entry.grades) if updated_entry.grades else None  # ИСПРАВЛЕНО: сериализуем grades
    
    db.commit()
    db.refresh(entry)
    
    subject_name = entry.subject.name if entry.subject else ""
    class_name = entry.class_.name if entry.class_ else ""
    
    return JournalEntryResponse(
        id=entry.id,
        subject_id=entry.subject_id,
        subject_name=subject_name,
        class_id=entry.class_id,
        class_name=class_name,
        date=entry.date,
        topic=entry.topic,
        attendance=json.loads(entry.attendance) if entry.attendance else {},
        homework=entry.homework,
        grades=json.loads(entry.grades) if entry.grades else {}  # ИСПРАВЛЕНО: десериализуем grades
    )

@router.delete("/{entry_id}")
def delete_entry(
    entry_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted successfully"}