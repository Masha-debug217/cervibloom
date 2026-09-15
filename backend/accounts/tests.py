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


class ProfileUpdateTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='amina', email='amina@e.com', password='testpass123')
        self.client.force_authenticate(user=self.user)

    def test_can_update_own_profile_fields(self):
        resp = self.client.patch(
            '/api/auth/me/',
            {'first_name': 'Amina', 'county': 'Kisumu', 'hpv_vaccine_doses': '2'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Amina')
        self.assertEqual(self.user.county, 'Kisumu')
        self.assertEqual(self.user.hpv_vaccine_doses, '2')

    def test_cannot_change_username_or_role_through_profile_update(self):
        resp = self.client.patch(
            '/api/auth/me/',
            {'username': 'someone_else', 'role': 'ADMIN'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'amina')
        self.assertEqual(self.user.role, 'USER')

    def test_update_requires_authentication(self):
        self.client.force_authenticate(user=None)
        resp = self.client.patch('/api/auth/me/', {'first_name': 'Amina'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class ChangePasswordTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='amina', email='amina@e.com', password='oldpass123')
        self.client.force_authenticate(user=self.user)

    def test_can_change_password_with_correct_current_password(self):
        resp = self.client.post(
            '/api/auth/change-password/',
            {'current_password': 'oldpass123', 'new_password': 'newpass456'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpass456'))

    def test_rejects_wrong_current_password(self):
        resp = self.client.post(
            '/api/auth/change-password/',
            {'current_password': 'wrongpass', 'new_password': 'newpass456'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('oldpass123'))

    def test_rejects_new_password_shorter_than_minimum(self):
        resp = self.client.post(
            '/api/auth/change-password/',
            {'current_password': 'oldpass123', 'new_password': 'short'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
