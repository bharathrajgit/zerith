import os
import shutil
import subprocess
from pathlib import Path


def main():
    dataset_slug = os.environ.get('PROCTOR_KAGGLE_DATASET', '').strip()
    if not dataset_slug:
        raise SystemExit('Set PROCTOR_KAGGLE_DATASET before running this script.')

    data_dir = Path(os.environ.get('ML_TRAINING_DATA_DIR', Path(__file__).resolve().parent / 'data' / 'raw'))
    data_dir.mkdir(parents=True, exist_ok=True)

    kaggle = shutil.which('kaggle')
    if not kaggle:
        raise SystemExit('Kaggle CLI not found. Install it with `pip install kaggle` and configure your API token first.')

    command = [
        kaggle,
        'datasets',
        'download',
        '-d',
        dataset_slug,
        '-p',
        str(data_dir),
        '--unzip',
    ]

    print('Downloading dataset:', dataset_slug)
    subprocess.run(command, check=True)
    print('Dataset ready at:', data_dir)


if __name__ == '__main__':
    main()
