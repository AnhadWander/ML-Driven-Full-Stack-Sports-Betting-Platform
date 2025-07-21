"""
Quick-n-dirty odds viewer.

• By default reads:  data/processed/predicted_odds.csv
• Or pass a CSV path as the first CLI arg.
• Prints GAME_ID, date, and the model’s money-line odds/probabilities.
"""

import sys
from pathlib import Path

import pandas as pd

csv = (
    Path(sys.argv[1])
    if len(sys.argv) > 1
    else Path(__file__).resolve().parents[2]
         / "data" / "processed" / "predicted_odds.csv"
)

if not csv.exists():
    sys.exit(f"❌  CSV not found: {csv}")

need = ["GAME_ID", "GAME_DATE", "ML_HOME", "ML_AWAY", "P_HOME", "P_AWAY"]
df = pd.read_csv(csv)

missing = [c for c in need if c not in df.columns]
if missing:
    sys.exit(f"❌  Expected columns missing: {missing}")

pd.set_option("display.max_rows", None)    
pd.set_option("display.float_format", "{:,.3f}".format)

print(df[need].to_string(index=False))
