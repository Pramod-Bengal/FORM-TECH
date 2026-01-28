from mongoengine import connect, Document, StringField
import sys

MONGO_URI = 'mongodb+srv://agricuture-tech:Pramod%40200405@cluster0.4xgd0jc.mongodb.net/agriculture_db?retryWrites=true&w=majority&appName=Cluster0'

import certifi
import dns.resolver

# DNS Fix
dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ['8.8.8.8']

try:
    print("Testing connection to MongoDB Atlas...")
    client = connect(host=MONGO_URI)
    print("Connected successfully!")
    
    class TestDoc(Document):
        name = StringField()

    # Try to write and delete a test document
    test = TestDoc(name="Connection Test")
    test.save()
    print("Write test successful!")
    test.delete()
    print("Database is ready and permissions are verified.")
    
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)
