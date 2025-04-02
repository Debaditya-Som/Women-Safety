import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import os
import pandas as pd

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
FILE_PATH = os.path.join(BASE_DIR, "backend-api", "app", "ml_models", "real_reports.csv")

df = pd.read_csv(FILE_PATH)  # Use the full path

# Vectorizing Report Text
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["report_text"])  
y = df["label"]  # 1 = Genuine, 0 = Fraud

# Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Model
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)

# Evaluate Accuracy
y_pred = rf_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# Save Model & Vectorizer
joblib.dump(rf_model, "fraud_detection_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")
