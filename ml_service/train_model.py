import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

# We don't have real data yet so we generate synthetic training data
# In production this would come from real donor response history
# This is called synthetic data generation — valid and common in early ML systems
np.random.seed(42)
n_samples = 5000

# Generate realistic feature distributions
distance_km = np.random.exponential(scale=8, size=n_samples).clip(0, 50)
total_donations = np.random.poisson(lam=3, size=n_samples).clip(0, 20)
is_available = np.random.choice([0, 1], size=n_samples, p=[0.2, 0.8])
days_since_last_donation = np.random.exponential(scale=90, size=n_samples).clip(0, 365)
hour_of_day = np.random.randint(0, 24, size=n_samples)

# Create realistic response probability
# Closer + more donations + available + not recently donated = more likely to respond
response_prob = (
    0.4 * (1 - distance_km / 50) +
    0.25 * (total_donations / 20) +
    0.2 * is_available +
    0.15 * (days_since_last_donation / 365)
)

# Add noise to make it realistic
response_prob += np.random.normal(0, 0.05, n_samples)
response_prob = response_prob.clip(0, 1)

# Convert probability to binary label (responded or not)
will_respond = (response_prob > 0.5).astype(int)

# Build dataframe
df = pd.DataFrame({
    "distance_km": distance_km,
    "total_donations": total_donations,
    "is_available": is_available,
    "days_since_last_donation": days_since_last_donation,
    "hour_of_day": hour_of_day,
    "will_respond": will_respond
})

print(f"Dataset: {len(df)} samples")
print(f"Response rate: {will_respond.mean():.2%}")

# Features and target
X = df.drop("will_respond", axis=1)
y = df["will_respond"]

# Split into train and test sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train XGBoost model
# n_estimators = number of trees
# max_depth = how deep each tree grows
# learning_rate = how much each tree corrects the previous
model = XGBClassifier(
    n_estimators=100,
    max_depth=4,
    learning_rate=0.1,
    use_label_encoder=False,
    eval_metric="logloss",
    random_state=42
)

model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("\nModel performance:")
print(classification_report(y_test, y_pred))

# Save model to disk
joblib.dump(model, "model.pkl")
print("\nModel saved to model.pkl")

# Print feature importance — shows which features matter most
importance = dict(zip(X.columns, model.feature_importances_))
print("\nFeature importance:")
for feat, score in sorted(importance.items(), key=lambda x: x[1], reverse=True):
    print(f"  {feat}: {score:.3f}")