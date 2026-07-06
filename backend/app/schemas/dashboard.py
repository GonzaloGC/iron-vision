from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class VolumePoint(BaseModel):
    label: str
    total_volume_kg: float
    total_sets: int
    workout_count: int


class ProgressPoint(BaseModel):
    date: datetime
    weight_kg: float
    reps: Optional[int] = None
    estimated_one_rm: Optional[float] = None


class RecentWorkout(BaseModel):
    id: int
    date: datetime
    duration_minutes: Optional[float] = None
    exercise_count: int
    total_volume_kg: float
    total_sets: int
