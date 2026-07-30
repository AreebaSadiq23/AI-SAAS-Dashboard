import httpx
token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzU4MmRjOWQ1NmRjOSIsImV4cCI6MTc4NTMzMzUzOCwiaWF0IjoxNzg1MjQ3MTM4fQ.r3lRodMGywYKXosUNwTzcOY4tnL7mL1M5jILi4NVkWU'
headers = {'Authorization': f'Bearer {token}'}
base_url = 'http://localhost:8000/api/v1'

scheduled = httpx.get(f'{base_url}/scheduled', headers=headers).json()
print(f'Scheduled posts: {len(scheduled)}')
for p in scheduled:
    print(f'- {p["title"]} ({p["platform"]}) at {p["scheduled_at"]}')
