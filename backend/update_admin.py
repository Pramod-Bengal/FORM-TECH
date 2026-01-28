from models import User
from mongoengine import connect
import os
from dotenv import load_dotenv
import certifi

load_dotenv()
ca = certifi.where()
connect(host=os.getenv('MONGO_URI'), tlsCAFile=ca)

# Update existing user to admin
admin = User.objects(email='pramodbenagal@gmail.com').first()
if admin:
    admin.role = 'admin'
    admin.save()
    print(f'✅ Updated {admin.name} to admin role')
else:
    print('❌ User not found')
