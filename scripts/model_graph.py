import matplotlib.pyplot as plt

runs = list(range(1, 31))
accuracy = [0.620, 0.720, 0.720, 0.680, 0.780, 0.860, 0.660, 0.720, 0.760, 0.700, 0.700, 0.660, 0.640, 0.640, 0.680,
            0.660, 0.600, 0.780, 0.780, 0.760, 0.700, 0.860, 0.780, 0.740, 0.740, 0.700, 0.720, 0.720, 0.880, 0.700]
f1_scores = [0.678, 0.767, 0.759, 0.724, 0.831, 0.851, 0.691, 0.774, 0.824, 0.762, 0.737, 0.746, 0.667, 0.690, 0.742,
             0.721, 0.643, 0.836, 0.841, 0.647, 0.769, 0.889, 0.820, 0.735, 0.723, 0.754, 0.696, 0.682, 0.893, 0.737]
auc_scores = [0.704, 0.807, 0.800, 0.704, 0.860, 0.926, 0.747, 0.740, 0.730, 0.780, 0.803, 0.737, 0.831, 0.633, 0.768,
              0.802, 0.720, 0.814, 0.844, 0.810, 0.745, 0.914, 0.864, 0.847, 0.814, 0.787, 0.840, 0.839, 0.939, 0.771]

plt.figure(figsize=(12, 6))
plt.plot(runs, accuracy, label="Accuracy", marker="o")
plt.plot(runs, f1_scores, label="F1 Score", marker="s")
plt.plot(runs, auc_scores, label="ROC-AUC", marker="^")
plt.title("Model Performance Across 30 Evaluation Runs")
plt.xlabel("Run Number (50-game blocks)")
plt.ylabel("Score")
plt.ylim(0.5, 1.0)
plt.grid(True)
plt.legend()
plt.tight_layout()
plt.show()