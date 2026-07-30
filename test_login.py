import httpx

url = "http://localhost:8000/api/v1/auth/login"
payload = {"email": "founder@acme.ai", "password": "password"}
with httpx.Client() as client:
    response = client.post(url, json=payload)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")
