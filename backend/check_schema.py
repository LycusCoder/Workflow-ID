from models import User
from sqlalchemy import create_engine, inspect

engine = create_engine('sqlite:///workflow.db')
inspector = inspect(engine)
columns = inspector.get_columns('users')

print('\nUser Table Columns:')
for col in columns:
    print(f"  - {col['name']}: {col['type']}")
