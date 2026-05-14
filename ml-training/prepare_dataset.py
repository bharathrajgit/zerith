import json
import os
from pathlib import Path
from shutil import copy2


IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}


def load_class_map(base_dir):
    class_map_path = Path(os.environ.get('PROCTOR_CLASS_MAP', base_dir / 'class_map.example.json'))
    with open(class_map_path, 'r', encoding='utf-8') as handle:
        return json.load(handle)


def iter_images(directory):
    for path in directory.rglob('*'):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTS:
            yield path


def main():
    base_dir = Path(__file__).resolve().parent
    raw_dir = Path(os.environ.get('ML_TRAINING_DATA_DIR', base_dir / 'data' / 'raw'))
    prepared_dir = base_dir / 'data' / 'prepared'
    prepared_dir.mkdir(parents=True, exist_ok=True)

    class_map = load_class_map(base_dir)

    for canonical in class_map:
        (prepared_dir / canonical).mkdir(parents=True, exist_ok=True)

    copied = 0
    for source_dir in raw_dir.iterdir():
        if not source_dir.is_dir():
            continue

        normalized_name = source_dir.name.strip().lower()
        target_class = None
        for canonical, aliases in class_map.items():
            alias_pool = {canonical.lower(), *[alias.lower() for alias in aliases]}
            if normalized_name in alias_pool:
                target_class = canonical
                break

        if not target_class:
            continue

        target_dir = prepared_dir / target_class
        for image_path in iter_images(source_dir):
            destination = target_dir / image_path.name
            if destination.exists():
                destination = target_dir / f'{image_path.stem}_{copied}{image_path.suffix}'
            copy2(image_path, destination)
            copied += 1

    print('Prepared dataset at:', prepared_dir)
    print('Total copied images:', copied)


if __name__ == '__main__':
    main()
