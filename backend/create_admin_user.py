from models import User
from mongoengine import connect
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash
import certifi

load_dotenv()

try:
    # Handle potentially missing certifi
    ca = certifi.where()
    connect(host=os.getenv('MONGO_URI'), tlsCAFile=ca)
    
    email = 'pramodbenagal@gmail.com'
    password = 'Pramod@2004'
    name = 'System Admin'

    # Check if user exists
    user = User.objects(email=email).first()
    
    if user:
        print(f"User {email} exists. Updating to admin...")
        user.role = 'admin'
        user.password = generate_password_hash(password)
        user.name = name # Ensure name is set
        user.save()
        print("✅ Admin updated successfully!")
    else:
        print(f"Creating new admin user {email}...")
        new_admin = User(
            name=name,
            email=email,
            password=generate_password_hash(password),
            role='admin'
        )
        new_admin.save()
        print("✅ Admin created successfully!")

except Exception as e:
    print(f"❌ Error: {e}")
