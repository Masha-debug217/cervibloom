from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    """Only users with role=ADMIN can write. Everyone authenticated can read."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'
