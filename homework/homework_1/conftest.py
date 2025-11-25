"""
Pytest configuration file for Django TODO app.
This file automatically configures pytest-django to work with the project.
"""

import os
import django
from django.conf import settings

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')

# Setup Django
if not settings.configured:
    django.setup()
