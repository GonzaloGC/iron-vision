from datetime import datetime

from pydantic import BaseModel


class DetectedEquipment(BaseModel):
    equipment_id: int
    name: str
    weight_kg: float
    quantity: int


class AnalyzeResponse(BaseModel):
    equipment_detected: list[DetectedEquipment]
    total_weight_kg: float
    workout_id: int
    exercise_id: int
    set_id: int
    photo_time: datetime
