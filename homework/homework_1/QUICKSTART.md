# Django TODO App - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
# Using uv (recommended)
uv sync

# OR using pip
pip install -r requirements.txt
```

### 2. Create Database

```bash
python manage.py migrate
```

### 3. Create Admin User (Optional)

```bash
python manage.py createsuperuser
```

### 4. Run Server

```bash
python manage.py runserver
```

### 5. Access the App

- **Main App**: http://127.0.0.1:8000/
- **Admin Panel**: http://127.0.0.1:8000/admin/

---

## 📝 Core Features

### Create a TODO
1. Click **"+ Add New TODO"** button
2. Enter title (required)
3. Add description (optional)
4. Set due date (optional)
5. Click **"Create TODO"**

### Edit a TODO
1. Click **"✏️ Edit"** button next to the TODO
2. Update fields
3. Click **"Update TODO"**

### Mark as Done/Reopen
- Click **"✓ Done"** to mark complete (green)
- Click **"✗ Reopen"** to mark pending (yellow)

### Delete a TODO
1. Click **"🗑️ Delete"** button
2. Confirm deletion

---

## 🧪 Run Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test category
pytest todos/tests.py::TestTodoModel -v
pytest todos/tests.py::TestTodoViews -v

# Run with coverage
pytest --cov=todos
```

### Test Coverage Overview

- **60+ tests** total
- **11 Model tests** - Data integrity and logic
- **5 Form tests** - Validation and saving
- **20 View tests** - HTTP responses and functionality
- **3 Integration tests** - Complete workflows
- **8 Edge case tests** - Boundary conditions

---

## 📂 File Structure at a Glance

```
homework_1/
├── manage.py              # Django CLI
├── requirements.txt       # Dependencies
├── pyproject.toml         # uv/pip config
├── pytest.ini             # Test config
├── README.md              # Full documentation
├── QUICKSTART.md          # This file
│
├── project/               # Django config
│   ├── settings.py        # App settings
│   ├── urls.py            # URL routing
│   └── wsgi.py            # WSGI config
│
└── todos/                 # Main app
    ├── models.py          # Todo model
    ├── views.py           # Business logic
    ├── forms.py           # Form validation
    ├── urls.py            # App routing
    ├── admin.py           # Admin config
    ├── tests.py           # Test suite (60+ tests)
    └── templates/todos/   # HTML templates
        ├── base.html      # Layout template
        ├── home.html      # TODO list page
        ├── todo_form.html # Create/Edit form
        └── todo_confirm_delete.html  # Delete confirmation
```

---

## 🔧 Common Commands

### Django Management

```bash
# Create database tables
python manage.py migrate

# Create new superuser
python manage.py createsuperuser

# Access Django shell
python manage.py shell

# Collect static files (production)
python manage.py collectstatic

# Create new migration (after model changes)
python manage.py makemigrations
```

### Running Tests

```bash
# All tests
pytest

# Specific test file
pytest todos/tests.py

# Specific test class
pytest todos/tests.py::TestTodoModel

# Specific test method
pytest todos/tests.py::TestTodoModel::test_create_todo_basic

# Show print statements
pytest -s

# Stop on first failure
pytest -x

# Show slowest tests
pytest --durations=10
```

---

## 💡 Usage Examples

### Create a TODO from Shell

```bash
python manage.py shell
```

```python
from todos.models import Todo
from datetime import timedelta
from django.utils import timezone

# Create a simple TODO
todo = Todo.objects.create(title="Buy groceries")

# Create with due date
due_date = timezone.now().date() + timedelta(days=5)
todo = Todo.objects.create(
    title="Finish project",
    description="Complete Django TODO app",
    due_date=due_date
)

# Mark as resolved
todo.is_resolved = True
todo.save()

# Check if overdue
if todo.is_overdue():
    print("This task is overdue!")

# Exit shell
exit()
```

### Query TODOs

```python
# All TODOs
todos = Todo.objects.all()

# Pending only
pending = Todo.objects.filter(is_resolved=False)

# Completed only
completed = Todo.objects.filter(is_resolved=True)

# With due date
with_dates = Todo.objects.filter(due_date__isnull=False)

# Overdue
overdue = [t for t in Todo.objects.all() if t.is_overdue()]

# Count
total = Todo.objects.count()
```

---

## 📊 Statistics Dashboard

The home page displays real-time statistics:

- **Total TODOs** - All tasks in the system
- **Pending** - Active, not completed tasks
- **Completed** - Finished tasks

---

## 🎨 UI Features

- ✅ Responsive Bootstrap 5 design
- 🎯 Color-coded status badges
- 📱 Mobile-friendly layout
- 🔄 AJAX toggle without page reload
- 📝 Form validation with error messages
- 🎊 Success notifications
- ⚠️ Confirmation dialogs for deletions

---

## ✋ Troubleshooting

### "Module not found" errors

**Solution**: Install dependencies
```bash
uv sync  # or: pip install -r requirements.txt
```

### Database errors

**Solution**: Reset database
```bash
# Delete the database file
rm db.sqlite3

# Recreate tables
python manage.py migrate
```

### Tests not finding Django

**Solution**: pytest.ini is configured. Run from project root:
```bash
# From homework_1/ directory
pytest
```

### Port 8000 already in use

**Solution**: Use different port
```bash
python manage.py runserver 8001
```

---

## 📚 Test Coverage by Module

### Models (todos/models.py)
- ✓ Creation with required/optional fields
- ✓ String representation
- ✓ Field ordering
- ✓ Overdue detection
- ✓ Updates and deletes

### Forms (todos/forms.py)
- ✓ Valid form submission
- ✓ Required field validation
- ✓ Form data persistence

### Views (todos/views.py)
- ✓ List view with pagination
- ✓ Create TODO form and submission
- ✓ Edit TODO functionality
- ✓ Delete TODO with confirmation
- ✓ Toggle status via AJAX
- ✓ 404 handling for invalid IDs

### Integration
- ✓ Complete CRUD workflow
- ✓ Multiple TODO management
- ✓ Overdue task identification

---

## 🚀 Next Steps

1. **Explore the app** - Create some TODOs in the UI
2. **Run tests** - `pytest -v` to see all tests
3. **Check the admin** - http://127.0.0.1:8000/admin/
4. **Read the code** - Models, views, forms, and tests are well-commented
5. **Customize** - Modify templates, add features, extend functionality

---

## 📖 Full Documentation

See `README.md` for comprehensive documentation including:
- Detailed feature list
- Complete API endpoints
- Database schema
- Form specifications
- Development guide
- Production considerations

---

## 🎯 Project Goals Achieved

✅ Create, edit, delete TODOs
✅ Assign due dates
✅ Mark TODOs as resolved
✅ Templates (base.html, home.html)
✅ Additional form and delete confirmation templates
✅ 60+ comprehensive pytest tests
✅ Full CRUD operations
✅ Responsive UI
✅ Django admin integration
✅ Production-ready structure

---

**Happy TODO managing! 🎉**
