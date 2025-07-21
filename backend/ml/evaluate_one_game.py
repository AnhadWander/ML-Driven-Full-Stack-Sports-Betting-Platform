import pandas as pd, joblib, os, random
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics  import accuracy_score, roc_auc_score

FEAT_DATA  = "data/processed/rolling_features.csv"
MODEL_PATH = "backend/ml/rolling_model.pkl"

def train_until(cutoff_index, df):
    train = df.loc[:cutoff_index-1]
    X = train.drop(columns=["GAME_ID","GAME_DATE","HOME_WIN"])
    y = train["HOME_WIN"]
    model = GradientBoostingClassifier(random_state=42)
    model.fit(X, y)
    return model

def evaluate_random():
    df = pd.read_csv(FEAT_DATA)
    test_idx = random.randrange(50, len(df))     
    test_row = df.iloc[test_idx]
    
    model = train_until(test_idx, df)
    
    X_test = test_row.drop(labels=["GAME_ID","GAME_DATE","HOME_WIN"]).values.reshape(1,-1)
    y_true = test_row["HOME_WIN"]
    y_prob = model.predict_proba(X_test)[0,1]
    y_pred = int(y_prob >= 0.5)
    
    print(f"--- Evaluating GAME_ID {test_row['GAME_ID']} on {test_row['GAME_DATE']} ---")
    print(f"True outcome  : {'HOME WIN' if y_true else 'HOME LOSS'}")
    print(f"Model prob(W): {y_prob:.3f}")
    print(f"Model picks  : {'HOME WIN' if y_pred else 'HOME LOSS'}")
    print(f"Acc           : {accuracy_score([y_true],[y_pred]):.2f}")
    print(f"ROC-AUC       : {roc_auc_score([y_true],[y_prob]):.2f}")
    
    if not os.path.exists(MODEL_PATH):
        full_model = train_until(len(df), df)
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(full_model, MODEL_PATH)

if __name__ == "__main__":
    evaluate_random()
