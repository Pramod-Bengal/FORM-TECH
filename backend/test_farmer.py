import requests
import json
import io

BASE_URL = "http://127.0.0.1:5000"

# 1. Login to get token
login_data = {
    "email": "farmer@gmail.com",
    "password": "password123" # Don't know the real password, let's just make a new user
}
print("Registering...")
requests.post(f"{BASE_URL}/api/auth/register", json={"name": "Test Farmer", "email": "testfarmer@gmail.com", "password":"password", "role":"farmer"})

print("Logging in...")
res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "testfarmer@gmail.com", "password": "password"})
if res.status_code != 200:
    print("Login failed:", res.text)
    exit(1)

token = res.json()['access_token']
headers = {"Authorization": f"Bearer {token}"}

# 2. List a product
print("Adding product...")
files = {'image': ('test.jpg', io.BytesIO(b"test image data"), 'image/jpeg')}
data = {
    'vegetable_name': 'Test Tomato',
    'price': '50',
    'quantity': '20',
    'quality_score': '95'
}

res2 = requests.post(f"{BASE_URL}/api/farmer/products", headers=headers, data=data, files=files)
print("Add product response:", res2.status_code, res2.text)

# 3. Get my products
res3 = requests.get(f"{BASE_URL}/api/farmer/my-products", headers=headers)
print("My products response:", res3.status_code, res3.json())
