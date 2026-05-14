import base64
import json
import os
from io import BytesIO

try:
    import numpy as np
except Exception:  # pragma: no cover - optional dependency
    np = None

try:
    from PIL import Image
except Exception:  # pragma: no cover - optional dependency
    Image = None

try:
    import onnxruntime as ort
except Exception:  # pragma: no cover - optional dependency
    ort = None


class ProctorMonitor:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(__file__))
        self.model_path = os.path.join(base_dir, 'trained_models', 'proctor_monitor.onnx')
        self.labels_path = os.path.join(base_dir, 'trained_models', 'proctor_labels.json')
        self.labels = self._load_labels()
        self.session = self._load_session()

    def _load_labels(self):
        if os.path.exists(self.labels_path):
            try:
                with open(self.labels_path, 'r', encoding='utf-8') as handle:
                    payload = json.load(handle)
                labels = payload.get('labels') if isinstance(payload, dict) else payload
                if isinstance(labels, list) and labels:
                    return labels
            except Exception:
                pass

        return [
            'normal',
            'gaze_away',
            'head_pose_away',
            'multiple_faces',
            'face_missing',
        ]

    def _load_session(self):
        if not (ort and os.path.exists(self.model_path)):
            return None

        try:
            return ort.InferenceSession(self.model_path, providers=['CPUExecutionProvider'])
        except Exception:
            return None

    def _decode_image(self, image_data):
        if not image_data or not isinstance(image_data, str):
            return None

        try:
            encoded = image_data.split(',', 1)[1] if ',' in image_data else image_data
            raw = base64.b64decode(encoded)
            if not (Image and np):
                return None
            image = Image.open(BytesIO(raw)).convert('RGB')
            return np.array(image)
        except Exception:
            return None

    def _preprocess(self, image_array):
        if image_array is None or Image is None or np is None:
            return None

        resized = Image.fromarray(image_array).resize((224, 224))
        arr = np.asarray(resized).astype('float32') / 255.0
        arr = np.transpose(arr, (2, 0, 1))
        return np.expand_dims(arr, axis=0)

    def _run_onnx(self, image_array):
        if self.session is None or np is None:
            return None

        tensor = self._preprocess(image_array)
        if tensor is None:
            return None

        input_name = self.session.get_inputs()[0].name
        output = self.session.run(None, {input_name: tensor})[0]
        probs = output[0]
        label_index = int(np.argmax(probs))
        label = self.labels[label_index] if label_index < len(self.labels) else 'normal'
        confidence = float(probs[label_index])
        return label, confidence

    def _heuristic_analysis(self, image_array):
        detections = {
            'multipleFaces': False,
            'headPoseAway': False,
            'gazeAway': False,
            'faceMissing': False,
            'faceCount': 1,
        }

        confidence = 0.0

        if image_array is not None and np is not None:
            grayscale = np.mean(image_array, axis=2)
            brightness = float(np.mean(grayscale))
            contrast = float(np.std(grayscale))

            if brightness < 18 or contrast < 6:
                detections['faceMissing'] = True
                confidence = 0.55

        return detections, confidence

    def _build_alerts(self, detections, confidence):
        mapping = [
            ('multipleFaces', 'MULTIPLE_FACES', 'Multiple faces detected in the frame.', 'HIGH'),
            ('headPoseAway', 'HEAD_POSE_AWAY', 'Head pose appears turned away from the screen.', 'MEDIUM'),
            ('gazeAway', 'GAZE_AWAY', 'Gaze appears away from the screen.', 'MEDIUM'),
            ('faceMissing', 'FACE_MISSING', 'The face is missing or not clearly visible.', 'MEDIUM'),
        ]

        alerts = []
        for key, code, message, severity in mapping:
            if detections.get(key):
                alerts.append({
                    'code': code,
                    'message': message,
                    'severity': severity,
                    'confidence': round(float(confidence or 0), 4),
                })

        return alerts

    def analyze_frame(self, image_data, metadata=None):
        metadata = metadata or {}
        image_array = self._decode_image(image_data)

        label_confidence = self._run_onnx(image_array)
        if label_confidence:
            label, confidence = label_confidence
            detections = {
                'multipleFaces': label == 'multiple_faces',
                'headPoseAway': label == 'head_pose_away',
                'gazeAway': label == 'gaze_away',
                'faceMissing': label == 'face_missing',
                'faceCount': 2 if label == 'multiple_faces' else 1,
            }
        else:
            detections, confidence = self._heuristic_analysis(image_array)

        alerts = self._build_alerts(detections, confidence)
        risk_score = 0.15
        if detections['multipleFaces']:
            risk_score = max(risk_score, 0.82)
        if detections['headPoseAway'] or detections['gazeAway']:
            risk_score = max(risk_score, 0.58)
        if detections['faceMissing']:
            risk_score = max(risk_score, 0.52)

        risk_level = 'LOW'
        if risk_score >= 0.75:
            risk_level = 'HIGH'
        elif risk_score >= 0.45:
            risk_level = 'MEDIUM'

        signals = [alert['code'] for alert in alerts]

        return {
            'riskScore': round(float(risk_score), 4),
            'riskLevel': risk_level,
            'alerts': alerts,
            'detections': detections,
            'warningSuggested': risk_level in ('MEDIUM', 'HIGH'),
            'confidence': round(float(confidence or 0), 4),
            'signals': signals,
            'fallback': self.session is None,
            'metadata': {
                'deviceType': metadata.get('deviceType', 'unknown'),
                'modelLoaded': self.session is not None,
            },
        }
