import pytest
from django.utils import timezone
from datetime import datetime, timedelta
from django.test import Client
from django.urls import reverse

from todos.models import Todo
from todos.forms import TodoForm


# ========================
# Model Tests
# ========================

@pytest.mark.django_db
class TestTodoModel:
    """Test cases for the Todo model."""
    
    def test_create_todo_basic(self):
        """Test creating a basic TODO with only required fields."""
        todo = Todo.objects.create(title="Test TODO")
        assert todo.title == "Test TODO"
        assert todo.description is None
        assert todo.due_date is None
        assert todo.is_resolved is False
        assert todo.created_at is not None
        assert todo.updated_at is not None
    
    def test_create_todo_with_all_fields(self):
        """Test creating a TODO with all fields."""
        due_date = timezone.now().date() + timedelta(days=5)
        todo = Todo.objects.create(
            title="Complete Project",
            description="Finish the Django TODO app",
            due_date=due_date,
            is_resolved=False
        )
        assert todo.title == "Complete Project"
        assert todo.description == "Finish the Django TODO app"
        assert todo.due_date == due_date
        assert todo.is_resolved is False
    
    def test_todo_string_representation(self):
        """Test the __str__ method of Todo model."""
        todo = Todo.objects.create(title="My TODO")
        assert str(todo) == "My TODO"
    
    def test_todo_ordering(self):
        """Test that TODOs are ordered by creation date (newest first)."""
        todo1 = Todo.objects.create(title="First")
        todo2 = Todo.objects.create(title="Second")
        todo3 = Todo.objects.create(title="Third")
        
        todos = list(Todo.objects.all())
        assert todos[0].title == "Third"
        assert todos[1].title == "Second"
        assert todos[2].title == "First"
    
    def test_is_overdue_not_overdue(self):
        """Test is_overdue returns False for future due dates."""
        future_date = timezone.now().date() + timedelta(days=5)
        todo = Todo.objects.create(
            title="Future TODO",
            due_date=future_date,
            is_resolved=False
        )
        assert todo.is_overdue() is False
    
    def test_is_overdue_past_date(self):
        """Test is_overdue returns True for past due dates."""
        past_date = timezone.now().date() - timedelta(days=5)
        todo = Todo.objects.create(
            title="Past TODO",
            due_date=past_date,
            is_resolved=False
        )
        assert todo.is_overdue() is True
    
    def test_is_overdue_resolved_todo(self):
        """Test is_overdue returns False for resolved TODOs."""
        past_date = timezone.now().date() - timedelta(days=5)
        todo = Todo.objects.create(
            title="Resolved Past TODO",
            due_date=past_date,
            is_resolved=True
        )
        assert todo.is_overdue() is False
    
    def test_is_overdue_no_due_date(self):
        """Test is_overdue returns False for TODOs without due dates."""
        todo = Todo.objects.create(
            title="TODO without due date",
            is_resolved=False
        )
        assert todo.is_overdue() is False
    
    def test_update_todo(self):
        """Test updating an existing TODO."""
        todo = Todo.objects.create(title="Original Title")
        original_created_at = todo.created_at
        
        todo.title = "Updated Title"
        todo.description = "Updated description"
        todo.save()
        
        todo.refresh_from_db()
        assert todo.title == "Updated Title"
        assert todo.description == "Updated description"
        assert todo.created_at == original_created_at
        assert todo.updated_at > original_created_at
    
    def test_mark_todo_as_resolved(self):
        """Test marking a TODO as resolved."""
        todo = Todo.objects.create(title="TODO", is_resolved=False)
        todo.is_resolved = True
        todo.save()
        
        todo.refresh_from_db()
        assert todo.is_resolved is True
    
    def test_multiple_todos(self):
        """Test creating multiple TODOs."""
        for i in range(5):
            Todo.objects.create(title=f"TODO {i}")
        
        assert Todo.objects.count() == 5
    
    def test_delete_todo(self):
        """Test deleting a TODO."""
        todo = Todo.objects.create(title="TODO to delete")
        todo_id = todo.id
        
        todo.delete()
        
        with pytest.raises(Todo.DoesNotExist):
            Todo.objects.get(id=todo_id)


# ========================
# Form Tests
# ========================

