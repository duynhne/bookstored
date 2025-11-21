from models import User
from app import create_app

app = create_app()
with app.app_context():
    users = User.query.all()
    print("\n=== Users from Database (to_dict) ===")
    for u in users:
        data = u.to_dict()
        ccode = data.get('customer_code') or 'N/A'
        scode = data.get('staff_code') or 'N/A'
        print(f"{data['username']:10} | {data['role']:10} | customer_code={ccode:6} | staff_code={scode}")

