import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def prepare_features(df: pd.DataFrame):
    features = []

    # Amount feature
    if "amount" in df.columns:
        features.append(df["amount"].astype(float))

    # Encode categorical columns using frequency
    for col in ["department", "location"]:
        if col in df.columns:
            freq = df[col].map(df[col].value_counts())
            features.append(freq)

    X = np.column_stack(features)
    return X


def ml_anomaly_score_rowwise(df):
    X = prepare_features(df)

    model = IsolationForest(
        n_estimators=100,
        contamination=0.1,
        random_state=42
    )
    model.fit(X)

    scores = model.decision_function(X)

    # Normalize 0–100
    ml_scores = ((scores.max() - scores) / (scores.max() - scores.min())) * 100

    return ml_scores.astype(int)
