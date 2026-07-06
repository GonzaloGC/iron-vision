from typing import Optional

from sqlalchemy.orm import Session

from app.models.orm_models import Equipment


class EquipmentService:
    @staticmethod
    def list_by_user(user_id: int, db: Session) -> list[Equipment]:
        return db.query(Equipment).filter(Equipment.user_id == user_id).all()

    @staticmethod
    def create(user_id: int, data: dict, db: Session) -> Equipment:
        equipment = Equipment(user_id=user_id, **data)
        db.add(equipment)
        db.commit()
        db.refresh(equipment)
        return equipment

    @staticmethod
    def update(equipment_id: int, user_id: int, data: dict, db: Session) -> Optional[Equipment]:
        equipment = db.query(Equipment).filter(
            Equipment.id == equipment_id,
            Equipment.user_id == user_id  # <-- Validación de seguridad
        ).first()
        if not equipment:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(equipment, key, value)
        db.commit()
        db.refresh(equipment)
        return equipment

    @staticmethod
    def delete(equipment_id: int, user_id: int, db: Session) -> bool:
        equipment = db.query(Equipment).filter(
            Equipment.id == equipment_id,
            Equipment.user_id == user_id  # <-- Validación de seguridad
        ).first()
        if not equipment:
            return False
        db.delete(equipment)
        db.commit()
        return True
