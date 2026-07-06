from fastapi import Depends
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.orm_models import User


DEFAULT_USER_ID = 1


def get_current_user(db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.id == DEFAULT_USER_ID).first()
    if not user:
        user = User(
            id=DEFAULT_USER_ID,
            email="default@ironvision.app",
            username="default",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