@pytest.mark.django_db
class TestTodoForm:
    """Test cases for the TodoForm."""
    
    def test_valid_form_with_all_fields(self):
        """Test TodoForm with all fields valid."""
        due_date = timezone.now().date() + timedelta(days=3)
        form_data = {
            'title': 'Test TODO',
            'description': 'Test Description',
            'due_date': due_date,
            'is_resolved': False
        }
        form = TodoForm(data=form_data)
        assert form.is_valid()
    
    def test_valid_form_with_only_title(self):
        """Test TodoForm with only title (required field)."""
        form_data = {
            'title': 'Only Title',
            'description': '',
            'due_date': '',
            'is_resolved': False
        }
        form = TodoForm(data=form_data)
        assert form.is_valid()
    
    def test_invalid_form_missing_title(self):
        """Test TodoForm with missing title."""
        form_data = {
            'title': '',
            'description': 'Description',
            'due_date': '',
            'is_resolved': False
        }
        form = TodoForm(data=form_data)
        assert not form.is_valid()
        assert 'title' in form.errors
    
    def test_form_save(self):
        """Test saving a form creates a TODO."""
        due_date = timezone.now().date() + timedelta(days=2)
        form_data = {
            'title': 'New TODO',
            'description': 'New Description',
            'due_date': due_date,
            'is_resolved': False
        }
        form = TodoForm(data=form_data)
        
        assert form.is_valid()
        todo = form.save()
        
        assert todo.id is not None
        assert todo.title == 'New TODO'
        assert todo.description == 'New Description'
        assert todo.due_date == due_date
    
    def test_form_with_resolved_status(self):
        """Test form with is_resolved set to True."""
        form_data = {
            'title': 'Resolved TODO',
            'description': '',
            'due_date': '',
            'is_resolved': True
        }
        form = TodoForm(data=form_data)
        assert form.is_valid()
        
        todo = form.save()
        assert todo.is_resolved is True


# ========================
# View Tests
# ========================

