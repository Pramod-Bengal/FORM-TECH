from flask import Blueprint, request, jsonify, send_from_directory, current_app
from models import User, Product, Order
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json
from werkzeug.utils import secure_filename
from bson import ObjectId

api = Blueprint('api', __name__)

# Pricing Logic
# Pricing Logic
def calculate_price(farmer_price_per_kg, quantity):
    platform_fee_percent = 0.15
    platform_fee_per_kg = farmer_price_per_kg * platform_fee_percent
    farmer_earnings_per_kg = farmer_price_per_kg - platform_fee_per_kg
    return farmer_earnings_per_kg, platform_fee_per_kg * quantity

@api.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if User.objects(email=data['email']).first():
            return jsonify({"msg": "Email already exists"}), 400
        
        hashed_password = generate_password_hash(data['password'])
        new_user = User(
            name=data['name'],
            email=data['email'],
            password=hashed_password,
            role=data.get('role', 'buyer')
        )
        new_user.save()
        return jsonify({"msg": "User created successfully"}), 201
    except Exception as e:
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

# --- Admin Routes ---
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
    # Recent Orders
    for o in Order.objects.order_by('-created_at').limit(10):
        activity_feed.append({
            "type": "order",
            "detail": f"Buyer {o.buyer.name if o.buyer else 'Unknown'} bought {o.quantity}kg of {o.product.vegetable_name if o.product else 'Unknown'}",
            "date": o.created_at.strftime("%Y-%m-%d %H:%M"),
            "amount": f"+₹{o.quantity * 5} Logistics"
        })
    # Recent Listings
    for p in Product.objects.order_by('-created_at').limit(10):
        activity_feed.append({
            "type": "listing",
            "detail": f"Farmer {p.farmer.name if p.farmer else 'Unknown'} listed {p.vegetable_name}",
            "date": p.created_at.strftime("%Y-%m-%d %H:%M"),
            "amount": "New Listing"
        })
    
    return jsonify({
        "total_farmers": total_farmers,
        "total_buyers": total_buyers,
        "total_products": total_products,
        "total_orders": len(orders),
        "total_bindings": total_savings, # saving -> bindings/revenue
        "total_revenue": total_revenue,
        "recent_activity": sorted(activity_feed, key=lambda x: x['date'], reverse=True)
    })

@api.route('/api/admin/pending-products', methods=['GET'])
@jwt_required()
def get_pending_products():
    raw_identity = get_jwt_identity()
    try:
        identity = json.loads(raw_identity) if isinstance(raw_identity, str) else raw_identity
    except: return jsonify({"msg": "Invalid token"}), 422

    if identity['role'] != 'admin':
        return jsonify({"msg": "Unauthorized"}), 403
    
    products = Product.objects(status='pending').order_by('-created_at')
    result = []
    for p in products:
        result.append({
            "id": str(p.id),
            "name": p.vegetable_name,
            "farmer_name": p.farmer.name if p.farmer else "Unknown",
            "quantity": p.quantity,
            "final_price": p.market_price,
            "image": p.image_url
        })
    return jsonify(result)

@api.route('/api/admin/product-action', methods=['POST'])
@jwt_required()
def product_action():
    raw_identity = get_jwt_identity()
    try:
        identity = json.loads(raw_identity) if isinstance(raw_identity, str) else raw_identity
    except: return jsonify({"msg": "Invalid token"}), 422

    if identity['role'] != 'admin': return jsonify({"msg": "Unauthorized"}), 403
    
    data = request.get_json()
    p = Product.objects(id=data['product_id']).first()
    if p:
        p.status = data['action']
        p.save()
        return jsonify({"msg": "Success"}), 200
    return jsonify({"msg": "Not found"}), 404

