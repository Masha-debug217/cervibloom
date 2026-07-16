from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Registering with the built-in UserAdmin gives us a full working
# admin UI (search, password reset, etc.) for free - no need to build one.
admin.site.register(User, UserAdmin)
