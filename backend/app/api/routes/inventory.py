from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.models.database import get_db
from app.models.orm_models import Equipment as EquipmentModel, User
from app.schemas.equipment import EquipmentCreate, EquipmentResponse, EquipmentUpdate
from app.services.equipment_service import EquipmentService

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("", response_model=list[EquipmentResponse])
def list_equipment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return EquipmentService.list_by_user(current_user.id, db)


@router.post("", response_model=EquipmentResponse, status_code=201)
def create_equipment(
    data: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return EquipmentService.create(current_user.id, data.model_dump(), db)


@router.put("/{equipment_id}", response_model=EquipmentResponse)
def update_equipment(
    equipment_id: int,
    data: EquipmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filtered = {k: v for k, v in data.model_dump().items() if v is not None}
    updated = EquipmentService.update(equipment_id, current_user.id, filtered, db)
    if not updated:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return updated


@router.delete("/{equipment_id}", status_code=204)
def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = EquipmentService.delete(equipment_id, current_user.id, db)
    if not deleted:
        raise HTTPException(status_code=404, detail="Equipment not found")
