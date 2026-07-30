import httpx
import time

# Get token from previous login test result, I will hardcode it for now since I have it.
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzU4MmRjOWQ1NmRjOSIsImV4cCI6MTc4NTMzMzUzOCwiaWF0IjoxNzg1MjQ3MTM4fQ.r3lRodMGywYKXosUNwTzcOY4tnL7mL1M5jILi4NVkWU"
headers = {"Authorization": f"Bearer {token}"}
url = "http://localhost:8000/api/v1/tasks"

payload = {
    "title": "Grow LinkedIn & Instagram",
    "goal": "Write engaging posts about AI agents for LinkedIn and Instagram.",
    "platforms": ["linkedin", "instagram"]
}

with httpx.Client() as client:
    response = client.post(url, json=payload, headers=headers)

    print(f"Status Code: {response.status_code}")
    task = response.json()
    print(f"Task ID: {task['id']}")
    print(f"Initial Status: {task['status']}")
    print(f"Initial Progress: {task['progress']}")

    # Poll for progress
    for _ in range(20):
        time.sleep(2)
        response = client.get(f"{url}/{task['id']}", headers=headers)
        task = response.json()
        print(f"Status: {task['status']}, Progress: {task['progress']}")
        if task['status'] == 'waiting_approval' or task['progress'] >= 100:
            break
