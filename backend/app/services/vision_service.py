import random

from app.models.orm_models import Equipment


class VisionService:
    @staticmethod
    def analyze_photo(photo_path: str, equipment_list: list[Equipment]) -> dict:
        if not equipment_list:
            return {
                "equipment_detected": [],
                "total_weight_kg": 0.0,
            }

        plates = [e for e in equipment_list if e.type in ("plate", "dumbbell")]
        barbells = [e for e in equipment_list if e.type == "barbell"]

        detected = []
        total_weight = 0.0

        if barbells and random.random() < 0.8:
            bar = random.choice(barbells)
            detected.append({
                "equipment_id": bar.id,
                "name": bar.name,
                "weight_kg": bar.weight_kg,
                "quantity": 1,
            })
            total_weight += bar.weight_kg

        if plates:
            num_plates = random.randint(2, 4)
            for _ in range(num_plates):
                plate = random.choice(plates)
                detected.append({
                    "equipment_id": plate.id,
                    "name": plate.name,
                    "weight_kg": plate.weight_kg,
                    "quantity": 1,
                })
                total_weight += plate.weight_kg

        return {
            "equipment_detected": detected,
            "total_weight_kg": round(total_weight, 1),
        }