@pytest.mark.django_db
class TestTodoViews:
    """Test cases for TODO views."""
    
    def setup_method(self):
        """Setup method to initialize client for each test."""
        self.client = Client()
    
    # ---- List View Tests ----
    
    def test_todo_list_view_empty(self):
        """Test TODO list view with no TODOs."""
        response = self.client.get(reverse('todo-list'))
        assert response.status_code == 200
        assert 'todos' in response.context
        assert len(response.context['todos']) == 0
    
    def test_todo_list_view_with_todos(self):
        """Test TODO list view with multiple TODOs."""
        Todo.objects.create(title="TODO 1")
        Todo.objects.create(title="TODO 2")
        Todo.objects.create(title="TODO 3")
        
        response = self.client.get(reverse('todo-list'))
        assert response.status_code == 200
        assert len(response.context['todos']) == 3
    
    def test_todo_list_view_context_stats(self):
        """Test that TODO list view provides correct statistics."""
        Todo.objects.create(title="TODO 1", is_resolved=False)
        Todo.objects.create(title="TODO 2", is_resolved=True)
        Todo.objects.create(title="TODO 3", is_resolved=False)
        
        response = self.client.get(reverse('todo-list'))
        assert response.context['total_count'] == 3
        assert response.context['completed_count'] == 1
        assert response.context['pending_count'] == 2
    
    def test_todo_list_uses_correct_template(self):
        """Test that TODO list view uses home.html template."""
        response = self.client.get(reverse('todo-list'))
        assert 'todos/home.html' in [t.name for t in response.templates]
    
    # ---- Create View Tests ----
    
    def test_todo_create_view_get(self):
        """Test GET request to create TODO view."""
        response = self.client.get(reverse('todo-create'))
        assert response.status_code == 200
        assert 'form' in response.context
    
    def test_todo_create_view_post_valid(self):
        """Test POST request with valid data to create TODO."""
        due_date = timezone.now().date() + timedelta(days=3)
        form_data = {
            'title': 'New TODO',
            'description': 'New Description',
            'due_date': due_date,
            'is_resolved': False
        }
        response = self.client.post(reverse('todo-create'), form_data)
        
        assert response.status_code == 302  # Redirect after successful creation
        assert Todo.objects.filter(title='New TODO').exists()
    
    def test_todo_create_view_post_invalid(self):
        """Test POST request with invalid data to create TODO."""
        form_data = {
            'title': '',  # Required field is empty
            'description': 'Description',
            'due_date': '',
            'is_resolved': False
        }
        response = self.client.post(reverse('todo-create'), form_data)
        
        assert response.status_code == 200  # Form re-rendered
        assert Todo.objects.count() == 0
    
    def test_todo_create_redirects_to_list(self):
        """Test that successful TODO creation redirects to list view."""
        form_data = {
            'title': 'New TODO',
            'description': '',
            'due_date': '',
            'is_resolved': False
        }
        response = self.client.post(reverse('todo-create'), form_data, follow=False)
        
        assert response.status_code == 302
        assert response.url == reverse('todo-list')
    
    # ---- Edit View Tests ----
    
    def test_todo_edit_view_get(self):
        """Test GET request to edit TODO view."""
        todo = Todo.objects.create(title="Original Title")
        response = self.client.get(reverse('todo-edit', args=[todo.pk]))
        
        assert response.status_code == 200
        assert 'form' in response.context
        assert response.context['form'].instance.id == todo.id
    
    def test_todo_edit_view_post_valid(self):
        """Test POST request with valid data to edit TODO."""
        todo = Todo.objects.create(title="Original Title")
        form_data = {
            'title': 'Updated Title',
            'description': 'Updated Description',
            'due_date': '',
            'is_resolved': False
        }
        response = self.client.post(reverse('todo-edit', args=[todo.pk]), form_data)
        
        todo.refresh_from_db()
        assert todo.title == 'Updated Title'
        assert todo.description == 'Updated Description'
    
    def test_todo_edit_view_post_invalid(self):
        """Test POST request with invalid data to edit TODO."""
        todo = Todo.objects.create(title="Original Title")
        form_data = {
            'title': '',  # Required field is empty
            'description': '',
            'due_date': '',
            'is_resolved': False
        }
        response = self.client.post(reverse('todo-edit', args=[todo.pk]), form_data)
        
        todo.refresh_from_db()
        assert todo.title == "Original Title"  # Should not be updated
    
    def test_todo_edit_404_nonexistent(self):
        """Test edit view with nonexistent TODO ID."""
        response = self.client.get(reverse('todo-edit', args=[9999]))
        assert response.status_code == 404
    
    # ---- Delete View Tests ----
    
    def test_todo_delete_view_get(self):
        """Test GET request to delete TODO view."""
        todo = Todo.objects.create(title="TODO to Delete")
        response = self.client.get(reverse('todo-delete', args=[todo.pk]))
        
        assert response.status_code == 200
        assert 'object' in response.context
        assert response.context['object'].id == todo.id
    
    def test_todo_delete_view_post(self):
        """Test POST request to delete TODO."""
        todo = Todo.objects.create(title="TODO to Delete")
        todo_id = todo.pk
        
        response = self.client.post(reverse('todo-delete', args=[todo.pk]))
        
        assert response.status_code == 302
        assert not Todo.objects.filter(pk=todo_id).exists()
    
    def test_todo_delete_404_nonexistent(self):
        """Test delete view with nonexistent TODO ID."""
        response = self.client.post(reverse('todo-delete', args=[9999]))
        assert response.status_code == 404
    
    # ---- Toggle Status View Tests ----
    
    def test_todo_toggle_status_post(self):
        """Test POST request to toggle TODO status."""
        todo = Todo.objects.create(title="TODO", is_resolved=False)
        
        response = self.client.post(reverse('todo-toggle', args=[todo.pk]))
        
        assert response.status_code == 200
        todo.refresh_from_db()
        assert todo.is_resolved is True
    
    def test_todo_toggle_status_twice(self):
        """Test toggling TODO status multiple times."""
        todo = Todo.objects.create(title="TODO", is_resolved=False)
        
        self.client.post(reverse('todo-toggle', args=[todo.pk]))
        todo.refresh_from_db()
        assert todo.is_resolved is True
        
        self.client.post(reverse('todo-toggle', args=[todo.pk]))
        todo.refresh_from_db()
        assert todo.is_resolved is False
    
    def test_todo_toggle_404_nonexistent(self):
        """Test toggle view with nonexistent TODO ID."""
        response = self.client.post(reverse('todo-toggle', args=[9999]))
        assert response.status_code == 404


# ========================
# Integration Tests
# ========================

