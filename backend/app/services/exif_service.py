import os
from datetime import datetime

from PIL import Image


class ExifService:
    @staticmethod
    def extract_datetime(photo_path: str) -> datetime:
        try:
            img = Image.open(photo_path)
            exif = img._getexif()
            if exif:
                date_str = exif.get(36867)
                if date_str:
                    return datetime.strptime(date_str, "%Y:%m:%d %H:%M:%S")
        except Exception:
            pass

        mtime = os.path.getmtime(photo_path)
        return datetime.fromtimestamp(mtime)
