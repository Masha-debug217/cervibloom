from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class RegistrationTests(APITestCase):
    """Open registration must never be able to mint an Admin account."""

    def test_registering_with_role_admin_is_rejected(self):
        resp = self.client.post(
            '/api/auth/register/',
            {'username': 'sneaky', 'email': 's@e.com',
             'password': 'testpass123', 'role': 'ADMIN'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('role', resp.data)
        self.assertFalse(User.objects.filter(username='sneaky').exists())

    def test_registering_as_patient_still_works(self):
        resp = self.client.post(
            '/api/auth/register/',
            {'username': 'pat', 'email': 'p@e.com',
             'password': 'testpass123', 'role': 'PATIENT'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.get(username='pat').role, 'PATIENT')
