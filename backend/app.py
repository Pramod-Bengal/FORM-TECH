from flask import Flask
from extensions import jwt
from flask_cors import CORS
import os
from mongoengine import connect
from dotenv import load_dotenv
import certifi
import dns.resolver
from datetime import timedelta


dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ['8.8.8.8']

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)

    MONGO_URI = os.getenv('MONGO_URI')
    ca = certifi.where()
    
    
    max_retries = 3
    retry_delay = 2
    connected = False
    
    for attempt in range(max_retries):
        try:
            print(f"🔄 Attempting to connect to MongoDB (attempt {attempt + 1}/{max_retries})...")
            connect(
                host=MONGO_URI, 
                tlsCAFile=ca,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000
            )
            print("✅ Successfully connected to MongoDB Atlas!")
            connected = True
            break
        except Exception as e:
            print(f"⚠️  MongoDB connection attempt {attempt + 1} failed: {str(e)[:100]}")
            if attempt < max_retries - 1:
                print(f"   Retrying in {retry_delay} seconds...")
                import time
                time.sleep(retry_delay)
            else:
                print("❌ Could not connect to MongoDB. Server will start but database operations will fail.")
                print("   Please check your internet connection and MongoDB Atlas configuration.")

    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
    app.config['UPLOAD_FOLDER'] = 'uploads'

    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    jwt.init_app(app)

    with app.app_context():
        from routes import api
        app.register_blueprint(api)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000, use_reloader=False)

