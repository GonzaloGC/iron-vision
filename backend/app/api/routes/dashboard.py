from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.models.database import get_db
from app.models.orm_models import Exercise, Set, User, Workout
from app.schemas.dashboard import ProgressPoint, RecentWorkout, VolumePoint

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _estimate_one_rm(weight: float, reps: int) -> float:
    if reps == 1:
        return weight
    return round(weight * (1 + reps / 30.0), 1)


@router.get("/volume", response_model=list[VolumePoint])
def get_volume(
    period: str = Query("week", pattern="^(week|month)$"),
    weeks: int = Query(8, ge=1, le=52),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cutoff = datetime.utcnow() - timedelta(weeks=weeks)

    rows = (
        db.query(
            Workout.started_at,
            func.sum(Set.weight_kg).label("volume"),
            func.count(Set.id).label("sets"),
        )
        .join(Exercise, Exercise.workout_id == Workout.id)
        .join(Set, Set.exercise_id == Exercise.id)
        .filter(
            Workout.user_id == current_user.id,
            Workout.is_completed == 1,
            Workout.started_at >= cutoff,
        )
        .group_by(Workout.id)
        .order_by(Workout.started_at.asc())
        .all()
    )

    from collections import OrderedDict

    buckets = OrderedDict()

    for row in rows:
        if period == "week":
            label = row.started_at.strftime("%Y-W%V")
        else:
            label = row.started_at.strftime("%Y-%m")

        if label not in buckets:
            buckets[label] = {"volume": 0.0, "sets": 0, "count": 0}
        buckets[label]["volume"] += row.volume or 0
        buckets[label]["sets"] += row.sets or 0
        buckets[label]["count"] += 1

    return [
        VolumePoint(
            label=label,
            total_volume_kg=round(v["volume"], 1),
            total_sets=v["sets"],
            workout_count=v["count"],
        )
        for label, v in buckets.items()
    ]


@router.get("/progress", response_model=list[ProgressPoint])
def get_progress(
    exercise_name: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(Set, Workout.started_at)
        .join(Exercise, Exercise.id == Set.exercise_id)
        .join(Workout, Workout.id == Exercise.workout_id)
        .filter(
            Workout.user_id == current_user.id,
            Exercise.name == exercise_name,
            Workout.is_completed == 1,
            Set.weight_kg.isnot(None),
        )
        .order_by(Workout.started_at.desc())
        .limit(limit)
        .all()
    )

    result = []
    for set_, started_at in reversed(rows):
        one_rm = None
        if set_.reps and set_.weight_kg:
            one_rm = _estimate_one_rm(set_.weight_kg, set_.reps)
        result.append(
            ProgressPoint(
                date=started_at,
                weight_kg=set_.weight_kg or 0.0,
                reps=set_.reps,
                estimated_one_rm=one_rm,
            )
        )

    return result


@router.get("/recent", response_model=list[RecentWorkout])
def get_recent(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workouts = (
        db.query(Workout)
        .filter(
            Workout.user_id == current_user.id,
            Workout.is_completed == 1,
        )
        .order_by(Workout.started_at.desc())
        .limit(limit)
        .all()
    )

    result = []
    for w in workouts:
        stats = (
            db.query(
                func.count(Exercise.id).label("exercise_count"),
                func.coalesce(func.sum(Set.weight_kg), 0).label("total_volume"),
                func.count(Set.id).label("total_sets"),
            )
            .outerjoin(Set, Set.exercise_id == Exercise.id)
            .filter(Exercise.workout_id == w.id)
            .first()
        )

        result.append(
            RecentWorkout(
                id=w.id,
                date=w.started_at,
                duration_minutes=w.duration_minutes,
                exercise_count=stats.exercise_count,
                total_volume_kg=round(stats.total_volume or 0.0, 1),
                total_sets=stats.total_sets,
            )
        )

    return result
