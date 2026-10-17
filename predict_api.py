import sys
import json
import joblib
import numpy as np

def load_pipeline():
    """Loads saved scaler and Class-Weighted SVM model."""
    try:
        return joblib.load("models/class_weighted_svm.joblib")
    except Exception as e:
        error_response = {
            "status": "error",
            "message": f"Failed to load model artifacts: {str(e)}"
        }
        print(json.dumps(error_response))
        sys.exit(1)

def predict_rockfall_risk(input_features):
    """
    Processes UI form input and predicts rockfall risk using Class-Weighted SVM.
    
    Parameters:
        input_features (list or dict): Array of 6 geotechnical parameters
    
    Returns:
        str: JSON formatted response for UI/API consumption
    """
    artifacts = load_pipeline()
    scaler = artifacts["scaler"]
    model = artifacts["model"]

    # Convert input list to numpy array
    feature_array = np.array(input_features, dtype=float).reshape(1, -1)

    # Scale inputs using fitted scaler
    scaled_features = scaler.transform(feature_array)

    # Calculate probabilities: Class 0 (Safe), Class 1 (Rockfall Hazard)
    probabilities = model.predict_proba(scaled_features)[0]
    safe_prob = float(probabilities[0])
    hazard_prob = float(probabilities[1])

    # Class-Weighted SVM prediction based on standard 0.5 decision boundary
    predicted_class = int(model.predict(scaled_features)[0])

    # Threshold-based alerting logic (> 80% confidence)
    alert_required = hazard_prob >= 0.80

    # Risk level classification for UI display
    if hazard_prob >= 0.80:
        risk_level = "CRITICAL"
    elif hazard_prob >= 0.50:
        risk_level = "WARNING"
    else:
        risk_level = "SAFE"

    # Construct JSON response structure
    response = {
        "status": "success",
        "model_type": "Class-Weighted SVM",
        "inputs": {
            "ground_tilt": input_features[0],
            "discontinuity_angle": input_features[1],
            "joint_spacing": input_features[2],
            "pore_water_pressure": input_features[3],
            "vibration_rmr": input_features[4],
            "rainfall_mm": input_features[5]
        },
        "prediction": {
            "predicted_class": predicted_class,  # 0: Safe, 1: Rockfall Risk
            "hazard_probability": round(hazard_prob, 4),
            "safe_probability": round(safe_prob, 4),
            "risk_level": risk_level,
            "trigger_alert": alert_required
        }
    }

    return json.dumps(response, indent=2)

if __name__ == "__main__":
    # Expects 6 numeric inputs passed as CLI arguments from backend/UI controller
    if len(sys.argv) == 7:
        try:
            user_inputs = [float(arg) for arg in sys.argv[1:]]
            json_output = predict_rockfall_risk(user_inputs)
            print(json_output)
        except ValueError:
            print(json.dumps({
                "status": "error", 
                "message": "Invalid input format. All 6 geotechnical inputs must be numeric."
            }))
    else:
        # Default test case if executed without arguments
        test_inputs = [38.5, 68.2, 0.35, 120.1, 28.4, 92.0]  # High risk sample
        print(predict_rockfall_risk(test_inputs))