# Proctor Model Training

This directory contains the training scaffold for the webcam monitoring model used by the DSA platform.

## Goal

Train a lightweight proctoring classifier that can export to ONNX and support these session-level signals:

- `normal`
- `gaze_away`
- `head_pose_away`
- `multiple_faces`
- `face_missing`
- `phone_visible`
- `extra_screen_visible`

The runtime endpoint is `ml-service -> POST /ml/proctor/analyze-frame`.

## Dataset Strategy

This scaffold is intentionally **dataset-slug configurable** through `PROCTOR_KAGGLE_DATASET` instead of hard-coding one Kaggle slug in code. Kaggle ownership, licensing, and exact slugs can change, so the pipeline stays stable while you plug in the webcam/proctoring dataset you choose.

Recommended class layout after download/prep:

- `normal/`
- `gaze_away/`
- `head_pose_away/`
- `multiple_faces/`
- `face_missing/`
- `phone_visible/`
- `extra_screen_visible/`

The existing repo reference to `Mercor Cheating Detection` is still useful for session-level calibration, but the proctoring image model should be trained from a webcam-appropriate dataset with frame/image labels.

## Quick Start

1. Set environment variables:

```powershell
$env:PROCTOR_KAGGLE_DATASET="your-kaggle-slug"
$env:ML_TRAINING_DATA_DIR="D:\VS Code Folder\dsa-platform\ml-training\data\raw"
```

2. Download and unpack:

```powershell
python ml-training\download_dataset.py
python ml-training\prepare_dataset.py
```

3. Train:

```powershell
python ml-training\train_proctor_model.py
```

4. Export to ONNX for runtime:

```powershell
python ml-training\export_onnx.py
```

5. Verify artifacts:

- `ml-training\artifacts\best_model.pt`
- `ml-training\artifacts\training_metrics.json`
- `ml-service\trained_models\proctor_monitor.onnx`
- `ml-service\trained_models\proctor_labels.json`
- `ml-service\trained_models\proctor_training_report.json`

## Threshold Defaults

These are the default runtime thresholds expected by the app:

- `multiple_faces` -> high risk, immediate warning candidate
- `head_pose_away` -> medium risk
- `gaze_away` -> medium risk
- `face_missing` -> medium risk
- `phone_visible` -> high risk, immediate warning candidate
- `extra_screen_visible` -> high risk, immediate warning candidate
- warning suggestion threshold -> `riskScore >= 0.45`

## Notes

- The runtime contract is fixed to the seven labels above, in that exact order.
- The current runtime endpoint supports fallback behavior when the ONNX file is not present yet.
- Heuristic fallback stays face-only; gadget classes are emitted only by an ONNX model.
- Raw video should not be persisted by default; only derived alerts and aggregated metadata are stored in app data.
