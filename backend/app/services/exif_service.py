import logging
import os
from datetime import datetime

from PIL import Image

logger = logging.getLogger(__name__)

EXIF_DATETIME_ORIGINAL = 36867


class ExifService:
    @staticmethod
    def extract_datetime(photo_path: str) -> datetime:
        try:
            img = Image.open(photo_path)
            exif = img.getexif()
            if exif:
                date_str = exif.get(EXIF_DATETIME_ORIGINAL)
                if date_str:
                    return datetime.strptime(date_str, "%Y:%m:%d %H:%M:%S")
        except Exception as exc:
            logger.warning("Could not extract EXIF datetime from %s: %s", photo_path, exc)

        mtime = os.path.getmtime(photo_path)
        logger.info("Falling back to file mtime for %s: %s", photo_path, mtime)
        return datetime.fromtimestamp(mtime)
