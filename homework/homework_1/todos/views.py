from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator
from django.contrib import messages

from .models import Todo
from .forms import TodoForm


class TodoListView(ListView):
    """Display list of all TODOs."""
    model = Todo
    template_name = 'todos/home.html'
    context_object_name = 'todos'
    paginate_by = 10

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['total_count'] = Todo.objects.count()
        context['completed_count'] = Todo.objects.filter(is_resolved=True).count()
        context['pending_count'] = Todo.objects.filter(is_resolved=False).count()
        return context


class TodoCreateView(CreateView):
    """Create a new TODO."""
    model = Todo
    form_class = TodoForm
    template_name = 'todos/todo_form.html'
    success_url = reverse_lazy('todo-list')

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, f"TODO '{self.object.title}' created successfully!")
        return response


class TodoUpdateView(UpdateView):
    """Edit an existing TODO."""
    model = Todo
    form_class = TodoForm
    template_name = 'todos/todo_form.html'
    success_url = reverse_lazy('todo-list')

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, f"TODO '{self.object.title}' updated successfully!")
        return response


class TodoDeleteView(DeleteView):
    """Delete a TODO."""
    model = Todo
    template_name = 'todos/todo_confirm_delete.html'
    success_url = reverse_lazy('todo-list')

    def delete(self, request, *args, **kwargs):
        todo_title = self.get_object().title
        response = super().delete(request, *args, **kwargs)
        messages.success(request, f"TODO '{todo_title}' deleted successfully!")
        return response


@require_POST
def toggle_todo_status(request, pk):
    """Toggle the resolved status of a TODO (AJAX endpoint)."""
    todo = get_object_or_404(Todo, pk=pk)
    todo.is_resolved = not todo.is_resolved
    todo.save()
    
    return JsonResponse({
        'success': True,
        'is_resolved': todo.is_resolved,
        'message': f"TODO marked as {'completed' if todo.is_resolved else 'pending'}"
    })
