from flask import Blueprint, request, jsonify
from models.cheating_detector import CheatingDetector

cheating_bp = Blueprint('cheating', __name__)
detector = CheatingDetector()

@cheating_bp.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        features = [
            data.get('avg_time', 0),
            data.get('std_time', 0),
            data.get('fast_slow_ratio', 0),
            data.get('tab_switches', 0),
            data.get('copy_attempts', 0),
            data.get('window_blur', 0),
            data.get('hint_rate', 0),
            data.get('changed_answers', 0),
            data.get('total_questions', 10),
            data.get('past_avg_accuracy', 50)
        ]
        result = detector.predict(features)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500