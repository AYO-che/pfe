from ultralytics import YOLO
import json
import cv2
import numpy as np
import base64

# ── Load model ────────────────────────────────────────────────
model = YOLO("best.pt")

# ── Load nutrition data ───────────────────────────────────────
with open("nutrition_lookup.json", "r") as f:
    nutrition_lookup = json.load(f)

# ── Use model's real class names ──────────────────────────────
CLASS_NAMES = model.names

# ── Name mapping for mismatches between YOLO and nutrition DB ─
NAME_MAP = {
    "French beans":   "green beans",
    "french fries":   "potato",
    "cilantro mint":  "lettuce",
    "pie":            "bread",
    "biscuit":        "bread",
    "cake":           "bread",
    "sauce":          "tomato",
    "ice cream":      "milk",
    "asparagus":      "asparagus",
    "strawberry":     "apple",
    "blueberry":      "apple",
    "pork":           "pork",
    "steak":          "steak",
    "fish":           "fish",
    "egg":            "egg",
    "onion":          "onion",
    "pepper":         "pepper",
    "cucumber":       "cucumber",
    "lettuce":        "lettuce",
    "broccoli":       "broccoli",
    "tomato":         "tomato",
    "carrot":         "carrot",
    "potato":         "potato",
    "corn":           "corn",
    "rice":           "rice",
    "noodles":        "noodles",
    "pasta":          "pasta",
    "bread":          "bread",
    "chicken duck":   "chicken duck",
}

# ── Realistic minimum weights per food type (grams) ───────────
WEIGHT_MINIMUMS = {
    "chicken duck":  120,
    "steak":         150,
    "pork":          130,
    "fish":          100,
    "egg":            60,
    "rice":          150,
    "pasta":         130,
    "noodles":       130,
    "bread":          60,
    "pie":            80,
    "biscuit":        30,
    "cake":           80,
    "pizza":         150,
    "potato":        100,
    "french fries":   80,
    "corn":           80,
    "default":        50,
}

# ── Nutrition lookup with fallback ────────────────────────────
def get_nutrition(food_name):
    # try exact match first
    if food_name in nutrition_lookup:
        return nutrition_lookup[food_name]
    # try mapped name
    mapped = NAME_MAP.get(food_name)
    if mapped and mapped in nutrition_lookup:
        return nutrition_lookup[mapped]
    # nothing found
    return None

# ── Main predict function ─────────────────────────────────────
def predict(image_path):
    results = model(image_path, conf=0.25)
    r = results[0]

    detections = []
    total = {
        "calories": 0,
        "fat":      0,
        "carbs":    0,
        "protein":  0
    }

    # group all detections by food class
    food_groups = {}

    if r.masks is not None:
        img_area = r.orig_shape[0] * r.orig_shape[1]

        for i in range(len(r.boxes)):
            cls       = int(r.boxes.cls[i])
            conf      = float(r.boxes.conf[i])
            food_name = CLASS_NAMES[cls]

            mask      = r.masks.data[i]
            mask_area = (mask > 0.5).sum().item()

            if food_name not in food_groups:
                food_groups[food_name] = {
                    "total_mask_area": 0,
                    "confidence":      conf
                }
            food_groups[food_name]["total_mask_area"] += mask_area

        # calculate nutrition per food group
        for food_name, group in food_groups.items():

            ratio    = group["total_mask_area"] / img_area
            weight_g = ratio * 800  # assume full plate = 800g

            # apply realistic minimum weight
            min_weight = WEIGHT_MINIMUMS.get(
                food_name,
                WEIGHT_MINIMUMS["default"]
            )
            weight_g = max(weight_g, min_weight)

            nutrition = get_nutrition(food_name)

            item = {
                "food":      food_name,
                "confidence": round(group["confidence"], 2),
                "weight_g":  round(weight_g, 1),
                "calories":  0,
                "fat_g":     0,
                "carbs_g":   0,
                "protein_g": 0
            }

            if nutrition:
                item["calories"]  = round(
                    weight_g * nutrition["calories_per_g"], 1)
                item["fat_g"]     = round(
                    weight_g * nutrition["fat_per_g"], 1)
                item["carbs_g"]   = round(
                    weight_g * nutrition["carb_per_g"], 1)
                item["protein_g"] = round(
                    weight_g * nutrition["protein_per_g"], 1)

                total["calories"] += item["calories"]
                total["fat"]      += item["fat_g"]
                total["carbs"]    += item["carbs_g"]
                total["protein"]  += item["protein_g"]

            detections.append(item)

    # annotated image
    annotated        = r.plot()
    _, buffer        = cv2.imencode(".jpg", annotated)
    img_base64       = base64.b64encode(buffer).decode("utf-8")

    return {
        "detections": detections,
        "total": {
            "calories": round(total["calories"], 1),
            "fat":      round(total["fat"],      1),
            "carbs":    round(total["carbs"],    1),
            "protein":  round(total["protein"],  1)
        },
        "image": img_base64
    }