from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.models.database import get_db
from app.models.orm_models import User
from app.schemas.workout import (
    ExerciseCreate,
    ExerciseResponse,
    SetCreate,
    SetResponse,
    SetUpdate,
    WorkoutCreate,
    WorkoutResponse,
)
from app.services.workout_service import WorkoutService

router = APIRouter(prefix="/workouts", tags=["Workouts"])


@router.get("", response_model=list[WorkoutResponse])
def list_workouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return WorkoutService.list_workouts(current_user.id, db)


@router.post("", response_model=WorkoutResponse, status_code=201)
def create_workout(
    data: WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return WorkoutService.create_workout(current_user.id, data.model_dump(), db)


@router.get("/{workout_id}", response_model=WorkoutResponse)
def get_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workout = WorkoutService.get_workout_detail(workout_id, current_user.id, db)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout


@router.post("/{workout_id}/finish", response_model=WorkoutResponse)
def finish_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workout = WorkoutService.finish_workout(workout_id, current_user.id, db)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout


@router.delete("/{workout_id}", status_code=204)
def delete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = WorkoutService.delete_workout(workout_id, current_user.id, db)
    if not deleted:
        raise HTTPException(status_code=404, detail="Workout not found")


@router.post("/{workout_id}/exercises", response_model=ExerciseResponse, status_code=201)
def add_exercise(
    workout_id: int,
    data: ExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exercise = WorkoutService.add_exercise(workout_id, data.model_dump(), db)
    if not exercise:
        raise HTTPException(status_code=404, detail="Workout not found")
    return exercise


@router.post(
    "/{workout_id}/exercises/{exercise_id}/sets",
    response_model=SetResponse,
    status_code=201,
)
def add_set(
    workout_id: int,
    exercise_id: int,
    data: SetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    set_ = WorkoutService.add_set(exercise_id, data.model_dump(), db)
    if not set_:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return set_


@router.patch("/sets/{set_id}", response_model=SetResponse)
def update_set(
    set_id: int,
    data: SetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filtered = {k: v for k, v in data.model_dump().items() if v is not None}
    if not filtered:
        raise HTTPException(status_code=400, detail="No fields to update")
    updated = WorkoutService.update_set(set_id, filtered, db)
    if not updated:
        raise HTTPException(status_code=404, detail="Set not found")
    return updated


@router.delete("/sets/{set_id}", status_code=204)
def delete_set(
    set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = WorkoutService.delete_set(set_id, db)
    if not deleted:
        raise HTTPException(status_code=404, detail="Set not found")
