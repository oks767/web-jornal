# routers/schedules.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from dependencies import get_current_user
from models import User, Schedule, Subject, Class
from schemas import ScheduleCreate, ScheduleResponse, WeekSchedule, DaySchedule

router = APIRouter(prefix="/schedules", tags=["schedules"])

@router.post("/", response_model=ScheduleResponse)
def create_schedule(
    schedule: ScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Проверяем существование предмета
    subject = db.query(Subject).filter(
        Subject.id == schedule.subject_id,
        Subject.teacher_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Предмета не существует")
    
    # Проверяем существование класса
    class_ = db.query(Class).filter(Class.id == schedule.class_id).first()
    if not class_:
        raise HTTPException(status_code=404, detail="Такого класса не существует")
    
    # Проверяем, нет ли уже расписания на это время
    existing_schedule = db.query(Schedule).filter(
        Schedule.teacher_id == current_user.id,
        Schedule.day_of_week == schedule.day_of_week,
        Schedule.lesson_number == schedule.lesson_number,
        Schedule.class_id == schedule.class_id
    ).first()
    
    if existing_schedule:
        raise HTTPException(
            status_code=400,
            detail="На это время уже создано расписание"
        )
    
    # Создаем расписание
    new_schedule = Schedule(
        teacher_id=current_user.id,
        subject_id=schedule.subject_id,
        class_id=schedule.class_id,
        day_of_week=schedule.day_of_week,
        lesson_number=schedule.lesson_number
    )
    
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    
    # Создаем ответ
    return ScheduleResponse(
        id=new_schedule.id,
        teacher_id=new_schedule.teacher_id,
        teacher_name=current_user.username,
        subject_id=new_schedule.subject_id,
        subject_name=subject.name,
        class_id=new_schedule.class_id,
        class_name=class_.name,
        day_of_week=new_schedule.day_of_week,
        lesson_number=new_schedule.lesson_number
    )

@router.get("/", response_model=List[ScheduleResponse])
def get_my_schedules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    schedules = db.query(Schedule).filter(Schedule.teacher_id == current_user.id).all()
    
    result = []
    for schedule in schedules:
        subject_name = schedule.subject.name if schedule.subject else ""
        class_name = schedule.class_.name if schedule.class_ else ""
        teacher_name = current_user.username
        
        result.append(ScheduleResponse(
            id=schedule.id,
            teacher_id=schedule.teacher_id,
            teacher_name=teacher_name,
            subject_id=schedule.subject_id,
            subject_name=subject_name,
            class_id=schedule.class_id,
            class_name=class_name,
            day_of_week=schedule.day_of_week,
            lesson_number=schedule.lesson_number
        ))
    
    return result

@router.get("/week", response_model=WeekSchedule)
def get_week_schedule(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    schedules = db.query(Schedule).filter(Schedule.teacher_id == current_user.id).all()
    
    # Создаем структуру недельного расписания
    week_schedule = WeekSchedule(
        monday=DaySchedule(lessons=[]),
        tuesday=DaySchedule(lessons=[]),
        wednesday=DaySchedule(lessons=[]),
        thursday=DaySchedule(lessons=[]),
        friday=DaySchedule(lessons=[]),
        saturday=DaySchedule(lessons=[]),
        sunday=DaySchedule(lessons=[])
    )
    
    days_mapping = {
        0: week_schedule.monday.lessons,
        1: week_schedule.tuesday.lessons,
        2: week_schedule.wednesday.lessons,
        3: week_schedule.thursday.lessons,
        4: week_schedule.friday.lessons,
        5: week_schedule.saturday.lessons,
        6: week_schedule.sunday.lessons
    }
    
    for schedule in schedules:
        subject_name = schedule.subject.name if schedule.subject else ""
        class_name = schedule.class_.name if schedule.class_ else ""
        
        schedule_response = ScheduleResponse(
            id=schedule.id,
            teacher_id=schedule.teacher_id,
            teacher_name=current_user.username,
            subject_id=schedule.subject_id,
            subject_name=subject_name,
            class_id=schedule.class_id,
            class_name=class_name,
            day_of_week=schedule.day_of_week,
            lesson_number=schedule.lesson_number
        )
        
        if schedule.day_of_week in days_mapping:
            days_mapping[schedule.day_of_week].append(schedule_response)
    
    # Сортируем уроки по номеру для каждого дня
    for day_lessons in days_mapping.values():
        day_lessons.sort(key=lambda x: x.lesson_number)
    
    return week_schedule

@router.get("/class/{class_id}", response_model=List[ScheduleResponse])
def get_class_schedule(
    class_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    schedules = db.query(Schedule).filter(
        Schedule.teacher_id == current_user.id,
        Schedule.class_id == class_id
    ).all()
    
    result = []
    for schedule in schedules:
        subject_name = schedule.subject.name if schedule.subject else ""
        class_name = schedule.class_.name if schedule.class_ else ""
        
        result.append(ScheduleResponse(
            id=schedule.id,
            teacher_id=schedule.teacher_id,
            teacher_name=current_user.username,
            subject_id=schedule.subject_id,
            subject_name=subject_name,
            class_id=schedule.class_id,
            class_name=class_name,
            day_of_week=schedule.day_of_week,
            lesson_number=schedule.lesson_number
        ))
    
    return result

@router.get("/{schedule_id}", response_model=ScheduleResponse)
def get_schedule(
    schedule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.teacher_id == current_user.id
    ).first()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Расписание не найдено")
    
    subject_name = schedule.subject.name if schedule.subject else ""
    class_name = schedule.class_.name if schedule.class_ else ""
    
    return ScheduleResponse(
        id=schedule.id,
        teacher_id=schedule.teacher_id,
        teacher_name=current_user.username,
        subject_id=schedule.subject_id,
        subject_name=subject_name,
        class_id=schedule.class_id,
        class_name=class_name,
        day_of_week=schedule.day_of_week,
        lesson_number=schedule.lesson_number
    )

@router.put("/{schedule_id}", response_model=ScheduleResponse)
def update_schedule(
    schedule_id: int,
    updated_schedule: ScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.teacher_id == current_user.id
    ).first()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Расписание не найдено")
    
    # Проверяем существование предмета
    subject = db.query(Subject).filter(
        Subject.id == updated_schedule.subject_id,
        Subject.teacher_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Предмет существует")
    
    # Проверяем существование класса
    class_ = db.query(Class).filter(Class.id == updated_schedule.class_id).first()
    if not class_:
        raise HTTPException(status_code=404, detail="Класс не найден")
    
    # Проверяем конфликты расписания (исключая текущую запись)
    existing_schedule = db.query(Schedule).filter(
        Schedule.teacher_id == current_user.id,
        Schedule.day_of_week == updated_schedule.day_of_week,
        Schedule.lesson_number == updated_schedule.lesson_number,
        Schedule.class_id == updated_schedule.class_id,
        Schedule.id != schedule_id
    ).first()
    
    if existing_schedule:
        raise HTTPException(
            status_code=400,
            detail="Schedule already exists for this time and class"
        )
    
    # Обновляем расписание
    schedule.subject_id = updated_schedule.subject_id
    schedule.class_id = updated_schedule.class_id
    schedule.day_of_week = updated_schedule.day_of_week
    schedule.lesson_number = updated_schedule.lesson_number
    
    db.commit()
    db.refresh(schedule)
    
    return ScheduleResponse(
        id=schedule.id,
        teacher_id=schedule.teacher_id,
        teacher_name=current_user.username,
        subject_id=schedule.subject_id,
        subject_name=subject.name,
        class_id=schedule.class_id,
        class_name=class_.name,
        day_of_week=schedule.day_of_week,
        lesson_number=schedule.lesson_number
    )

@router.delete("/{schedule_id}")
def delete_schedule(
    schedule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.teacher_id == current_user.id
    ).first()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Расписание не найдено")
    
    db.delete(schedule)
    db.commit()
    
    return {"message": "Удалено"}