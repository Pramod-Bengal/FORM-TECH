from models import User, Product, Order
from mongoengine import connect
import os
from dotenv import load_dotenv
import certifi

load_dotenv()
ca = certifi.where()
connect(host=os.getenv('MONGO_URI'), tlsCAFile=ca)

print("🔧 Starting database migration...")

# Fix all products without status field
products_updated = 0
for product in Product.objects():
    if not hasattr(product, 'status') or product.status is None:
        product.status = 'pending'
        product.save()
        products_updated += 1
        print(f"  ✅ Updated product: {product.vegetable_name}")

print(f"\n✅ Migration complete! Updated {products_updated} products")

# Show summary
total_products = Product.objects.count()
total_users = User.objects.count()
total_orders = Order.objects.count()

print(f"\n📊 Database Summary:")
print(f"  Users: {total_users}")
print(f"  Products: {total_products}")
print(f"  Orders: {total_orders}")
print(f"\n  Products by status:")
print(f"    Pending: {Product.objects(status='pending').count()}")
print(f"    Approved: {Product.objects(status='approved').count()}")
print(f"    Refused: {Product.objects(status='refused').count()}")
