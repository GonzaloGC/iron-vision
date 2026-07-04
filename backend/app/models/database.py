from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=settings.DEBUG,
)

if "sqlite" in settings.DATABASE_URL:
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app.models.orm_models import Equipment, Exercise, Set, User, Workout
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.id == 1).first()
        if not existing:
            user = User(
                id=1,
                email="default@ironvision.app",
                username="default",
            )
            db.add(user)
            db.commit()
    finally:
        db.close()
