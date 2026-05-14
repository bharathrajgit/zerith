from flask import Blueprint, request, jsonify
from models.dropout_predictor import DropoutPredictor

dropout_bp = Blueprint('dropout', __name__)
predictor = DropoutPredictor()

@dropout_bp.route('/predict', methods=['POST'])
def predict_dropout():
    try:
        data = request.get_json()
        # Expecting a list of 9 features in the same order as training
        features = [
            data.get('num_prev_attempts', 0) / 10.0,
            data.get('studied_credits', 0) / 180.0,
            data.get('avg_score', 0) / 100.0,
            data.get('engagement_score', 0),
            data.get('performance_score', 0),
            data.get('risk_score', 0),
            data.get('days_active', 0) / 365.0,
            data.get('module_count', 0) / 10.0,
            data.get('consistency', 0)
        ]
        result = predictor.predict(features)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500  