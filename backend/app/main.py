import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.models.database import init_db
from app.api.routes import dashboard, inventory, vision, workouts

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

app = FastAPI(title=settings.APP_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inventory.router)
app.include_router(vision.router)
app.include_router(workouts.router)
app.include_router(dashboard.router)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount(
    f"/{settings.UPLOAD_DIR}",
    StaticFiles(directory=settings.UPLOAD_DIR),
    name="uploads",
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok", "version": settings.VERSION}
