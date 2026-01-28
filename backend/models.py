from mongoengine import Document, StringField, FloatField, DateTimeField, ReferenceField, CASCADE
from datetime import datetime

class User(Document):
    name = StringField(max_length=100, required=True)
    email = StringField(max_length=120, unique=True, required=True)
    password = StringField(max_length=200, required=True)
    role = StringField(max_length=20, required=True)

class Product(Document):
    farmer = ReferenceField(User, reverse_delete_rule=CASCADE)
    vegetable_name = StringField(max_length=100, required=True)
    market_price = FloatField(required=True)
    farmer_earnings = FloatField(required=True)
    quantity = FloatField(required=True)
    image_url = StringField(max_length=255)
    status = StringField(max_length=20, default='pending')
    created_at = DateTimeField(default=datetime.utcnow)

class Order(Document):
    buyer = ReferenceField(User, reverse_delete_rule=CASCADE)
    product = ReferenceField(Product, reverse_delete_rule=CASCADE)
    quantity = FloatField(required=True)
    total_price = FloatField(required=True)
    status = StringField(max_length=20, default='completed')
    created_at = DateTimeField(default=datetime.utcnow)
