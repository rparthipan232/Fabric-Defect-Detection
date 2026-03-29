from flask import Flask, render_template, request
from ultralytics import YOLO
import cv2
import os
from datetime import datetime

app = Flask(__name__)

model = YOLO("runs/detect/train5/weights/best.pt")

UPLOAD_FOLDER = "static/uploads"
RESULT_FOLDER = "static/results"

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    file = request.files["image"]

    # Save uploaded image
    filename = datetime.now().strftime("%Y%m%d%H%M%S") + ".jpg"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Run YOLO
    results = model(filepath)

    defect_info = []

    for r in results:
        img = r.plot()

        # Get defect names + confidence
        for box in r.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            name = model.names[cls]

            defect_info.append(f"{name} ({conf:.2f})")

    # Save result image
    result_path = os.path.join(RESULT_FOLDER, filename)
    cv2.imwrite(result_path, img)

    # Save defect details in text file
    txt_path = os.path.join(RESULT_FOLDER, "log.txt")
    with open(txt_path, "a") as f:
        f.write(f"{filename} -> {', '.join(defect_info)}\n")

    return render_template("index.html",
                           result_image="results/" + filename,
                           defects=defect_info)


if __name__ == "__main__":
    app.run(debug=True)
   
    
import csv

with open("static/results/data.csv", "a", newline="") as file:
    writer = csv.writer(file)
    writer.writerow([filename, ", ".join(defect_info)])    