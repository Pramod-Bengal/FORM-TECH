from flask import Flask
from extensions import jwt
from flask_cors import CORS
import os
from mongoengine import connect
from dotenv import load_dotenv
import certifi
import dns.resolver
from datetime import timedelta
import sys

# Removed manual DNS resolver config to rely on system defaults
# dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
# dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4', '1.1.1.1']

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)

    # MongoDB Atlas Connection
    MONGO_URI = os.getenv('MONGO_URI')
    ca = certifi.where()
    
    # Try to connect to MongoDB with retries
    connected = False
    for attempt in range(3):
        try:
            print(f"🔄 Attempting to connect to MongoDB (Attempt {attempt + 1}/3)...")
            connect(
                host=MONGO_URI, 
                tlsCAFile=ca,
                serverSelectionTimeoutMS=20000, # Increased timeout
                connectTimeoutMS=20000,
                socketTimeoutMS=20000,
                uuidRepresentation='standard'
            )
            # Verify connection
            from models import User
            User.objects.first() 
            print("✅ Successfully connected to MongoDB Atlas!")
            connected = True
            break
        except Exception as e:
            print(f"⚠️ Connection attempt {attempt + 1} failed: {str(e)}")
            import time
            time.sleep(2)
    
    if not connected:
        print("❌ CRITICAL: Could not connect to MongoDB after 3 attempts. Aborting start-up.")
        print("Please check your internet connection or verify your MONGO_URI in .env.")
        sys.exit(1)

    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
    app.config['UPLOAD_FOLDER'] = 'uploads'

    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    jwt.init_app(app)

    with app.app_context():
        from routes import api
        app.register_blueprint(api)

    @app.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        from flask import send_from_directory
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000, use_reloader=False)
