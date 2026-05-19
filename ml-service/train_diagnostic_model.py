from diagnostic_model import (
    FEATURE_ORDER,
    MODEL_PATH,
    REPORT_PATH,
    build_diagnostic_model_bundle,
    save_diagnostic_model_bundle,
)


def main():
    print("\n" + "=" * 60)
    print("  DSA DIAGNOSTIC MODEL TRAINING")
    print("=" * 60)

    bundle = build_diagnostic_model_bundle()
    report = save_diagnostic_model_bundle(bundle)

    print(f"\nTraining samples : {report['sample_count']}")
    print(f"Feature count    : {report['n_features']} ({len(FEATURE_ORDER)} expected)")
    print(f"CV accuracy      : {report['cv_mean_accuracy'] * 100:.2f}%")
    print(f"CV std           : {report['cv_std_accuracy'] * 100:.2f}%")
    print(f"Training sources : {report['training_sources']}")
    print(f"Kaggle samples   : {report['kaggle_sample_count']}")
    print(f"Model saved      : {MODEL_PATH}")
    print(f"Report saved     : {REPORT_PATH}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
