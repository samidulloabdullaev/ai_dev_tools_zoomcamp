# Django TODO Application

A fully-featured TODO application built with Django that supports creating, editing, deleting, and marking TODOs as resolved with due date assignment.

## Features

✅ **Create TODOs** - Add new tasks with title, description, and due dates
✏️ **Edit TODOs** - Update existing task details
🗑️ **Delete TODOs** - Remove completed or unwanted tasks
✓ **Mark as Resolved** - Toggle task completion status
📅 **Due Date Assignment** - Set deadlines for your tasks
🔍 **Overdue Detection** - Automatically identify past-due items
📊 **Statistics Dashboard** - View total, pending, and completed counts
🎨 **Responsive UI** - Bootstrap-based beautiful interface

## Project Structure

```
homework_1/
├── manage.py                           # Django management script
├── pyproject.toml                      # Project dependencies (uv config)
├── pytest.ini                          # Pytest configuration
├── db.sqlite3                          # SQLite database (created after migration)
│
├── project/                            # Django project configuration
│   ├── __init__.py
│   ├── settings.py                     # Django settings
│   ├── urls.py                         # Project URL configuration
│   └── wsgi.py                         # WSGI application
│
└── todos/                              # Main TODO application
    ├── migrations/                     # Database migrations
    ├── templates/todos/
    │   ├── base.html                   # Base template with navigation
    │   ├── home.html                   # TODO list view
    │   ├── todo_form.html              # Create/Edit form
    │   └── todo_confirm_delete.html    # Delete confirmation
    ├── __init__.py
    ├── admin.py                        # Django admin configuration
    ├── apps.py                         # App configuration
    ├── forms.py                        # TodoForm for CRUD operations
    ├── models.py                       # Todo model definition
    ├── urls.py                         # App URL routing
    ├── views.py                        # View logic (List, Create, Update, Delete)
    └── tests.py                        # Comprehensive pytest test suite
```

## Installation & Setup

### Prerequisites
- Python 3.10+
- pip or uv (recommended)

### Step 1: Install Dependencies

Using **uv** (recommended):
```bash
uv sync
```

Using **pip**:
```bash
pip install -r requirements.txt
```

Or install individually:
```bash
pip install Django>=4.2 pytest>=7.0 pytest-django>=4.5
```

### Step 2: Database Migrations

```bash
python manage.py migrate
```

This creates the SQLite database and sets up the Todo table.

### Step 3: Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

This allows you to access the admin panel at `/admin/`.

### Step 4: Run the Development Server

```bash
python manage.py runserver
```

The application will be available at `http://127.0.0.1:8000/`

## Usage

### Web Interface

- **Home/List View** - `/todos/` or `/` - View all TODOs with statistics
- **Create TODO** - `/todos/create/` - Add a new TODO
- **Edit TODO** - `/todos/<id>/edit/` - Modify existing TODO
- **Delete TODO** - `/todos/<id>/delete/` - Remove a TODO
- **Toggle Status** - `/todos/<id>/toggle/` - Mark as done/pending (AJAX)
- **Admin Panel** - `/admin/` - Manage TODOs via Django admin

### Home Page Features

- **Statistics Dashboard** - Shows total, pending, and completed counts
- **TODO List** - Displays all tasks with visual indicators:
  - Green badge for completed tasks
  - Blue badge for pending tasks
  - Red badge for overdue tasks
  - Blue info badge showing due dates
- **Action Buttons** - Edit, Delete, and Mark as Done/Reopen
- **Pagination** - 10 TODOs per page

## Testing

### Run All Tests

```bash
pytest
```

### Run Specific Test Class

```bash
pytest todos/tests.py::TestTodoModel
pytest todos/tests.py::TestTodoForm
pytest todos/tests.py::TestTodoViews
```

### Run with Verbose Output

```bash
pytest -v
```

### Run with Coverage Report

```bash
pip install pytest-cov
pytest --cov=todos
```

### Test Coverage

The test suite includes 60+ comprehensive tests covering:

#### Model Tests (TestTodoModel - 11 tests)
- Creating TODOs with various field combinations
- String representation
- Ordering and sorting
- Overdue detection logic
- Model updates and deletions

#### Form Tests (TestTodoForm - 5 tests)
- Form validation with all fields
- Required field validation
- Form saving
- Form data handling

#### View Tests (TestTodoViews - 20 tests)
- List view rendering and context
- Create view GET/POST handling
- Edit view GET/POST handling
- Delete view confirmation and execution
- Toggle status AJAX endpoint
- 404 handling for nonexistent TODOs

#### Integration Tests (TestTodoIntegration - 3 tests)
- Complete TODO workflow (create → edit → resolve → delete)
- Multiple TODO management
- Overdue TODO identification

