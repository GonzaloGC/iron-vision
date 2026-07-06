from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class EquipmentCreate(BaseModel):
    name: str = Field(..., max_length=100)
    type: str = Field(default="other")
    weight_kg: float = Field(default=0.0)
    quantity: int = Field(default=1, ge=1)
    notes: Optional[str] = None


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    weight_kg: Optional[float] = None
    quantity: Optional[int] = None
    notes: Optional[str] = None


class EquipmentResponse(BaseModel):
    id: int
    user_id: int
    name: str
    type: str
    weight_kg: float
    quantity: int
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
