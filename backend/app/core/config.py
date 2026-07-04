from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "IronVision API"
    VERSION: str = "0.1.0"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./iron_vision.db"

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    WORKOUT_START_BUFFER_MINUTES: int = 3
    WORKOUT_END_BUFFER_MINUTES: int = 3
    EXERCISE_IDLE_TIMEOUT_MINUTES: int = 30

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
