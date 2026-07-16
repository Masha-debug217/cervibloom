from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles new account creation for any role (Patient/Volunteer/Admin).
    Password is write_only so it never gets sent back in an API response.
    """
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'phone_number', 'county']

    def create(self, validated_data):
        # create_user() hashes the password properly - never save raw passwords
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    """Used to return the logged-in user's own profile info (no password)."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone_number', 'county']
