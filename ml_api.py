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

    predicted_class = int(model.predict(scaled_features)[0])
    probabilities = model.predict_proba(scaled_features)[0]

    safe_prob = float(probabilities[0])
    hazard_prob = float(probabilities[1])

    # Classification thresholds: SAFE (< 0.50), WARNING (0.50 <= p < 0.80), CRITICAL (p >= 0.80)
    if hazard_prob >= 0.80:
        risk_level = "CRITICAL"
    elif hazard_prob >= 0.50:
        risk_level = "WARNING"
    else:
        risk_level = "SAFE"

    # trigger_alert is true at or above 0.80
    trigger_alert = bool(hazard_prob >= 0.80)

    return PredictionResponse(
        predicted_class=predicted_class,
        hazard_probability=round(hazard_prob, 3),
        safe_probability=round(safe_prob, 3),
        risk_level=risk_level,
        trigger_alert=trigger_alert,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
