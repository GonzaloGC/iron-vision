import logging
import os
import re

from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.models.database import get_db
from app.models.orm_models import Equipment as EquipmentModel, User
from app.schemas.vision import AnalyzeResponse, DetectedEquipment
from app.services.exif_service import ExifService
from app.services.vision_service import VisionService
from app.services.workout_service import WorkoutService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/vision", tags=["Vision"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}
MAX_UPLOAD_SIZE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def _sanitize_filename(filename: str) -> str:
    return re.sub(r"[^\w\\.\\-]", "_", filename)


def _save_upload(content: bytes, upload_dir: str, original_filename: str = "photo.jpg") -> str:
    os.makedirs(upload_dir, exist_ok=True)
    safe_filename = _sanitize_filename(original_filename)
    ext = os.path.splitext(safe_filename)[1]
    filename = f"photo_{os.urandom(4).hex()}{ext}"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        f.write(content)
    return filepath


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_photo(
    file: UploadFile = File(...),
    reps: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logger.info("Analyzing photo for user %d: %s", current_user.id, file.filename)

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not allowed. Allowed: {', '.join(ALLOWED_TYPES)}",
        )

    content = file.file.read()
    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max allowed: {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    photo_path = _save_upload(content, settings.UPLOAD_DIR, file.filename or "photo.jpg")
    photo_url = f"/{settings.UPLOAD_DIR}/{os.path.basename(photo_path)}"

    photo_time = ExifService.extract_datetime(photo_path)
    logger.debug("Photo timestamp: %s", photo_time)

    equipment = db.query(EquipmentModel).filter(
        EquipmentModel.user_id == current_user.id,
    ).all()
    logger.debug("User has %d equipment items", len(equipment))

    result = VisionService.analyze_photo(photo_path, equipment)

    workout = WorkoutService.get_or_create_active_workout(
        current_user.id, photo_time, db,
    )

    exercise = WorkoutService.get_or_create_current_exercise(
        workout.id, photo_time, db, exercise_name=result.get("exercise_name", ""),
    )

    set_ = WorkoutService.record_set_from_photo(
        workout.id, exercise.id, result["total_weight_kg"],
        photo_url, photo_time, db, reps=reps,
    )

    logger.info(
        "Photo analysis complete: workout=%d exercise=%d set=%d total=%.1fkg",
        workout.id, exercise.id, set_.id, result["total_weight_kg"],
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
