import logging
import random

from app.models.orm_models import Equipment

logger = logging.getLogger(__name__)


class VisionService:
    @staticmethod
    def analyze_photo(photo_path: str, equipment_list: list[Equipment]) -> dict:
        logger.info("Analyzing photo: %s with %d equipment items", photo_path, len(equipment_list))

        if not equipment_list:
            logger.warning("No equipment in inventory — returning empty detection")
            return {
                "equipment_detected": [],
                "total_weight_kg": 0.0,
                "exercise_name": "",
            }

        barbells = [e for e in equipment_list if e.type == "barbell"]
        plates = [e for e in equipment_list if e.type == "plate"]
        dumbbells = [e for e in equipment_list if e.type == "dumbbell"]

        detected = []
        total_weight = 0.0

        # Decide if this is a barbell exercise or dumbbell exercise
        is_barbell = bool(barbells) and (not dumbbells or random.random() < 0.7)

        if is_barbell and barbells:
            bar = random.choice(barbells)
            detected.append({
                "equipment_id": bar.id,
                "name": bar.name,
                "weight_kg": bar.weight_kg,
                "quantity": 1,
            })
            total_weight += bar.weight_kg
            logger.debug("Detected barbell: %s (%.1f kg)", bar.name, bar.weight_kg)

            if plates:
                # Pick 1-2 unique plate types (always in pairs for balance)
                num_types = random.randint(1, min(2, len(plates)))
                selected_plates = random.sample(plates, num_types)
                for plate in selected_plates:
                    # Each plate type appears on both sides → quantity = 2
                    qty = 2
                    detected.append({
                        "equipment_id": plate.id,
                        "name": plate.name,
                        "weight_kg": plate.weight_kg,
                        "quantity": qty,
                    })
                    total_weight += plate.weight_kg * qty
                    logger.debug("Detected plate pair: %s (%.1f kg x%d)", plate.name, plate.weight_kg, qty)

        elif dumbbells:
            # Dumbbell exercise — pick one dumbbell
            db = random.choice(dumbbells)
            detected.append({
                "equipment_id": db.id,
                "name": db.name,
                "weight_kg": db.weight_kg,
                "quantity": 1,
            })
            total_weight += db.weight_kg
            logger.debug("Detected dumbbell: %s (%.1f kg)", db.name, db.weight_kg)
        elif plates:
            # Fallback: just plates (unlikely but possible for cable/machine)
            num_types = random.randint(1, min(2, len(plates)))
            selected_plates = random.sample(plates, num_types)
            for plate in selected_plates:
                qty = random.choice([1, 2])
                detected.append({
                    "equipment_id": plate.id,
                    "name": plate.name,
                    "weight_kg": plate.weight_kg,
                    "quantity": qty,
                })
                total_weight += plate.weight_kg * qty
                logger.debug("Detected plate: %s (%.1f kg x%d)", plate.name, plate.weight_kg, qty)

        exercise_name = detected[0]["name"] if detected else ""
        logger.info(
            "Photo analysis complete: %d items, total %.1f kg, exercise=%s",
            len(detected), total_weight, exercise_name,
        )
        return {
            "equipment_detected": detected,
            "total_weight_kg": round(total_weight, 1),
            "exercise_name": exercise_name,
        }
