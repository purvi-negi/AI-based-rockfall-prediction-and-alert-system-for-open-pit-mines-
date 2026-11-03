import math
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import joblib
import pandas as pd
from pydantic import BaseModel, field_validator

# Load models/class_weighted_svm.joblib once when the API starts
MODEL_PATH = Path(__file__).resolve().parent / "models" / "class_weighted_svm.joblib"
artifacts = joblib.load(MODEL_PATH)
scaler = artifacts["scaler"]
model = artifacts["model"]
feature_names = artifacts["feature_names"]

app = FastAPI(
    title="Rockfall Prediction API",
    description="FastAPI service for rockfall prediction using Class-Weighted SVM",
    version="1.0.0",
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Ensure invalid non-finite numbers return HTTP 422 safely without JSON serialization issues."""
    def sanitize(obj: Any) -> Any:
        if isinstance(obj, float):
            return str(obj) if not math.isfinite(obj) else obj
        if isinstance(obj, dict):
            return {k: sanitize(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [sanitize(v) for v in obj]
        return obj

    sanitized_errors = sanitize(exc.errors())
    return JSONResponse(
        status_code=422,
        content={"detail": jsonable_encoder(sanitized_errors)},
    )


class PredictionRequest(BaseModel):
    ground_tilt: float
    discontinuity_angle: float
    joint_spacing: float
    pore_water_pressure: float
    vibration_rmr: float
    rainfall_mm: float

    @field_validator(
        "ground_tilt",
        "discontinuity_angle",
        "joint_spacing",
        "pore_water_pressure",
        "vibration_rmr",
        "rainfall_mm",
        mode="before",
    )
    @classmethod
    def validate_finite_number(cls, v: Any) -> float:
        if isinstance(v, bool):
            raise ValueError("Value must be a numeric value, not a boolean")
        try:
            val = float(v)
        except (TypeError, ValueError):
            raise ValueError("Value must be numeric")
        if not math.isfinite(val):
            raise ValueError("Value must be a finite number")
        return val


class PredictionResponse(BaseModel):
    predicted_class: int
    raw_svm_class: int
    effective_class: str
    decision_function: float
    hazard_probability: float
    safe_probability: float
    risk_level: str
    trigger_alert: bool


@app.get("/health")
def health():
    return {
        "status": "ok",
        "api_status": "running",
        "model_loaded": model is not None and scaler is not None,
    }


def classify_hazard_probability(hazard_prob: float):
    """
    OPTION A: PROBABILITY-ALIGNED CLASSIFICATION
    The effective classification and risk level are aligned directly with the calibrated
    Platt hazard probability, avoiding contradictions where an 11% hazard probability is
    branded as a full HAZARD emergency while simultaneously marked as SAFE.

    Calibrated Risk & Classification Thresholds:
    - hazard_probability < 0.30            -> SAFE
    - 0.30 <= hazard_probability < 0.50     -> LOW
    - 0.50 <= hazard_probability < 0.80     -> WARNING
    - hazard_probability >= 0.80           -> CRITICAL
    """
    if hazard_prob >= 0.80:
        effective_class = "CRITICAL"
    elif hazard_prob >= 0.50:
        effective_class = "WARNING"
    elif hazard_prob >= 0.30:
        effective_class = "LOW"
    else:
        effective_class = "SAFE"

    risk_level = effective_class
    trigger_alert = bool(hazard_prob >= 0.50)
    return effective_class, risk_level, trigger_alert


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    # Prepare input DataFrame using the exact feature order from the artifact's feature_names
    input_data = request.model_dump()
    input_df = pd.DataFrame(
        [[input_data[col] for col in feature_names]],
        columns=feature_names,
    )

    # Scale inputs using the fitted scaler and make predictions with the trained model
    scaled_features = scaler.transform(input_df)

    raw_svm_class = int(model.predict(scaled_features)[0])
    decision_func = float(model.decision_function(scaled_features)[0])
    probabilities = model.predict_proba(scaled_features)[0]

    # Map probability columns dynamically based on model.classes_
    classes = list(model.classes_)
    safe_idx = classes.index(0)
    hazard_idx = classes.index(1)

    safe_prob = float(probabilities[safe_idx])
    hazard_prob = float(probabilities[hazard_idx])

    effective_class, risk_level, trigger_alert = classify_hazard_probability(hazard_prob)

    return PredictionResponse(
        predicted_class=raw_svm_class,
        raw_svm_class=raw_svm_class,
        effective_class=effective_class,
        decision_function=round(decision_func, 4),
        hazard_probability=round(hazard_prob, 3),
        safe_probability=round(safe_prob, 3),
        risk_level=risk_level,
        trigger_alert=trigger_alert,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
