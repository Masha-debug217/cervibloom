from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import SymptomLog

User = get_user_model()


class SymptomLogPrivacyTests(APITestCase):
    """A patient's health data is filtered server-side to that patient."""

    def setUp(self):
        self.alice = User.objects.create_user('alice', 'a@e.com', 'testpass123', role='PATIENT')
        self.bob = User.objects.create_user('bob', 'b@e.com', 'testpass123', role='PATIENT')
        SymptomLog.objects.create(patient=self.alice, symptoms='Pelvic pain')

    def test_patient_cannot_see_another_patients_symptom_logs(self):
        self.client.force_authenticate(self.bob)
        resp = self.client.get('/api/symptom-logs/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(list(resp.data), [])

    def test_patient_sees_only_their_own_symptom_logs(self):
        self.client.force_authenticate(self.alice)
        resp = self.client.get('/api/symptom-logs/')
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['symptoms'], 'Pelvic pain')


class FacilityPermissionTests(APITestCase):
    def setUp(self):
        self.patient = User.objects.create_user('pat', 'p@e.com', 'testpass123', role='PATIENT')
        self.admin = User.objects.create_user('adm', 'adm@e.com', 'testpass123', role='ADMIN')
        self.payload = {'name': 'Test Hospital', 'county': 'Nairobi', 'services': 'VIA'}

    def test_anonymous_user_can_read_facilities(self):
        resp = self.client.get('/api/facilities/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_non_admin_cannot_create_a_facility(self):
        self.client.force_authenticate(self.patient)
        resp = self.client.post('/api/facilities/', self.payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_a_facility(self):
        self.client.force_authenticate(self.admin)
        resp = self.client.post('/api/facilities/', self.payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)


class VolunteerApplicationRoleTests(APITestCase):
    def setUp(self):
        self.patient = User.objects.create_user('pat', 'p@e.com', 'testpass123', role='PATIENT')
        self.volunteer = User.objects.create_user('vol', 'v@e.com', 'testpass123', role='VOLUNTEER')

    def test_patient_cannot_create_a_volunteer_application(self):
        self.client.force_authenticate(self.patient)
        resp = self.client.post('/api/volunteer-applications/', {'message': 'hi'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_volunteer_can_create_a_volunteer_application(self):
        self.client.force_authenticate(self.volunteer)
        resp = self.client.post('/api/volunteer-applications/', {'message': 'hi'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_only_admin_can_change_application_status(self):
        self.client.force_authenticate(self.volunteer)
        created = self.client.post('/api/volunteer-applications/', {'message': 'hi'}, format='json')
        app_id = created.data['id']

        # volunteer cannot move their own status
        resp = self.client.patch(f'/api/volunteer-applications/{app_id}/status/',
                                 {'status': 'ACCEPTED'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        admin = User.objects.create_user('adm', 'adm@e.com', 'testpass123', role='ADMIN')
        self.client.force_authenticate(admin)
        resp = self.client.patch(f'/api/volunteer-applications/{app_id}/status/',
                                 {'status': 'CONTACTED'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'CONTACTED')