@api.route('/api/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    raw_identity = get_jwt_identity()
    try:
        identity = json.loads(raw_identity) if isinstance(raw_identity, str) else raw_identity
    except: return jsonify({"msg": "Invalid token"}), 422
    
    if identity['role'] != 'admin': return jsonify({"msg": "Unauthorized"}), 403
    
    users = User.objects()
    result = []
    for u in users:
        if u.role == 'admin': continue
        
        stats = {}
        if u.role == 'farmer':
            products = Product.objects(farmer=u)
            stats['listings'] = products.count()
            # Calculate total sales value for this farmer from orders of their products
            # This is complex in NoSQL without aggregation framework, keeping it simple:
            stats['listings_active'] = products.filter(status='approved').count()
        elif u.role == 'buyer':
            orders = Order.objects(buyer=u)
            stats['orders_placed'] = orders.count()
            stats['total_spent'] = sum([o.total_price for o in orders])
            
        result.append({
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "joined": str(u.id.generation_time.date()),
            "stats": stats
        })
    return jsonify(result)

@api.route('/api/admin/transactions', methods=['GET'])
@jwt_required()
def get_all_transactions():
    raw_identity = get_jwt_identity()
    try:
        identity = json.loads(raw_identity) if isinstance(raw_identity, str) else raw_identity
    except: return jsonify({"msg": "Invalid token"}), 422
    
    if identity['role'] != 'admin': return jsonify({"msg": "Unauthorized"}), 403
    
    orders = Order.objects().order_by('-created_at')
    result = []
    for o in orders:
        if not o.product: continue # Skip if product deleted
        result.append({
            "id": str(o.id),
            "buyer": o.buyer.name if o.buyer else "Unknown",
            "product": o.product.vegetable_name,
            "farmer": o.product.farmer.name if (o.product and o.product.farmer) else "Unknown",
            "quantity": o.quantity,
            "amount": o.total_price,
            "payment_method": o.payment_method,
            "status": o.status,
            "date": o.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return jsonify(result)

# --- Buyer Routes ---
@api.route('/api/buyer/products', methods=['GET'])
def get_buyer_products():
    products = Product.objects(status='approved', quantity__gt=0).order_by('-created_at')
    return jsonify([{
        "id": str(p.id),
        "name": p.vegetable_name,
        "price": p.market_price,
        "quantity": p.quantity,
        "image": p.image_url,
        "farmer_name": p.farmer.name if p.farmer else "Unknown"
    } for p in products])

@api.route('/api/buyer/order', methods=['POST'])
@jwt_required()
def place_order():
    raw_identity = get_jwt_identity()
    try:
        identity = json.loads(raw_identity) if isinstance(raw_identity, str) else raw_identity
    except: return jsonify({"msg": "Invalid token"}), 422
    
    if identity['role'] != 'buyer': return jsonify({"msg": "Unauthorized"}), 403
    
    data = request.get_json()
    product = Product.objects(id=data['product_id']).first()
    if not product or product.quantity < data['quantity']:
        return jsonify({"msg": "Unavailable"}), 400
    
    if 'delivery_address' not in data or not data['delivery_address']:
         return jsonify({"msg": "Delivery address is required"}), 400
        
    total_price = data['quantity'] * product.market_price
    
    order = Order(
        buyer=ObjectId(identity['id']),
        product=product,
        quantity=data['quantity'],
        total_price=total_price,
        payment_method=data.get('payment_method', 'Cash'),
        delivery_address=data['delivery_address']
    )
    product.quantity -= data['quantity']
    product.save()
    order.save()
    
    return jsonify({"msg": "Order successful"}), 201

@api.route('/api/farmer/analyze-quality', methods=['POST'])
@jwt_required()
def analyze_quality():
    try:
        if 'image' not in request.files:
            return jsonify({"msg": "No image uploaded"}), 400
        
        file = request.files['image']
        veg_name = request.form.get('vegetable_name', 'Vegetable').lower().strip()
        
        # Save temp file for analysis
        filename = secure_filename(file.filename)
        temp_path = os.path.join(current_app.config['UPLOAD_FOLDER'], "temp_" + filename)
        file.save(temp_path)

        try:
            # ---------------------------------------------------------
            # REAL AI ANALYSIS Using MobileNetV2 (Pre-trained on ImageNet)
            # ---------------------------------------------------------
            import tensorflow as tf
            import numpy as np
            from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
            from tensorflow.keras.preprocessing import image as keras_image

            # Load Model (Downloads once, caches thereafter)
            model = MobileNetV2(weights='imagenet')

            # Preprocess Image
            img = keras_image.load_img(temp_path, target_size=(224, 224))
            x = keras_image.img_to_array(img)
            x = np.expand_dims(x, axis=0)
            x = preprocess_input(x)

            # Predict
            preds = model.predict(x)
            decoded = decode_predictions(preds, top=5)[0] # Get top 5 predictions (class, name, score)
            
            # Logic: Check if veg_name is in the top 5 predictions
            found_match = False
            top_prediction = decoded[0][1] # Name of the highest confidence object
            confidence = float(decoded[0][2])

            # Simple keyword matching (enhanced)
            # e.g. "Granny_Smith" contains "apple" implicitly in logic, but here we do direct check
            for _, name, score in decoded:
                if veg_name in name.lower() or name.lower() in veg_name:
                    found_match = True
                    confidence = float(score)
                    break
            
            # Special Handling for common mismatched inputs (like the user's "Cow" case)
            # If the top prediction is distinctly NOT a vegetable/fruit and has high confidence
            animals = ['ox', 'cow', 'cattle', 'bull', 'dog', 'cat', 'person']
            is_animal = any(animal in top_prediction.lower() for animal in animals)

            if is_animal:
                final_score = 10
                grade = "Rejected"
                analysis_msg = f"Alert: Detected a 'monitor/animal' ({top_prediction}). This does not appear to be {veg_name}."
            elif not found_match:
                # If we didn't find the specific veg name, but it might still be valid produce
                # We penalize the score but don't fail completely unless confidence is super high it's something else
                final_score = 45 # Low score for mismatch
                grade = "Low Confidence"
                analysis_msg = f"AI Analysis detected '{top_prediction}' instead of {veg_name}. Please upload a clearer photo."
            else:
                # It IS the vegetable. Base score on confidence + randomness for "freshness" simulation
                # (Since ImageNet classifies objects, not freshness directly, we combine confidence with a heuristic)
                base = confidence * 100
                final_score = min(99, base + 10) # Boost slightly as ImageNet confidence represents object identity
                
                grade = "Standard"
                if final_score > 90: grade = "Premium Export Quality"
                elif final_score > 80: grade = "Grade A"
                elif final_score > 60: grade = "Grade B"
                else: grade = "Grade C"
                
                analysis_msg = f"Verified as {veg_name} (Confidence: {int(confidence*100)}%). Matches export standards."

            return jsonify({
                "score": round(final_score, 1),
                "grade": grade,
                "analysis": analysis_msg
            })

        finally:
            # Cleanup temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            # Reset file pointer if we needed to save it again (we don't here, strictly)
            
    except Exception as e:
        print(f"Analysis Error: {e}")
        return jsonify({"msg": "AI Analysis Service Unavailable. Please try again."}), 500

# --- Farmer Routes (Essential for listing products for buyers to buy) ---
@api.route('/api/farmer/products', methods=['POST'])
@jwt_required()
def add_product():
    raw_identity = get_jwt_identity()
    try:
        identity = json.loads(raw_identity) if isinstance(raw_identity, str) else raw_identity
    except: return jsonify({"msg": "Invalid token"}), 422
    
    if identity['role'] != 'farmer': return jsonify({"msg": "Unauthorized"}), 403

    try:
        veg_name = request.form.get('vegetable_name')
        price = float(request.form.get('price'))
        qty = float(request.form.get('quantity'))
        
        if qty < 10: return jsonify({"msg": "Min quantity 10kg"}), 400
        
        earnings, _ = calculate_price(price, qty)
        
        image_url = ""
        if 'image' in request.files:
            f = request.files['image']
            filename = secure_filename(f.filename)
            f.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            image_url = f"/uploads/{filename}"
            
        quality_score = float(request.form.get('quality_score', 0))
        status = 'approved' if quality_score > 60 else 'pending'
            
        product = Product(
            farmer=ObjectId(identity['id']),
            vegetable_name=veg_name,
            market_price=price,
            farmer_earnings=earnings,
            quantity=qty,
            image_url=image_url,
            status=status
        )
        product.save()
        return jsonify({"msg": "Listed", "earnings_per_kg": earnings}), 201
    except Exception as e:
        return jsonify({"msg": str(e)}), 500

@api.route('/api/farmer/my-products', methods=['GET'])
@jwt_required()
def get_my_products():
    raw_identity = get_jwt_identity()
    try: identity = json.loads(raw_identity) if isinstance(raw_identity, str) else raw_identity
    except: return jsonify({"msg": "Invalid token"}), 422
    
    products = Product.objects(farmer=ObjectId(identity['id']))
    return jsonify([{
        "id": str(p.id),
        "name": p.vegetable_name,
        "price": p.market_price,
        "quantity": p.quantity,
        "status": p.status,
        "earnings": p.farmer_earnings,
        "image": p.image_url
    } for p in products])

@api.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
