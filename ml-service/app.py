# ml-service/app.py
# FINAL VERSION

import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

CORS(app, resources={
    r"/ml/*": {
        "origins": "*"
    },
    r"/health": {
        "origins": "*"
    }
})

# ── Import blueprints ──────────────────────────────────
# Import AFTER app is created to avoid circular imports
from classify  import classify_bp
from weakarea  import weakarea_bp
from readiness import readiness_bp
from dropout import dropout_bp
from cheating import cheating_bp
from proctoring import proctoring_bp

app.register_blueprint(classify_bp,  url_prefix='/ml')
app.register_blueprint(weakarea_bp,  url_prefix='/ml')
app.register_blueprint(readiness_bp, url_prefix='/ml')
app.register_blueprint(dropout_bp, url_prefix='/ml/dropout')
app.register_blueprint(cheating_bp, url_prefix='/ml/cheat')
app.register_blueprint(proctoring_bp, url_prefix='/ml/proctor')

# ── Health check ───────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'success': True,
        'status':  'OK',
        'service': 'DSA Platform ML Service',
        'version': '2.0',
        'endpoints': [
            'POST /ml/classify-level',
            'POST /ml/detect-weak-areas',
            'POST /ml/readiness-score',
            'GET  /ml/feature-importance',
            'GET  /ml/training-report',
            'GET  /ml/train',
            'POST /ml/proctor/analyze-frame',
        ]
    }), 200


@app.errorhandler(404)
def not_found(e):
    return jsonify({
        'success': False,
        'message': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({
        'success': False,
        'message': 'Internal server error',
        'detail':  str(e)
    }), 500


if __name__ == '__main__':
    port  = int(os.environ.get('FLASK_PORT', 8000))
    debug = os.environ.get('FLASK_ENV') == 'development'

    print(f'\n{"="*45}')
    print(f'  DSA ML Service — Port {port}')
    print(f'  Debug mode: {debug}')
    print(f'  Endpoints:')
    print(f'    GET  /health')
    print(f'    POST /ml/classify-level')
    print(f'    POST /ml/detect-weak-areas')
    print(f'    POST /ml/readiness-score')
    print(f'    GET  /ml/feature-importance')
    print(f'    GET  /ml/training-report')
    print(f'{"="*45}\n')

    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
