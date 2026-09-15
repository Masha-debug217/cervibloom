from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from django.utils import timezone

from core import symptom_navigator
from core.models import SymptomLog, Article, BlogPost, Event

User = get_user_model()


class SymptomNavigatorScoringTests(APITestCase):
    """The scoring rule is deterministic and computed server-side."""

    def test_no_symptoms_is_routine(self):
        self.assertEqual(symptom_navigator.score({}), 'ROUTINE')

    def test_single_non_red_flag_is_discuss(self):
        self.assertEqual(symptom_navigator.score({'unusual_discharge': True}), 'DISCUSS')

    def test_postmenopausal_bleeding_is_seek_care(self):
        self.assertEqual(symptom_navigator.score({'postmenopausal_bleeding': True}), 'SEEK_CARE')

    def test_three_symptoms_is_seek_care(self):
        answers = {'pelvic_pain': True, 'pain_intercourse': True, 'unusual_discharge': True}
        self.assertEqual(symptom_navigator.score(answers), 'SEEK_CARE')

    def test_risk_tier_is_set_from_answers_not_from_client(self):
        user = User.objects.create_user('nav', 'n@e.com', 'testpass123')
        self.client.force_authenticate(user)
        resp = self.client.post(
            '/api/symptom-logs/',
            {'answers': {'postmenopausal_bleeding': True}, 'risk_tier': 'ROUTINE'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['risk_tier'], 'SEEK_CARE')  # client's 'ROUTINE' ignored


class SymptomLogPrivacyTests(APITestCase):
    """A user's health data is filtered server-side to that user."""

    def setUp(self):
        self.alice = User.objects.create_user('alice', 'a@e.com', 'testpass123')
        self.bob = User.objects.create_user('bob', 'b@e.com', 'testpass123')
        SymptomLog.objects.create(patient=self.alice, symptoms='Pelvic pain')

    def test_user_cannot_see_another_users_symptom_logs(self):
        self.client.force_authenticate(self.bob)
        resp = self.client.get('/api/symptom-logs/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(list(resp.data), [])

    def test_user_sees_only_their_own_symptom_logs(self):
        self.client.force_authenticate(self.alice)
        resp = self.client.get('/api/symptom-logs/')
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['symptoms'], 'Pelvic pain')


class FacilityPermissionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user('pat', 'p@e.com', 'testpass123')
        self.admin = User.objects.create_user('adm', 'adm@e.com', 'testpass123', role='ADMIN')
        self.payload = {'name': 'Test Hospital', 'county': 'Nairobi', 'services': 'VIA'}

    def test_anonymous_user_can_read_facilities(self):
        resp = self.client.get('/api/facilities/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_non_admin_cannot_create_a_facility(self):
        self.client.force_authenticate(self.user)
        resp = self.client.post('/api/facilities/', self.payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_a_facility(self):
        self.client.force_authenticate(self.admin)
        resp = self.client.post('/api/facilities/', self.payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)


class VolunteerApplicationRoleTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user('u1', 'u1@e.com', 'testpass123')
        self.admin = User.objects.create_user('adm', 'adm@e.com', 'testpass123', role='ADMIN')
        self.application_payload = {
            'role': 'Community Mobilizer',
            'category': 'NON_MEDICAL',
            'full_name': 'Test Volunteer',
            'phone': '+254700000000',
            'county': 'Nairobi',
            'availability': 'WEEKENDS',
            'motivation': 'I want to help raise awareness.',
        }

    def test_admin_cannot_create_a_volunteer_application(self):
        self.client.force_authenticate(self.admin)
        resp = self.client.post('/api/volunteer-applications/', self.application_payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_can_create_a_volunteer_application(self):
        self.client.force_authenticate(self.user)
        resp = self.client.post('/api/volunteer-applications/', self.application_payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_only_admin_can_change_application_status(self):
        self.client.force_authenticate(self.user)
        created = self.client.post('/api/volunteer-applications/', self.application_payload, format='json')
        app_id = created.data['id']

        # a regular user cannot move their own application's status
        resp = self.client.patch(f'/api/volunteer-applications/{app_id}/status/',
                                 {'status': 'APPROVED'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.admin)
        resp = self.client.patch(f'/api/volunteer-applications/{app_id}/status/',
                                 {'status': 'APPROVED'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'APPROVED')


class ArticleTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user('reader', 'r@e.com', 'testpass123')
        self.other = User.objects.create_user('other', 'o@e.com', 'testpass123')
        self.admin = User.objects.create_user('adm', 'adm@e.com', 'testpass123', role='ADMIN')
        self.article = Article.objects.create(
            title='Test Article', summary='A summary', body='A body',
        )

    def test_anonymous_user_can_read_articles(self):
        resp = self.client.get('/api/articles/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertFalse(resp.data[0]['is_bookmarked'])

    def test_non_admin_cannot_create_an_article(self):
        self.client.force_authenticate(self.user)
        resp = self.client.post('/api/articles/', {'title': 'x', 'summary': 'x', 'body': 'x'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_an_article(self):
        self.client.force_authenticate(self.admin)
        resp = self.client.post('/api/articles/', {'title': 'x', 'summary': 'x', 'body': 'x'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_anonymous_user_cannot_bookmark(self):
        resp = self.client.post(f'/api/articles/{self.article.id}/toggle_bookmark/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_toggle_bookmark_saves_then_removes(self):
        self.client.force_authenticate(self.user)
        resp = self.client.post(f'/api/articles/{self.article.id}/toggle_bookmark/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['is_bookmarked'])

        resp = self.client.get('/api/articles/bookmarked/')
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['id'], self.article.id)

        resp = self.client.post(f'/api/articles/{self.article.id}/toggle_bookmark/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertFalse(resp.data['is_bookmarked'])

        resp = self.client.get('/api/articles/bookmarked/')
        self.assertEqual(len(resp.data), 0)

    def test_bookmarks_are_private_to_each_user(self):
        self.client.force_authenticate(self.user)
        self.client.post(f'/api/articles/{self.article.id}/toggle_bookmark/')

        self.client.force_authenticate(self.other)
        resp = self.client.get('/api/articles/bookmarked/')
        self.assertEqual(len(resp.data), 0)


class BlogPostTests(APITestCase):
    def setUp(self):
        self.author = User.objects.create_user('survivor', 's@e.com', 'testpass123')
        self.other = User.objects.create_user('reader', 'r@e.com', 'testpass123')
        self.admin = User.objects.create_user('adm', 'adm@e.com', 'testpass123', role='ADMIN')
        self.published = BlogPost.objects.create(
            author=self.author, title='Published', body='...', status=BlogPost.Status.PUBLISHED,
        )
        self.pending = BlogPost.objects.create(
            author=self.author, title='Pending', body='...', status=BlogPost.Status.PENDING,
        )

    def test_anonymous_user_sees_only_published_posts(self):
        resp = self.client.get('/api/blog-posts/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        titles = [p['title'] for p in resp.data]
        self.assertEqual(titles, ['Published'])

    def test_author_sees_their_own_pending_post_too(self):
        self.client.force_authenticate(self.author)
        resp = self.client.get('/api/blog-posts/')
        titles = {p['title'] for p in resp.data}
        self.assertEqual(titles, {'Published', 'Pending'})

    def test_other_user_does_not_see_someone_elses_pending_post(self):
        self.client.force_authenticate(self.other)
        resp = self.client.get('/api/blog-posts/')
        titles = {p['title'] for p in resp.data}
        self.assertEqual(titles, {'Published'})

    def test_new_post_defaults_to_pending_regardless_of_client_input(self):
        self.client.force_authenticate(self.other)
        resp = self.client.post(
            '/api/blog-posts/', {'title': 'My story', 'body': '...', 'status': 'PUBLISHED'}, format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['status'], 'PENDING')
        self.assertEqual(resp.data['author_username'], 'reader')

    def test_only_admin_can_change_post_status(self):
        self.client.force_authenticate(self.author)
        resp = self.client.patch(
            f'/api/blog-posts/{self.pending.id}/status/', {'status': 'PUBLISHED'}, format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.admin)
        resp = self.client.patch(
            f'/api/blog-posts/{self.pending.id}/status/', {'status': 'PUBLISHED'}, format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'PUBLISHED')

    def test_user_cannot_edit_someone_elses_post(self):
        self.client.force_authenticate(self.other)
        resp = self.client.patch(
            f'/api/blog-posts/{self.published.id}/', {'title': 'Hijacked'}, format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_author_can_edit_their_own_post(self):
        self.client.force_authenticate(self.author)
        resp = self.client.patch(
            f'/api/blog-posts/{self.pending.id}/', {'title': 'Updated title'}, format='json'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['title'], 'Updated title')


class EventRSVPTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user('rsvp_u', 'rsvp_u@e.com', 'testpass123')
        self.admin = User.objects.create_user('rsvp_adm', 'rsvp_adm@e.com', 'testpass123', role='ADMIN')
        self.event = Event.objects.create(
            title='Community Screening Day',
            description='A free screening event.',
            location='Kenyatta National Hospital, Nairobi',
            county='Nairobi',
            start_date=timezone.now() + timezone.timedelta(days=7),
        )

    def test_anyone_can_list_events_without_signing_in(self):
        resp = self.client.get('/api/events/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_only_admin_can_create_an_event(self):
        self.client.force_authenticate(self.user)
        resp = self.client.post('/api/events/', {
            'title': 'Unauthorized Event', 'description': 'x',
            'location': 'Somewhere', 'start_date': timezone.now(),
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_rsvp_requires_sign_in(self):
        resp = self.client.post(f'/api/events/{self.event.id}/toggle_rsvp/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_toggle_rsvp_creates_then_removes(self):
        self.client.force_authenticate(self.user)
        resp = self.client.post(f'/api/events/{self.event.id}/toggle_rsvp/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['is_rsvped'])
        self.assertEqual(resp.data['rsvp_count'], 1)

        resp = self.client.post(f'/api/events/{self.event.id}/toggle_rsvp/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertFalse(resp.data['is_rsvped'])
        self.assertEqual(resp.data['rsvp_count'], 0)

    def test_admin_cannot_rsvp(self):
        self.client.force_authenticate(self.admin)
        resp = self.client.post(f'/api/events/{self.event.id}/toggle_rsvp/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
