"""Seed data: crea equipamiento + 10 workouts en las últimas 4 semanas."""

from datetime import datetime, timedelta

from app.models.database import SessionLocal, init_db
from app.models.orm_models import Equipment, Exercise, Set, User, Workout


def seed():
    init_db()
    db = SessionLocal()

    db.query(Set).delete()
    db.query(Exercise).delete()
    db.query(Workout).delete()
    db.query(Equipment).delete()
    db.query(User).filter(User.id != 1).delete()
    db.commit()

    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(id=1, email="default@ironvision.app", username="default")
        db.add(user)
        db.commit()

    equipment_data = [
        ("Barra Olímpica", "barbell", 20.0, 1),
        ("Disco 1.25kg", "plate", 1.25, 2),
        ("Disco 2.5kg", "plate", 2.5, 2),
        ("Disco 5kg", "plate", 5.0, 2),
        ("Disco 10kg", "plate", 10.0, 2),
        ("Disco 20kg", "plate", 20.0, 2),
        ("Mancuerna 10kg", "dumbbell", 10.0, 2),
        ("Mancuerna 12kg", "dumbbell", 12.0, 2),
        ("Mancuerna 14kg", "dumbbell", 14.0, 2),
        ("Mancuerna 16kg", "dumbbell", 16.0, 2),
        ("Mancuerna 18kg", "dumbbell", 18.0, 2),
        ("Mancuerna 20kg", "dumbbell", 20.0, 2),
        ("Banco Plano", "other", 0.0, 1),
        ("Soporte Sentadilla", "other", 0.0, 1),
    ]

    for name, etype, weight, qty in equipment_data:
        eq = Equipment(
            user_id=user.id,
            name=name,
            type=etype,
            weight_kg=weight,
            quantity=qty,
        )
        db.add(eq)
        db.flush()

    # 10 workouts progressive overload over 4 weeks
    now = datetime.utcnow()
    workout_plan = [
        # (days_ago, [(exercise_name, [(weight, reps), ...])])
        (28, [
            ("Sentadilla", [(60, 8), (60, 8), (60, 8)]),
            ("Press Banca", [(40, 8), (40, 8), (40, 8)]),
            ("Peso Muerto", [(70, 8), (70, 8), (70, 8)]),
        ]),
        (25, [
            ("Sentadilla", [(65, 8), (65, 8), (65, 8)]),
            ("Press Banca", [(42.5, 8), (42.5, 8), (42.5, 8)]),
            ("Peso Muerto", [(75, 8), (75, 8), (75, 8)]),
        ]),
        (21, [
            ("Sentadilla", [(70, 8), (70, 8), (70, 8)]),
            ("Press Banca", [(45, 8), (45, 8), (45, 8)]),
            ("Peso Muerto", [(80, 8), (80, 8), (80, 8)]),
        ]),
        (18, [
            ("Sentadilla", [(72.5, 8), (72.5, 8), (72.5, 8)]),
            ("Press Banca", [(47.5, 8), (47.5, 8), (47.5, 8)]),
            ("Peso Muerto", [(85, 8), (85, 8), (85, 8)]),
        ]),
        (14, [
            ("Sentadilla", [(75, 8), (75, 8), (75, 8)]),
            ("Press Banca", [(50, 8), (50, 8), (50, 8)]),
            ("Peso Muerto", [(90, 8), (90, 8), (90, 8)]),
        ]),
        (11, [
            ("Sentadilla", [(77.5, 8), (77.5, 8), (77.5, 8)]),
            ("Press Banca", [(52.5, 8), (52.5, 8), (52.5, 8)]),
            ("Peso Muerto", [(95, 8), (95, 8), (95, 8)]),
        ]),
        (8, [
            ("Sentadilla", [(80, 8), (80, 8), (80, 8)]),
            ("Press Banca", [(55, 8), (55, 8), (55, 8)]),
            ("Peso Muerto", [(100, 8), (100, 8), (100, 8)]),
        ]),
        (5, [
            ("Sentadilla", [(82.5, 8), (82.5, 8), (82.5, 8)]),
            ("Press Banca", [(57.5, 8), (57.5, 8), (57.5, 8)]),
            ("Peso Muerto", [(105, 8), (105, 8), (105, 8)]),
        ]),
        (3, [
            ("Sentadilla", [(85, 8), (85, 8), (85, 8)]),
            ("Press Banca", [(60, 8), (60, 8), (60, 8)]),
            ("Peso Muerto", [(110, 8), (110, 8), (110, 8)]),
        ]),
        (1, [
            ("Sentadilla", [(87.5, 8), (87.5, 8), (87.5, 8)]),
            ("Press Banca", [(62.5, 8), (62.5, 8), (62.5, 8)]),
            ("Peso Muerto", [(115, 8), (115, 8), (115, 8)]),
        ]),
    ]

    for days_ago, exercises in workout_plan:
        start = now - timedelta(days=days_ago, hours=6)
        end = start + timedelta(hours=1, minutes=15)

        workout = Workout(
            user_id=user.id,
            started_at=start,
            ended_at=end,
            duration_minutes=75.0,
            is_completed=1,
        )
        db.add(workout)
        db.flush()

        for order, (ex_name, sets_data) in enumerate(exercises, 1):
            exercise = Exercise(
                workout_id=workout.id,
                name=ex_name,
                order=order,
            )
            db.add(exercise)
            db.flush()

            for s_order, (weight, reps) in enumerate(sets_data, 1):
                photo_time = start + timedelta(
                    minutes=10 * order + 2 * s_order
                )
                set_ = Set(
                    exercise_id=exercise.id,
                    reps=reps,
                    weight_kg=weight,
                    photo_taken_at=photo_time,
                    order=s_order,
                    is_completed=1,
                )
                db.add(set_)

    db.commit()
    db.close()
    print("Seed completado: 12 equipos, 10 workouts, ~90 sets.")


if __name__ == "__main__":
    seed()
