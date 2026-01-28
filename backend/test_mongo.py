# Simple script to test if MongoDB connection is working
from mongoengine import connect
import os
from dotenv import load_dotenv
import certifi

load_dotenv()

try:
    print("🔄 Testing MongoDB connection...")
    ca = certifi.where()
    connect(
        host=os.getenv('MONGO_URI'), 
        tlsCAFile=ca,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000
    )
    print("✅ MongoDB connection successful!")
    
    # Try to query
    from models import User
    user_count = User.objects.count()
    print(f"📊 Found {user_count} users in database")
    
except Exception as e:
    print(f"❌ MongoDB connection failed: {str(e)}")
    print("\n💡 Possible solutions:")
    print("   1. Check your internet connection")
    print("   2. Verify MongoDB Atlas IP whitelist")
    print("   3. Try using mobile hotspot")
    print("   4. Wait and try again later")
