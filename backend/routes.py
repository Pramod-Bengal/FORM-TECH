from flask import Blueprint, request, jsonify, send_from_directory
from models import User, Product, Order
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json
from werkzeug.utils import secure_filename
from flask import current_app
from bson import ObjectId

api = Blueprint('api', __name__)


def calculate_price(farmer_price_per_kg, quantity):
    transport_charge_per_kg = 5
    total_transport_deduction = quantity * transport_charge_per_kg
    

    farmer_earnings_per_kg = farmer_price_per_kg - transport_charge_per_kg
    
    return farmer_earnings_per_kg, total_transport_deduction

@api.route('/api/auth/register', methods=['POST'])
def register():
    print("DEBUG: Register endpoint hit")
    try:
        data = request.get_json()
        print(f"DEBUG: Registering user {data.get('email')} with role {data.get('role')}")
        
        if User.objects(email=data['email']).first():
            print("DEBUG: Email already exists")
            return jsonify({"msg": "Email already exists"}), 400
        
        hashed_password = generate_password_hash(data['password'])
        # Store user data
        new_user = User(
            name=data['name'],
            email=data['email'],
            password=hashed_password,
            role=data.get('role', 'buyer')
        )
        new_user.save()
        print(f"DEBUG: User {new_user.id} created successfully")
        return jsonify({"msg": "User created successfully"}), 201
    except Exception as e:
        print(f"ERROR in register: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"msg": f"Registration failed: {str(e)}"}), 500

@api.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.objects(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):

        identity_dict = {'id': str(user.id), 'role': user.role, 'name': user.name}
        access_token = create_access_token(identity=json.dumps(identity_dict))
        return jsonify(access_token=access_token, role=user.role, name=user.name), 200
    return jsonify({"msg": "Invalid email or password"}), 401

@api.route('/api/farmer/products', methods=['POST'])
@jwt_required()
def add_product():
    raw_identity = get_jwt_identity()
    try:
        identity = json.loads(raw_identity) if isinstance(raw_identity, str) else raw_identity
    except json.JSONDecodeError:
        return jsonify({"msg": "Invalid token identity"}), 422

    print(f"DEBUG: Farmer {identity['name']} (ID: {identity['id']}) attempting to add product.")
    
    if identity['role'] != 'farmer':
        return jsonify({"msg": "Unauthorized"}), 403
    

    try:
        farmer_id = ObjectId(identity['id'])
    except:
        return jsonify({"msg": "Invalid user ID format"}), 400

    try:

        vegetable_name = request.form.get('vegetable_name')
        price_str = request.form.get('price')
        qty_str = request.form.get('quantity')
        
        if not vegetable_name or not price_str or not qty_str:
            return jsonify({"msg": "Missing required fields"}), 400
            
        market_price = float(price_str)
        quantity = float(qty_str)
        
        if quantity < 10:
             return jsonify({"msg": "Minimum quantity must be 10kg"}), 400
        
        print(f"DEBUG: Received product data - Name: {vegetable_name}, Price: {market_price}, Qty: {quantity}")
        
        farmer_net_per_kg, transport_total = calculate_price(market_price, quantity)
        
        image_file = request.files.get('image')
        image_url = ""
        if image_file:
            filename = secure_filename(image_file.filename)
            upload_dir = current_app.config['UPLOAD_FOLDER']
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)
            image_path = os.path.join(upload_dir, filename)
            image_file.save(image_path)
            image_url = f"/uploads/{filename}"
            print(f"DEBUG: Image saved to {image_url}")


        farmer_user = User.objects(id=farmer_id).first()
        if not farmer_user:
             return jsonify({"msg": "Farmer user not found"}), 404

        print(f"DEBUG: Found farmer user: {farmer_user.name}")
        
        new_product = Product(
            farmer=farmer_user,
            vegetable_name=vegetable_name,
            market_price=market_price,
            farmer_earnings=farmer_net_per_kg,
            quantity=quantity,
            image_url=image_url,
            status='pending'
        )
        new_product.save()
        print(f"DEBUG: Product {new_product.id} saved successfully to MongoDB.")
        return jsonify({
            "msg": "Product added successfully", 
            "earnings_per_kg": farmer_net_per_kg,
            "transport_deduction_total": transport_total,
            "id": str(new_product.id)
        }), 201
    except ValueError:
        return jsonify({"msg": "Price and Quantity must be valid numbers"}), 400
    except Exception as e:
        print(f"ERROR: Failed to save product - {str(e)}")
        return jsonify({"msg": f"Failed to add product: {str(e)}"}), 500

