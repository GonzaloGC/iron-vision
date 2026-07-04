import os

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.models.database import get_db
from app.models.orm_models import Equipment as EquipmentModel, User
from app.schemas.vision import AnalyzeResponse, DetectedEquipment
from app.services.exif_service import ExifService
from app.services.vision_service import VisionService
from app.services.workout_service import WorkoutService

router = APIRouter(prefix="/vision", tags=["Vision"])


def _save_upload(file: UploadFile, upload_dir: str) -> str:
    os.makedirs(upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "photo.jpg")[1]
    filename = f"photo_{os.urandom(4).hex()}{ext}"
    filepath = os.path.join(upload_dir, filename)
    content = file.file.read()
    with open(filepath, "wb") as f:
        f.write(content)
    return filepath


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    photo_path = _save_upload(file, settings.UPLOAD_DIR)
    photo_url = f"/{settings.UPLOAD_DIR}/{os.path.basename(photo_path)}"

    photo_time = ExifService.extract_datetime(photo_path)

    equipment = db.query(EquipmentModel).filter(
        EquipmentModel.user_id == current_user.id,
    ).all()

    result = VisionService.analyze_photo(photo_path, equipment)

    workout = WorkoutService.get_or_create_active_workout(
        current_user.id, photo_time, db,
    )

    exercise = WorkoutService.get_or_create_current_exercise(
        workout.id, photo_time, db,
    )

    set_ = WorkoutService.record_set_from_photo(
        workout.id, exercise.id, result["total_weight_kg"],
        photo_url, photo_time, db,
    )

    return AnalyzeResponse(
        equipment_detected=[
            DetectedEquipment(**d) for d in result["equipment_detected"]
        ],
        total_weight_kg=result["total_weight_kg"],
        workout_id=workout.id,
        exercise_id=exercise.id,
        set_id=set_.id,
        photo_time=photo_time,
    )