#### Edge Case Tests (TestTodoEdgeCases - 8 tests)
- Empty descriptions
- Long titles
- Due date variations (today, tomorrow, past)
- Bulk TODO creation
- Same-value updates

## Model Details

### Todo Model

```python
class Todo(models.Model):
    title = models.CharField(max_length=200)              # Required
    description = models.TextField(blank=True, null=True) # Optional
    due_date = models.DateField(blank=True, null=True)    # Optional
    is_resolved = models.BooleanField(default=False)      # Status
    created_at = models.DateTimeField(auto_now_add=True)  # Auto-set
    updated_at = models.DateTimeField(auto_now=True)      # Auto-update
    
    def is_overdue() -> bool                               # Helper method
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Redirect to TODO list |
| GET | `/todos/` | List all TODOs |
| GET | `/todos/create/` | Show create form |
| POST | `/todos/create/` | Create new TODO |
| GET | `/todos/<id>/edit/` | Show edit form |
| POST | `/todos/<id>/edit/` | Update TODO |
| GET | `/todos/<id>/delete/` | Show delete confirmation |
| POST | `/todos/<id>/delete/` | Delete TODO |
| POST | `/todos/<id>/toggle/` | Toggle completion status (returns JSON) |

## Forms

### TodoForm

Fields:
- `title` (TextField) - Required, max 200 characters
- `description` (Textarea) - Optional
- `due_date` (DateField) - Optional, uses HTML5 date picker
- `is_resolved` (CheckboxInput) - Optional, defaults to False

All fields use Bootstrap styling for consistent appearance.

## Templates

### base.html
- Navigation bar with app title
- Message display area for user feedback
- Bootstrap 5 styling
- Footer with copyright info
- CSRF token handling for forms

### home.html
- TODO list display
- Statistics cards (total, pending, completed)
- Status badges (pending, completed, overdue)
- Due date display
- Action buttons (Edit, Delete, Done/Reopen)
- Pagination controls
- Empty state with call-to-action
- AJAX toggle functionality

### todo_form.html
- Create/Edit form with validation messages
- Styled input fields using Bootstrap
- Submit and Cancel buttons
- Error display for form fields

### todo_confirm_delete.html
- Delete confirmation dialog
- TODO details preview
- Confirmation and cancel buttons
- Warning message about irreversibility

## Development

### Running in Debug Mode

The app runs in `DEBUG = True` mode by default. This is suitable for development only.

For production, set:
```python
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']
SECRET_KEY = 'your-secure-secret-key'
```

### Database

The app uses SQLite by default, suitable for development and small deployments. For production, consider:
- PostgreSQL
- MySQL
- MariaDB

Update `DATABASES` in `project/settings.py` accordingly.

### Admin Interface

Access the admin panel at `/admin/` to:
- View all TODOs
- Filter by status or due date
- Search by title
- Bulk edit tasks
- View creation and update timestamps

## Common Tasks

### Create a TODO via CLI

```python
python manage.py shell
>>> from todos.models import Todo
>>> from datetime import timedelta
>>> from django.utils import timezone
>>> 
>>> due_date = timezone.now().date() + timedelta(days=5)
>>> todo = Todo.objects.create(
...     title="My Task",
...     description="Task description",
...     due_date=due_date
... )
>>> exit()
```

### Query TODOs

```python
python manage.py shell
>>> from todos.models import Todo
>>> 
>>> # Get all TODOs
>>> Todo.objects.all()
>>> 
>>> # Get pending TODOs
>>> Todo.objects.filter(is_resolved=False)
>>> 
>>> # Get completed TODOs
>>> Todo.objects.filter(is_resolved=True)
>>> 
>>> # Get overdue TODOs
>>> [t for t in Todo.objects.all() if t.is_overdue()]
>>> 
>>> exit()
```

## Troubleshooting

### "No module named 'django'"
- Ensure you've installed dependencies: `uv sync` or `pip install -r requirements.txt`

### "ModuleNotFoundError: No module named 'project'"
- Ensure you're running commands from the project root directory

### Database errors after migration
- Delete `db.sqlite3` and run `python manage.py migrate` again

### Tests failing
- Ensure pytest-django is installed: `pip install pytest-django`
- Run from project root: `pytest`

## Future Enhancements

- [ ] User authentication and per-user TODOs
- [ ] Task categories/tags
- [ ] Priority levels
- [ ] Recurring tasks
- [ ] Notifications and reminders
- [ ] Task dependencies
- [ ] Sharing and collaboration
- [ ] Mobile app
- [ ] REST API using Django REST Framework
- [ ] Export to CSV/PDF

## License

This project is provided as-is for educational purposes.

## Support

For issues, questions, or suggestions, refer to the test suite in `todos/tests.py` for usage examples and expected behavior.
