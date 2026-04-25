from ultralytics import YOLO
import json
import cv2
import numpy as np
import base64

# Load model
model = YOLO("best.pt")

# Load nutrition data
with open("nutrition_lookup.json", "r") as f:
    nutrition_lookup = json.load(f)

# Class names
CLASS_NAMES = [
    "candy", "egg tart", "french fries", "chocolate", "biscuit",
    "popcorn", "pudding", "ice cream", "cheese butter", "cake",
    "wine", "milkshake", "coffee", "juice", "milk", "tea",
    "almond", "red beans", "cashew", "dried cranberries", "soy",
    "walnut", "peanut", "egg", "apple", "date", "apricot",
    "avocado", "banana", "strawberry", "cherry", "blueberry",
    "raspberry", "mango", "olives", "peach", "lemon", "pear",
    "fig", "pineapple", "grape", "kiwi", "melon", "orange",
    "watermelon", "steak", "pork", "chicken duck", "sausage",
    "fried meat", "lamb", "sauce", "crab", "fish", "shellfish",
    "shrimp", "soup", "bread", "corn", "hamburg", "pizza",
    "hanamaki baozi", "wonton dumplings", "pasta", "noodles",
    "rice", "pie", "tofu", "eggplant", "potato", "garlic",
    "cauliflower", "tomato", "kelp", "seaweed", "spring onion",
    "rape", "ginger", "okra", "lettuce", "pumpkin", "cucumber",
    "white radish", "carrot", "asparagus", "bamboo shoots",
    "broccoli", "celery stick", "cilantro mint", "snow peas",
    "cabbage", "bean sprouts", "onion", "pepper", "green beans",
    "French beans", "king oyster mushroom", "shiitake",
    "enoki mushroom", "oyster mushroom", "white button mushroom",
    "salad", "other ingredients"
]

def predict(image_path):
    # Run detection
    results = model(image_path, conf=0.25)
    r = results[0]

    detections = []
    total = {"calories": 0, "fat": 0, "carbs": 0, "protein": 0}

    if r.masks is not None:
        img_area = r.orig_shape[0] * r.orig_shape[1]

        for i, (cls, conf) in enumerate(zip(r.boxes.cls, r.boxes.conf)):
            food_name = CLASS_NAMES[int(cls)]
            mask_area = r.masks.data[i].sum().item()
            
            # Estimate weight
            ratio = mask_area / img_area
            weight_g = ratio * 300  # assume plate = 300g

            nutrition = nutrition_lookup.get(food_name, None)

            item = {
                "food": food_name,
                "confidence": round(float(conf), 2),
                "weight_g": round(weight_g, 1),
                "calories": 0,
                "fat_g": 0,
                "carbs_g": 0,
                "protein_g": 0
            }

            if nutrition:
                item["calories"] = round(weight_g * nutrition["calories_per_g"], 1)
                item["fat_g"] = round(weight_g * nutrition["fat_per_g"], 1)
                item["carbs_g"] = round(weight_g * nutrition["carb_per_g"], 1)
                item["protein_g"] = round(weight_g * nutrition["protein_per_g"], 1)

                total["calories"] += item["calories"]
                total["fat"] += item["fat_g"]
                total["carbs"] += item["carbs_g"]
                total["protein"] += item["protein_g"]

            detections.append(item)

    # Get annotated image
    annotated = r.plot()
    _, buffer = cv2.imencode('.jpg', annotated)
    img_base64 = base64.b64encode(buffer).decode('utf-8')

    return {
        "detections": detections,
        "total": total,
        "image": img_base64
    }