from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SetCreate(BaseModel):
    reps: Optional[int] = None
    weight_kg: Optional[float] = None


class SetResponse(BaseModel):
    id: int
    exercise_id: int
    reps: Optional[int] = None
    weight_kg: Optional[float] = None
    photo_url: Optional[str] = None
    photo_taken_at: Optional[datetime] = None
    order: int
    is_completed: int
    created_at: datetime

    class Config:
        from_attributes = True


class ExerciseCreate(BaseModel):
    name: str = Field(..., max_length=100)
    equipment_id: Optional[int] = None
    notes: Optional[str] = None


class ExerciseResponse(BaseModel):
    id: int
    workout_id: int
    name: str
    equipment_id: Optional[int] = None
    order: int
    notes: Optional[str] = None
    sets: list[SetResponse] = []

    class Config:
        from_attributes = True


class WorkoutCreate(BaseModel):
    notes: Optional[str] = None


class WorkoutResponse(BaseModel):
    id: int
    user_id: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_minutes: Optional[float] = None
    notes: Optional[str] = None
    is_completed: int
    created_at: datetime
    exercises: list[ExerciseResponse] = []

    class Config:
        from_attributes = True

