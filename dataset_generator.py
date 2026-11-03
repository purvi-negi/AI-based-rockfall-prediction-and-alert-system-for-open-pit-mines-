import pandas as pd
import numpy as np
from sklearn.datasets import make_classification

# Set seed for exact reproducibility
np.random.seed(42)

# Generate imbalanced classification dataset (95% safe, 5% rockfall hazard)
X, y = make_classification(
    n_samples=1200,
    n_features=6,
    n_informative=5,
    n_redundant=1,
    n_clusters_per_class=2,
    weights=[0.95, 0.05],  # 95:5 Imbalance Ratio
    class_sep=0.7,         # Introduces overlap in borderline geotechnical zones
    random_state=42
)

# Map raw features to domain-specific geotechnical parameters
df = pd.DataFrame(X, columns=[
    'ground_tilt',
    'discontinuity_angle',
    'joint_spacing',
    'pore_water_pressure',
    'vibration_rmr',
    'rainfall_mm'
])

# Rescale features to standard mining units
df['ground_tilt'] = np.interp(df['ground_tilt'], (df['ground_tilt'].min(), df['ground_tilt'].max()), (5, 45)).round(2)
df['discontinuity_angle'] = np.interp(df['discontinuity_angle'], (df['discontinuity_angle'].min(), df['discontinuity_angle'].max()), (10, 85)).round(2)
df['joint_spacing'] = np.interp(df['joint_spacing'], (df['joint_spacing'].min(), df['joint_spacing'].max()), (0.1, 3.0)).round(2)
df['pore_water_pressure'] = np.interp(df['pore_water_pressure'], (df['pore_water_pressure'].min(), df['pore_water_pressure'].max()), (0, 150)).round(2)
df['vibration_rmr'] = np.interp(df['vibration_rmr'], (df['vibration_rmr'].min(), df['vibration_rmr'].max()), (10, 90)).round(2)
df['rainfall_mm'] = np.interp(df['rainfall_mm'], (df['rainfall_mm'].min(), df['rainfall_mm'].max()), (0, 120)).round(2)

df['target'] = y

# Save to CSV
output_path = "data/rockfall_imbalanced_dataset.csv"
df.to_csv(output_path, index=False)

print(f"Dataset successfully created at '{output_path}'")
print(f"Class Breakdown:\n{df['target'].value_counts(normalize=True) * 100}")