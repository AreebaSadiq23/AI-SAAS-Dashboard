import httpx
import time

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzU4MmRjOWQ1NmRjOSIsImV4cCI6MTc4NTMzMzUzOCwiaWF0IjoxNzg1MjQ3MTM4fQ.r3lRodMGywYKXosUNwTzcOY4tnL7mL1M5jILi4NVkWU"
headers = {"Authorization": f"Bearer {token}"}
base_url = "http://localhost:8000/api/v1"

# 1. List approvals
response = httpx.get(f"{base_url}/approvals", headers=headers)
approvals = response.json()
print(f"Approvals: {len(approvals)}")

# 2. Approve pending
for app in approvals:
    if app['status'] == 'pending':
        print(f"Approving {app['id']} for task {app['content_id']}...")
        payload = {"approve": True, "comment": "Looks great!"}
        res = httpx.post(f"{base_url}/approvals/{app['id']}/decision", json=payload, headers=headers)
        print(f"Decision: {res.status_code}")
        
        # Need to get task_id to check status.
        # Wait, the content_id is in the approval. 
        # I need to fetch the content to get the task_id.
        content_res = httpx.get(f"{base_url}/content", headers=headers)
        for c in content_res.json():
            if c['id'] == app['content_id']:
                task_id = c['task_id']
                print(f"Checking task {task_id} status...")
                # 3. Poll task status
                for _ in range(10):
                    time.sleep(1)
                    task_res = httpx.get(f"{base_url}/tasks/{task_id}", headers=headers)
                    task = task_res.json()
                    print(f"Task {task_id} Status: {task['status']}, Progress: {task['progress']}")
                    if task['status'] == 'completed':
                        break
