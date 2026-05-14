import json
from pathlib import Path

try:
    import torch
    from torch import nn, optim
    from torch.utils.data import DataLoader, random_split
    from torchvision import datasets, models, transforms
except Exception as exc:  # pragma: no cover
    raise SystemExit(
        'PyTorch dependencies are required for training. Install ml-training/requirements.txt first.'
    ) from exc


CLASS_LABELS = [
    'normal',
    'gaze_away',
    'head_pose_away',
    'multiple_faces',
    'face_missing',
]


def main():
    base_dir = Path(__file__).resolve().parent
    prepared_dir = base_dir / 'data' / 'prepared'
    artifacts_dir = base_dir / 'artifacts'
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])

    dataset = datasets.ImageFolder(prepared_dir, transform=transform)
    if len(dataset) == 0:
        raise SystemExit('Prepared dataset is empty. Run prepare_dataset.py first.')

    train_size = int(len(dataset) * 0.8)
    val_size = len(dataset) - train_size
    train_set, val_set = random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(train_set, batch_size=16, shuffle=True)
    val_loader = DataLoader(val_set, batch_size=16, shuffle=False)

    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, len(dataset.classes))

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=1e-4)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)

    epochs = 3
    best_val_accuracy = 0.0

    for epoch in range(epochs):
        model.train()
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            logits = model(images)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()

        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                logits = model(images)
                predictions = torch.argmax(logits, dim=1)
                total += labels.size(0)
                correct += (predictions == labels).sum().item()

        val_accuracy = correct / total if total else 0.0
        print(f'Epoch {epoch + 1}/{epochs} - val_accuracy={val_accuracy:.4f}')

        if val_accuracy >= best_val_accuracy:
            best_val_accuracy = val_accuracy
            torch.save(
                {
                    'state_dict': model.state_dict(),
                    'classes': dataset.classes,
                },
                artifacts_dir / 'best_model.pt',
            )

    metrics = {
        'validation_accuracy': round(best_val_accuracy, 4),
        'classes': dataset.classes,
        'expected_labels': CLASS_LABELS,
        'checkpoint_path': str(artifacts_dir / 'best_model.pt'),
    }
    with open(artifacts_dir / 'training_metrics.json', 'w', encoding='utf-8') as handle:
        json.dump(metrics, handle, indent=2)

    print('Saved checkpoint to', artifacts_dir / 'best_model.pt')
    print('Saved metrics to', artifacts_dir / 'training_metrics.json')


if __name__ == '__main__':
    main()
