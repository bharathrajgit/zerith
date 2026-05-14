import json
from pathlib import Path

try:
    import torch
    from torch import nn
    from torchvision import models
except Exception as exc:  # pragma: no cover
    raise SystemExit(
        'PyTorch dependencies are required for export. Install ml-training/requirements.txt first.'
    ) from exc


def main():
    base_dir = Path(__file__).resolve().parent
    artifacts_dir = base_dir / 'artifacts'
    checkpoint_path = artifacts_dir / 'best_model.pt'
    if not checkpoint_path.exists():
        raise SystemExit('Checkpoint not found. Run train_proctor_model.py first.')

    payload = torch.load(checkpoint_path, map_location='cpu')
    classes = payload.get('classes', [])

    model = models.mobilenet_v3_small(weights=None)
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, len(classes))
    model.load_state_dict(payload['state_dict'])
    model.eval()

    dummy = torch.randn(1, 3, 224, 224)
    output_dir = base_dir.parent / 'ml-service' / 'trained_models'
    output_dir.mkdir(parents=True, exist_ok=True)
    onnx_path = output_dir / 'proctor_monitor.onnx'

    torch.onnx.export(
        model,
        dummy,
        onnx_path,
        input_names=['image'],
        output_names=['logits'],
        dynamic_axes={'image': {0: 'batch'}, 'logits': {0: 'batch'}},
        opset_version=12,
    )

    with open(output_dir / 'proctor_labels.json', 'w', encoding='utf-8') as handle:
        json.dump({'labels': classes}, handle, indent=2)

    print('Exported ONNX model to', onnx_path)


if __name__ == '__main__':
    main()
