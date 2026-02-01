from mongoengine import Document, StringField, FloatField, DateTimeField, ReferenceField, CASCADE
from datetime import datetime

class User(Document):
    name = StringField(max_length=100, required=True)
    email = StringField(max_length=120, unique=True, required=True)
    password = StringField(max_length=200, required=True)
    role = StringField(max_length=20, required=True) # 'farmer', 'buyer', 'admin'

class Product(Document):
    farmer = ReferenceField(User, reverse_delete_rule=CASCADE)
    vegetable_name = StringField(required=True)
    market_price = FloatField(required=True) # Price buyer pays
    farmer_earnings = FloatField(required=True) # Price farmer gets (market_price - transport)
    quantity = FloatField(required=True)
    image_url = StringField()
    status = StringField(default='pending') # 'pending', 'approved', 'refused'
    created_at = DateTimeField(default=datetime.utcnow)

class Order(Document):
    buyer = ReferenceField(User, reverse_delete_rule=CASCADE)
    product = ReferenceField(Product, reverse_delete_rule=CASCADE)
    quantity = FloatField(required=True)
    total_price = FloatField(required=True)
    payment_method = StringField(required=True)
    delivery_address = StringField(required=True)
    status = StringField(default='completed')
    created_at = DateTimeField(default=datetime.utcnow)
