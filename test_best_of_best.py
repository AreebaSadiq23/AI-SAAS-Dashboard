import httpx
import time

# Use the token from the previous successful login.
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzU4MmRjOWQ1NmRjOSIsImV4cCI6MTc4NTMzMzUzOCwiaWF0IjoxNzg1MjQ3MTM4fQ.r3lRodMGywYKXosUNwTzcOY4tnL7mL1M5jILi4NVkWU"
headers = {"Authorization": f"Bearer {token}"}
url = "http://localhost:8000/api/v1/tasks"

payload = {
    "title": "Best of Best Content",
    "goal": "Generate the absolute best, most engaging content about the future of AI in workforce management, targeting industry leaders.",
    "platforms": ["linkedin", "x"]
}

with httpx.Client() as client:
    response = client.post(url, json=payload, headers=headers)

    print(f"Status Code: {response.status_code}")
    task = response.json()
    print(f"Task ID: {task['id']}")

    # Poll for progress
    for _ in range(30):
        time.sleep(2)
        response = client.get(f"{url}/{task['id']}", headers=headers)
        task = response.json()
        print(f"Status: {task['status']}, Progress: {task['progress']}")
        if task['status'] == 'waiting_approval' or task['progress'] >= 100:
            print(f"Summary: {task['orchestrator_summary']}")
            break
