from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import User
from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Anyone can hit this (AllowAny) since you need to register BEFORE
    you have a token to prove who you are.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveAPIView):
    """
    GET /api/auth/me/
    Returns the profile of whoever's JWT token is in the request.
    This is how the React frontend knows "who am I logged in as"
    and which dashboard/role to show.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
