import requests

res = requests.post("http://localhost:8080/api/auth/login", json={"email": "superadmin@example.com", "password": "Admin@123"})
token = res.json()["token"]

with open("test.xlsx", "rb") as f:
    res = requests.post("http://localhost:8080/api/inventory/upload", headers={"Authorization": f"Bearer {token}"}, files={"file": ("test.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")})

print(res.status_code, res.text)

res = requests.get("http://localhost:8080/api/inventory", headers={"Authorization": f"Bearer {token}"})
print(res.status_code, res.json())