@pytest.mark.django_db
class TestTodoIntegration:
    """Integration tests for complete workflows."""
    
    def setup_method(self):
        """Setup method to initialize client for each test."""
        self.client = Client()
    
    def test_complete_todo_workflow(self):
        """Test a complete TODO workflow: create, edit, mark as done, delete."""
        # 1. Create a TODO
        form_data = {
            'title': 'Complete Project',
            'description': 'Build a Django app',
            'due_date': timezone.now().date() + timedelta(days=5),
            'is_resolved': False
        }
        response = self.client.post(reverse('todo-create'), form_data)
        assert response.status_code == 302
        
        todo = Todo.objects.get(title='Complete Project')
        assert todo.is_resolved is False
        
        # 2. Edit the TODO
        edit_data = {
            'title': 'Complete Django Project',
            'description': 'Build a full-featured Django app',
            'due_date': timezone.now().date() + timedelta(days=3),
            'is_resolved': False
        }
        response = self.client.post(reverse('todo-edit', args=[todo.pk]), edit_data)
        assert response.status_code == 302
        
        todo.refresh_from_db()
        assert todo.title == 'Complete Django Project'
        
        # 3. Mark as resolved
        response = self.client.post(reverse('todo-toggle', args=[todo.pk]))
        assert response.status_code == 200
        
        todo.refresh_from_db()
        assert todo.is_resolved is True
        
        # 4. Delete the TODO
        todo_id = todo.pk
        response = self.client.post(reverse('todo-delete', args=[todo.pk]))
        assert response.status_code == 302
        
        assert not Todo.objects.filter(pk=todo_id).exists()
    
    def test_multiple_todos_workflow(self):
        """Test managing multiple TODOs simultaneously."""
        # Create multiple TODOs
        for i in range(5):
            Todo.objects.create(
                title=f"TODO {i}",
                is_resolved=(i % 2 == 0)  # Alternate resolved/pending
            )
        
        response = self.client.get(reverse('todo-list'))
        assert response.status_code == 200
        assert len(response.context['todos']) == 5
        assert response.context['completed_count'] == 3
        assert response.context['pending_count'] == 2
    
    def test_overdue_todos_display(self):
        """Test that overdue TODOs are properly identified."""
        past_date = timezone.now().date() - timedelta(days=3)
        future_date = timezone.now().date() + timedelta(days=3)
        
        todo_past = Todo.objects.create(
            title="Overdue TODO",
            due_date=past_date,
            is_resolved=False
        )
        todo_future = Todo.objects.create(
            title="Future TODO",
            due_date=future_date,
            is_resolved=False
        )
        
        assert todo_past.is_overdue() is True
        assert todo_future.is_overdue() is False


# ========================
# Edge Case Tests
# ========================

@pytest.mark.django_db
class TestTodoEdgeCases:
    """Test edge cases and boundary conditions."""
    
    def test_todo_with_empty_description(self):
        """Test creating TODO with empty description."""
        todo = Todo.objects.create(title="TODO", description="")
        assert todo.description == ""
    
    def test_todo_with_long_title(self):
        """Test creating TODO with very long title."""
        long_title = "A" * 200
        todo = Todo.objects.create(title=long_title)
        assert len(todo.title) == 200
    
    def test_todo_with_today_due_date(self):
        """Test TODO with due date as today."""
        today = timezone.now().date()
        todo = Todo.objects.create(
            title="Today's TODO",
            due_date=today,
            is_resolved=False
        )
        # Today is not overdue
        assert todo.is_overdue() is False
    
    def test_todo_with_tomorrow_due_date(self):
        """Test TODO with due date as tomorrow."""
        tomorrow = timezone.now().date() + timedelta(days=1)
        todo = Todo.objects.create(
            title="Tomorrow's TODO",
            due_date=tomorrow,
            is_resolved=False
        )
        assert todo.is_overdue() is False
    
    def test_create_multiple_todos_at_same_time(self):
        """Test creating multiple TODOs in quick succession."""
        todos = [
            Todo.objects.create(title=f"TODO {i}")
            for i in range(100)
        ]
        assert len(todos) == 100
        assert Todo.objects.count() == 100
    
    def test_update_todo_same_values(self):
        """Test updating TODO with the same values."""
        todo = Todo.objects.create(title="TODO")
        original_updated_at = todo.updated_at
        
        todo.title = "TODO"
        todo.save()
        
        todo.refresh_from_db()
        assert todo.updated_at > original_updated_at
