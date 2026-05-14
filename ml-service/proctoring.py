from flask import Blueprint, jsonify, request
from models.proctor_monitor import ProctorMonitor

proctoring_bp = Blueprint('proctoring', __name__)
monitor = ProctorMonitor()


@proctoring_bp.route('/analyze-frame', methods=['POST'])
def analyze_frame():
    try:
        payload = request.get_json() or {}
        image_data = payload.get('imageData')
        metadata = payload.get('metadata', {})

        if not image_data:
            return jsonify({
                'success': False,
                'message': 'imageData is required',
            }), 400

        result = monitor.analyze_frame(image_data, metadata)
        return jsonify({
            'success': True,
            'data': result,
        }), 200
    except Exception as exc:
        return jsonify({
            'success': False,
            'message': 'Failed to analyze frame',
            'detail': str(exc),
        }), 500
