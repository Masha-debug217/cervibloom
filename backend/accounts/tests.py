from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class RegistrationTests(APITestCase):
    """Open registration must never be able to mint an Admin account."""

    def test_registering_cannot_set_role_to_admin(self):
        # `role` isn't a writable field on RegisterSerializer, so an extra
        # 'role': 'ADMIN' in the request body is silently ignored rather
        # than validated - the account still comes out as a plain User.
        resp = self.client.post(
            '/api/auth/register/',
            {'username': 'sneaky', 'email': 's@e.com',
             'password': 'testpass123', 'role': 'ADMIN'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.get(username='sneaky').role, 'USER')

    def test_registered_account_defaults_to_user_role(self):
        resp = self.client.post(
            '/api/auth/register/',
            {'username': 'pat', 'email': 'p@e.com', 'password': 'testpass123'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.get(username='pat').role, 'USER')
