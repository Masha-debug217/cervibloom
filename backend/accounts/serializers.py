from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles new account creation. `role` is deliberately not a field here:
    every open registration becomes a plain User account (the model
    default), so there is nothing for a client to set that could mint an
    Admin account. Admins are created via `createsuperuser` or promoted
    later by an existing admin.
    Password is write_only so it never gets sent back in an API response.
    """
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 'last_name',
            'phone_number', 'county', 'date_of_birth', 'last_screening_year',
            'hpv_vaccine_doses', 'preferred_language',
        ]

    def create(self, validated_data):
        # create_user() hashes the password properly - never save raw passwords
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    """Used to return the logged-in user's own profile info (no password)."""
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'first_name', 'last_name',
            'phone_number', 'county', 'date_of_birth', 'last_screening_year',
            'hpv_vaccine_doses', 'preferred_language',
        ]


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Used to edit the logged-in user's own profile. `username` and `role`
    are deliberately not fields here: username is the login identifier and
    isn't meant to change casually, and role only ever changes through an
    admin action, never self-service.
    """
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'phone_number', 'county',
            'date_of_birth', 'last_screening_year', 'hpv_vaccine_doses',
            'preferred_language',
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """Requires the current password so a signed-in session alone (e.g. a
    shared or forgotten device) can't be used to lock the real owner out."""
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
