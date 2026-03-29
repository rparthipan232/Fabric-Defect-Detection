import csv

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

        for box in r.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            name = model.names[cls]

            defect_info.append(f"{name} ({conf:.2f})")

    # If no defect detected
    if len(defect_info) == 0:
        defect_info.append("No Defect")

    # Save result image
    result_path = os.path.join(RESULT_FOLDER, filename)
    cv2.imwrite(result_path, img)

    # ✅ SAVE TO CSV HERE
    csv_path = os.path.join(RESULT_FOLDER, "data.csv")

    file_exists = os.path.isfile(csv_path)

    with open(csv_path, "a", newline="") as file:
        writer = csv.writer(file)

        # Write header only once
        if not file_exists:
            writer.writerow(["Filename", "Defects", "Date"])

        writer.writerow([
            filename,
            ", ".join(defect_info),
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ])

    return render_template("index.html",
                           result_image="results/" + filename,
                           defects=defect_info)