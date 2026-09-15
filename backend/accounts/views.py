from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User
from .serializers import (
    RegisterSerializer, UserSerializer, ProfileUpdateSerializer,
    ChangePasswordSerializer,
)


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Anyone can hit this (AllowAny) since you need to register BEFORE
    you have a token to prove who you are.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    """
    GET /api/auth/me/
    Returns the profile of whoever's JWT token is in the request.
    This is how the React frontend knows "who am I logged in as"
    and which dashboard/role to show.

    PATCH/PUT /api/auth/me/
    Lets that same user edit their own profile (name, contact info,
    county, self-reported health profile, preferred language). Uses
    ProfileUpdateSerializer so `username` and `role` can never be changed
    through this endpoint.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ProfileUpdateSerializer
        return UserSerializer


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Body: {current_password, new_password}. Requires the current password
    so a stolen or forgotten signed-in session can't be used to lock the
    real account owner out.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['current_password']):
            return Response(
                {'current_password': ['Current password is incorrect.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'detail': 'Password changed successfully.'})
