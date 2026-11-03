import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

# 1. Load the imbalanced geotechnical dataset
data = pd.read_csv("data/rockfall_imbalanced_dataset.csv")
X = data.drop(columns=["target"])
y = data["target"]

# 2. Stratified Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.30, random_state=42, stratify=y
)

# 3. Fit Standard Scaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)

# 4. Train Class-Weighted SVM
model = SVC(kernel="rbf", C=1.0, class_weight="balanced", probability=True, random_state=42)
model.fit(X_train_scaled, y_train)

# 5. Save model and scaler pipeline together
artifacts = {
    "scaler": scaler,
    "model": model,
    "feature_names": list(X.columns)
}
joblib.dump(artifacts, "models/class_weighted_svm.joblib")
print("Class-Weighted SVM pipeline successfully trained and saved to 'models/class_weighted_svm.joblib'.")