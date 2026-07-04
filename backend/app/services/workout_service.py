import logging
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.models.orm_models import Exercise, Set, Workout

logger = logging.getLogger(__name__)


class WorkoutService:
    @staticmethod
    def get_or_create_active_workout(user_id: int, photo_time: datetime, db: Session) -> Workout:
        workout = db.query(Workout).filter(
            Workout.user_id == user_id,
            Workout.is_completed == 0,
        ).first()
        if not workout:
            buffer = timedelta(minutes=settings.WORKOUT_START_BUFFER_MINUTES)
            workout = Workout(
                user_id=user_id,
                started_at=photo_time - buffer,
            )
            db.add(workout)
            db.commit()
            db.refresh(workout)
            logger.info("Created new workout %d for user %d", workout.id, user_id)
        else:
            logger.debug("Reusing active workout %d", workout.id)
        return workout

    @staticmethod
    def get_or_create_current_exercise(
        workout_id: int,
        photo_time: datetime,
        db: Session,
        exercise_name: str = "Ejercicio",
    ) -> Exercise:
        last_exercise = db.query(Exercise).filter(
            Exercise.workout_id == workout_id,
        ).order_by(Exercise.order.desc()).first()

        if last_exercise:
            last_set = db.query(Set).filter(
                Set.exercise_id == last_exercise.id,
            ).order_by(Set.order.desc()).first()

            if last_set and last_set.photo_taken_at:
                diff_minutes = (photo_time - last_set.photo_taken_at).total_seconds() / 60
                if diff_minutes < settings.EXERCISE_IDLE_TIMEOUT_MINUTES:
                    return last_exercise

        max_order = db.query(func.max(Exercise.order)).filter(
            Exercise.workout_id == workout_id,
        ).scalar() or 0

        exercise = Exercise(
            workout_id=workout_id,
            name=exercise_name,
            order=max_order + 1,
        )
        db.add(exercise)
        db.commit()
        db.refresh(exercise)
        logger.info("Created new exercise %d in workout %d (order %d)", exercise.id, workout_id, max_order + 1)
        return exercise

    @staticmethod
    def record_set_from_photo(
        workout_id: int,
        exercise_id: int,
        weight_kg: float,
        photo_url: str,
        photo_time: datetime,
        db: Session,
        reps: Optional[int] = None,
    ) -> Set:
        max_order = db.query(func.max(Set.order)).filter(
            Set.exercise_id == exercise_id,
        ).scalar() or 0

        set_ = Set(
            exercise_id=exercise_id,
            weight_kg=weight_kg,
            photo_url=photo_url,
            photo_taken_at=photo_time,
            order=max_order + 1,
            reps=reps,
        )
        db.add(set_)
        db.commit()
        db.refresh(set_)
        logger.info("Recorded set %d (%.1f kg) in exercise %d", set_.id, weight_kg, exercise_id)
        return set_

    @staticmethod
    def create_workout(user_id: int, data: dict, db: Session) -> Workout:
        now = datetime.utcnow()
        workout = Workout(
            user_id=user_id,
            started_at=now,
            notes=data.get("notes"),
        )
        db.add(workout)
        db.commit()
        db.refresh(workout)
        return workout

    @staticmethod
    def get_workout_detail(workout_id: int, db: Session) -> Optional[Workout]:
        return db.query(Workout).options(
            joinedload(Workout.exercises).joinedload(Exercise.sets),
        ).filter(Workout.id == workout_id).first()

    @staticmethod
    def list_workouts(user_id: int, db: Session) -> list[Workout]:
        return db.query(Workout).options(
            joinedload(Workout.exercises).joinedload(Exercise.sets),
        ).filter(
            Workout.user_id == user_id,
        ).order_by(Workout.started_at.desc()).all()

    @staticmethod
    def finish_workout(workout_id: int, db: Session) -> Optional[Workout]:
        workout = db.query(Workout).filter(Workout.id == workout_id).first()
        if not workout:
            return None

        last_set = db.query(Set).join(Exercise).filter(
            Exercise.workout_id == workout_id,
        ).order_by(Set.photo_taken_at.desc()).first()

        if last_set and last_set.photo_taken_at:
            buffer = timedelta(minutes=settings.WORKOUT_END_BUFFER_MINUTES)
            workout.ended_at = last_set.photo_taken_at + buffer
            workout.duration_minutes = round(
                (workout.ended_at - workout.started_at).total_seconds() / 60, 1
            )

        workout.is_completed = 1
        db.commit()
        db.refresh(workout)
        return workout

    @staticmethod
    def delete_workout(workout_id: int, db: Session) -> bool:
        workout = db.query(Workout).filter(Workout.id == workout_id).first()
        if not workout:
            return False
        db.delete(workout)
        db.commit()
        return True

    @staticmethod
    def add_exercise(workout_id: int, data: dict, db: Session) -> Optional[Exercise]:
        workout = db.query(Workout).filter(Workout.id == workout_id).first()
        if not workout:
            return None

        max_order = db.query(func.max(Exercise.order)).filter(
            Exercise.workout_id == workout_id,
        ).scalar() or 0

        exercise = Exercise(
            workout_id=workout_id,
            name=data["name"],
            equipment_id=data.get("equipment_id"),
            notes=data.get("notes"),
            order=max_order + 1,
        )
        db.add(exercise)
        db.commit()
        db.refresh(exercise)
        return exercise

    @staticmethod
    def add_set(exercise_id: int, data: dict, db: Session) -> Optional[Set]:
        exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
        if not exercise:
            return None

        max_order = db.query(func.max(Set.order)).filter(
            Set.exercise_id == exercise_id,
        ).scalar() or 0

        set_ = Set(
            exercise_id=exercise_id,
            reps=data.get("reps"),
            weight_kg=data.get("weight_kg"),
            order=max_order + 1,
        )
        db.add(set_)
        db.commit()
        db.refresh(set_)
        return set_

    @staticmethod
    def update_set(set_id: int, data: dict, db: Session) -> Optional[Set]:
        set_ = db.query(Set).filter(Set.id == set_id).first()
        if not set_:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(set_, key, value)
        db.commit()
        db.refresh(set_)
        return set_

    @staticmethod
    def delete_set(set_id: int, db: Session) -> bool:
        set_ = db.query(Set).filter(Set.id == set_id).first()
        if not set_:
            return False
        db.delete(set_)
        db.commit()
        return True

