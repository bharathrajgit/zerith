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
            'phone_visible',
            'extra_screen_visible',
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
        logits = np.asarray(output[0], dtype=np.float32)
        if logits.ndim > 1:
            logits = logits[0]
        logits = logits - np.max(logits)
        exp_logits = np.exp(logits)
        probs = exp_logits / np.sum(exp_logits)
        label_index = int(np.argmax(probs))
        label = self.labels[label_index] if label_index < len(self.labels) else 'normal'
        confidence = float(probs[label_index])
        return label, confidence

    def _resize_for_analysis(self, image_array, width=96, height=96):
        if image_array is None or Image is None or np is None:
            return None
        resized = Image.fromarray(image_array).resize((width, height))
        return np.asarray(resized)

    def _skin_mask(self, image_array):
        if image_array is None or np is None:
            return None

        red = image_array[:, :, 0].astype(np.int16)
        green = image_array[:, :, 1].astype(np.int16)
        blue = image_array[:, :, 2].astype(np.int16)
        channel_span = np.max(image_array, axis=2).astype(np.int16) - np.min(image_array, axis=2).astype(np.int16)

        return (
            (red > 95)
            & (green > 40)
            & (blue > 20)
            & (channel_span > 15)
            & (np.abs(red - green) > 15)
            & (red > green)
            & (red > blue)
        )

    def _connected_components(self, mask, min_pixels=70):
        if mask is None or np is None:
            return []

        height, width = mask.shape
        visited = np.zeros_like(mask, dtype=bool)
        components = []

        for row in range(height):
            for col in range(width):
                if not mask[row, col] or visited[row, col]:
                    continue

                stack = [(row, col)]
                visited[row, col] = True
                count = 0
                min_row = max_row = row
                min_col = max_col = col
                sum_row = 0
                sum_col = 0

                while stack:
                    current_row, current_col = stack.pop()
                    count += 1
                    sum_row += current_row
                    sum_col += current_col
                    min_row = min(min_row, current_row)
                    max_row = max(max_row, current_row)
                    min_col = min(min_col, current_col)
                    max_col = max(max_col, current_col)

                    for row_offset in (-1, 0, 1):
                        for col_offset in (-1, 0, 1):
                            if row_offset == 0 and col_offset == 0:
                                continue
                            next_row = current_row + row_offset
                            next_col = current_col + col_offset
                            if next_row < 0 or next_col < 0 or next_row >= height or next_col >= width:
                                continue
                            if visited[next_row, next_col] or not mask[next_row, next_col]:
                                continue
                            visited[next_row, next_col] = True
                            stack.append((next_row, next_col))

                if count >= min_pixels:
                    components.append({
                        'count': count,
                        'min_row': min_row,
                        'max_row': max_row,
                        'min_col': min_col,
                        'max_col': max_col,
                        'center_x': sum_col / count,
                        'center_y': sum_row / count,
                    })

        components.sort(key=lambda item: item['count'], reverse=True)
        return components

    def _heuristic_analysis(self, image_array):
        detections = {
            'multipleFaces': False,
            'headPoseAway': False,
            'gazeAway': False,
            'faceMissing': False,
            'phoneVisible': False,
            'extraScreenVisible': False,
            'faceCount': 0,
        }

        confidence = 0.0

        if image_array is None or np is None:
            detections['faceMissing'] = True
            return detections, 0.45

        resized = self._resize_for_analysis(image_array)
        grayscale = np.mean(resized, axis=2)
        brightness = float(np.mean(grayscale))
        contrast = float(np.std(grayscale))
        gradient_strength = float(np.mean(np.abs(np.diff(grayscale, axis=1))) + np.mean(np.abs(np.diff(grayscale, axis=0))))

        if brightness < 20 or contrast < 7 or gradient_strength < 2.5:
            detections['faceMissing'] = True
            return detections, 0.58

        mask = self._skin_mask(resized)
        skin_ratio = float(np.mean(mask)) if mask is not None else 0.0
        center_slice = mask[22:74, 22:74] if mask is not None else None
        center_ratio = float(np.mean(center_slice)) if center_slice is not None else 0.0
        components = self._connected_components(mask)

        if not components or skin_ratio < 0.015 or center_ratio < 0.01:
            detections['faceMissing'] = True
            return detections, 0.56

        detections['faceCount'] = len(components)
        primary = components[0]
        image_height, image_width = mask.shape
        center_x_offset = abs((primary['center_x'] / max(image_width - 1, 1)) - 0.5)
        area_ratio = primary['count'] / float(image_height * image_width)

        if len(components) >= 2:
            secondary = components[1]
            secondary_ratio = secondary['count'] / float(image_height * image_width)
            centers_far_apart = abs(primary['center_x'] - secondary['center_x']) > (image_width * 0.18)
            if secondary_ratio > 0.025 and centers_far_apart:
                detections['multipleFaces'] = True
                confidence = max(confidence, 0.72)
                detections['faceCount'] = len(components)

        if center_x_offset > 0.22 and area_ratio > 0.03:
            detections['headPoseAway'] = True
            confidence = max(confidence, 0.63)

        if center_x_offset > 0.14 and center_ratio < 0.13:
            detections['gazeAway'] = True
            confidence = max(confidence, 0.57)

        if area_ratio < 0.03:
            detections['faceMissing'] = True
            detections['faceCount'] = 0
            confidence = max(confidence, 0.54)

        if not any([
            detections['multipleFaces'],
            detections['headPoseAway'],
            detections['gazeAway'],
            detections['faceMissing'],
        ]):
            confidence = max(confidence, 0.34)

        return detections, confidence

    def _build_alerts(self, detections, confidence):
        mapping = [
            ('multipleFaces', 'MULTIPLE_FACES', 'Multiple faces detected in the frame.', 'HIGH'),
            ('headPoseAway', 'HEAD_POSE_AWAY', 'Head pose appears turned away from the screen.', 'MEDIUM'),
            ('gazeAway', 'GAZE_AWAY', 'Gaze appears away from the screen.', 'MEDIUM'),
            ('faceMissing', 'FACE_MISSING', 'The face is missing or not clearly visible.', 'MEDIUM'),
            ('phoneVisible', 'PHONE_VISIBLE', 'A phone appears visible in the frame.', 'HIGH'),
            ('extraScreenVisible', 'EXTRA_SCREEN_VISIBLE', 'An extra screen appears visible in the frame.', 'HIGH'),
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
                'phoneVisible': label == 'phone_visible',
                'extraScreenVisible': label == 'extra_screen_visible',
                'faceCount': 0 if label == 'face_missing' else 2 if label == 'multiple_faces' else 1,
            }
            model_source = 'onnx'
        else:
            detections, confidence = self._heuristic_analysis(image_array)
            model_source = 'heuristic'

        alerts = self._build_alerts(detections, confidence)
        risk_score = 0.15
        if detections['multipleFaces']:
            risk_score = max(risk_score, 0.82)
        if detections['phoneVisible']:
            risk_score = max(risk_score, 0.88)
        if detections['extraScreenVisible']:
            risk_score = max(risk_score, 0.84)
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
            'fallback': model_source == 'heuristic',
            'metadata': {
                'deviceType': metadata.get('deviceType', 'unknown'),
                'modelLoaded': self.session is not None,
                'modelSource': model_source,
            },
        }