@api.route('/api/farmer/my-products', methods=['GET'])
@jwt_required()
def get_my_products():
    raw_identity = get_jwt_identity()
    try:
        identity = json.loads(raw_identity) if isinstance(raw_identity, str) else raw_identity
    except:
         return jsonify({"msg": "Invalid token"}), 422
    try:
        print(f"DEBUG: Fetching products for farmer ID: {identity['id']}")
        products = Product.objects(farmer=ObjectId(identity['id'])).order_by('-created_at')
        print(f"DEBUG: Found {len(products)} products")
        return jsonify([{
            "id": str(p.id),
            "name": p.vegetable_name,
            "price": p.market_price,
            "base_price": p.farmer_earnings,
            "quantity": p.quantity,
            "status": p.status,
            "image": p.image_url
        } for p in products])
    except Exception as e:
        print(f"ERROR in get_my_products: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"msg": f"Error fetching products: {str(e)}"}), 500

@api.route('/api/buyer/products', methods=['GET'])
def get_all_products():

    products = Product.objects(quantity__gt=0, status='approved')
    return jsonify([{
        "id": str(p.id),
        "name": p.vegetable_name,
        "price": p.market_price,
        "quantity": p.quantity,
        "image": p.image_url,
        "farmer_name": p.farmer.name if p.farmer else "Unknown Farmer"
    } for p in products])

@api.route('/api/buyer/order', methods=['POST'])
@jwt_required()
def place_order():
    raw_identity = get_jwt_identity()
    try:
        identity = json.loads(raw_identity) if isinstance(raw_identity, str) else raw_identity
    except:
         return jsonify({"msg": "Invalid token"}), 422

    if identity['role'] != 'buyer':
        return jsonify({"msg": "Unauthorized"}), 403
    
    data = request.get_json()
    product = Product.objects(id=data['product_id']).first()
    if not product or product.quantity < data['quantity']:
        return jsonify({"msg": "Product unavailable or insufficient quantity"}), 400
    
    total_price = data['quantity'] * product.market_price
    
    new_order = Order(
        buyer=ObjectId(identity['id']),
        product=product,
        quantity=data['quantity'],
        total_price=total_price,
        status='completed'
    )
    
    product.quantity -= data['quantity']
    product.save()
    new_order.save()
    
    return jsonify({"msg": "Order placed successfully", "total": total_price}), 201

@api.route('/api/farmer/orders', methods=['GET'])
@jwt_required()
def get_farmer_orders():
    raw_identity = get_jwt_identity()
    try:
        identity = json.loads(raw_identity) if isinstance(raw_identity, str) else raw_identity
    except:
         return jsonify({"msg": "Invalid token"}), 422

    if identity['role'] != 'farmer':
        return jsonify({"msg": "Unauthorized"}), 403
    
    try:
        print(f"DEBUG: Fetching orders for farmer ID: {identity['id']}")

        products = Product.objects(farmer=ObjectId(identity['id']))
        print(f"DEBUG: Found {len(products)} products for this farmer")
        orders = Order.objects(product__in=products).order_by('-created_at')
        print(f"DEBUG: Found {len(orders)} orders")
        
        return jsonify([{
            "id": str(o.id),
            "product_name": o.product.vegetable_name if o.product else "Deleted Product",
            "buyer_name": o.buyer.name if o.buyer else "Unknown Buyer",
            "quantity": o.quantity,
            "total_price": o.total_price,
            "status": o.status,
            "date": o.created_at.strftime("%Y-%m-%d %H:%M")
        } for o in orders])
    except Exception as e:
        print(f"ERROR in get_farmer_orders: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"msg": f"Error fetching orders: {str(e)}"}), 500

@api.route('/api/buyer/my-orders', methods=['GET'])
@jwt_required()
def get_buyer_orders():
    raw_identity = get_jwt_identity()
    try:
        identity = json.loads(raw_identity) if isinstance(raw_identity, str) else raw_identity
    except:
         return jsonify({"msg": "Invalid token"}), 422

    if identity['role'] != 'buyer':
        return jsonify({"msg": "Unauthorized"}), 403
    
    try:
        print(f"DEBUG: Fetching orders for buyer ID: {identity['id']}")
        orders = Order.objects(buyer=ObjectId(identity['id'])).order_by('-created_at')
        print(f"DEBUG: Found {len(orders)} orders")
        return jsonify([{
            "id": str(o.id),
            "product_name": o.product.vegetable_name if o.product else "Deleted Product",
            "farmer_name": o.product.farmer.name if (o.product and o.product.farmer) else "Unknown Farmer",
            "quantity": o.quantity,
            "total_price": o.total_price,
            "status": o.status,
            "date": o.created_at.strftime("%Y-%m-%d %H:%M")
        } for o in orders])
    except Exception as e:
        print(f"ERROR in get_buyer_orders: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"msg": f"Error fetching orders: {str(e)}"}), 500

@api.route('/api/admin/pending-products', methods=['GET'])
@jwt_required()
def get_pending_products():
    raw_identity = get_jwt_identity()
    try:
        identity = json.loads(raw_identity) if isinstance(raw_identity, str) else raw_identity
    except:
         return jsonify({"msg": "Invalid token"}), 422

    if identity['role'] != 'admin':
        return jsonify({"msg": "Unauthorized"}), 403
    
    products = Product.objects(status='pending').order_by('-created_at')
    
    # Safe serialization
    result = []
    for p in products:
        try:
            farmer_name = p.farmer.name if p.farmer else "Unknown Farmer"
        except:
            farmer_name = "Unknown Farmer"
            
        result.append({
            "id": str(p.id),
            "name": p.vegetable_name,
            "farmer_name": farmer_name,
            "base_price": p.farmer_earnings,
            "final_price": p.market_price,
            "quantity": p.quantity,
            "image": p.image_url
        })
        
    return jsonify(result)

@api.route('/api/admin/product-action', methods=['POST'])
@jwt_required()
def product_action():
    raw_identity = get_jwt_identity()
    try:
        identity = json.loads(raw_identity) if isinstance(raw_identity, str) else raw_identity
    except:
         return jsonify({"msg": "Invalid token"}), 422

    if identity['role'] != 'admin':
        return jsonify({"msg": "Unauthorized"}), 403
    
    data = request.get_json()
    product = Product.objects(id=data['product_id']).first()
    if not product:
        return jsonify({"msg": "Product not found"}), 404
    
    product.status = data['action']
    product.save()
    return jsonify({"msg": f"Product {data['action']} successfully"}), 200

@api.route('/api/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    raw_identity = get_jwt_identity()
    try:
        identity = json.loads(raw_identity) if isinstance(raw_identity, str) else raw_identity
    except:
         return jsonify({"msg": "Invalid token"}), 422
    if identity['role'] != 'admin':
        return jsonify({"msg": "Unauthorized"}), 403
    
    total_farmers = User.objects(role='farmer').count()
    total_buyers = User.objects(role='buyer').count()
    total_products = Product.objects.count()
    orders = Order.objects()
    
    

    total_savings = sum(o.quantity * 5 for o in orders)
    total_revenue = sum(o.total_price for o in orders)
    

    activity_feed = []
    

    recent_orders = Order.objects.order_by('-created_at').limit(20)
    for o in recent_orders:
        activity_feed.append({
            "type": "order",
            "detail": f"Buyer {o.buyer.name if o.buyer else 'Unknown'} purchased {o.quantity}kg of {o.product.vegetable_name if o.product else 'Unknown'}",
            "date": o.created_at,
            "display_date": o.created_at.strftime("%Y-%m-%d %H:%M"),
            "amount": f"+₹{o.quantity * 5} Logistics"
        })
        

    recent_products = Product.objects.order_by('-created_at').limit(20)
    for p in recent_products:
        activity_feed.append({
            "type": "listing",
            "detail": f"Farmer {p.farmer.name if p.farmer else 'Unknown'} listed {p.vegetable_name} for review",
            "date": p.created_at,
            "display_date": p.created_at.strftime("%Y-%m-%d %H:%M"),
            "amount": "New Listing"
        })
        

    activity_feed.sort(key=lambda x: x['date'], reverse=True)
    

    final_activity = []
    for act in activity_feed[:20]:
         final_activity.append({
             "type": act['type'],
             "detail": act['detail'],
             "date": act['display_date'],
             "amount": act['amount']
         })
    
    return jsonify({
        "total_farmers": total_farmers,
        "total_buyers": total_buyers,
        "total_products": total_products,
        "total_orders": len(orders),
        "total_savings": total_savings,
        "total_revenue": total_revenue,
        "recent_activity": final_activity
    })


@api.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
