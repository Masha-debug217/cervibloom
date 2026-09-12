from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import (
    Facility, SymptomLog, ScreeningReminder,
    VolunteerApplication, DonationRecord, FAQItem, MythFact,
    Article, BlogPost,
)

User = get_user_model()


class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = '__all__'


class SymptomLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomLog
        fields = ['id', 'symptoms', 'answers', 'risk_tier', 'notes', 'created_at']
        # 'patient' is set automatically from the logged-in user (see views.py).
        # 'symptoms' and 'risk_tier' are derived server-side from 'answers' -
        # the client submits answers, it does not get to assert its own risk.
        read_only_fields = ['symptoms', 'risk_tier']


class ScreeningReminderSerializer(serializers.ModelSerializer):
    # Declared explicitly with validators=[] so DRF does NOT attach the
    # implicit OneToOne UniqueValidator - the viewset intentionally treats a
    # repeat POST for the same patient as an update (update_or_create).
    patient = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), validators=[]
    )

    class Meta:
        model = ScreeningReminder
        fields = ['id', 'patient', 'next_due_date', 'guidance_note']
        # `patient` is required on write (admin sets a reminder for a given
        # patient) and simply echoed back on read.


class VolunteerApplicationSerializer(serializers.ModelSerializer):
    # Read-only so the admin list can show who applied without exposing
    # anything writable.
    volunteer_username = serializers.CharField(source='volunteer.username', read_only=True)
    volunteer_county = serializers.CharField(source='volunteer.county', read_only=True)

    class Meta:
        model = VolunteerApplication
        fields = [
            'id', 'message', 'status', 'submitted_at',
            'volunteer_username', 'volunteer_county',
        ]
        # status is changed only by an admin, via the set_status action
        # (PATCH /api/volunteer-applications/{id}/status/).
        read_only_fields = ['status']


class DonationRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationRecord
        fields = ['id', 'amount_kes', 'is_anonymous', 'created_at']


class FAQItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQItem
        fields = ['id', 'question', 'answer', 'question_sw', 'answer_sw', 'order']


class MythFactSerializer(serializers.ModelSerializer):
    class Meta:
        model = MythFact
        fields = ['id', 'myth', 'fact', 'myth_sw', 'fact_sw', 'category', 'order']


class ArticleSerializer(serializers.ModelSerializer):
    # True if the request's signed-in user has bookmarked this article;
    # always False for an anonymous request. Computed here rather than
    # stored, so it always reflects the current user's own bookmarks.
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'summary', 'body', 'source_name', 'source_url',
            'title_sw', 'summary_sw', 'body_sw', 'order', 'is_bookmarked',
        ]

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return obj.bookmarked_by.filter(user=user).exists()


class BlogPostSerializer(serializers.ModelSerializer):
    # Read-only so a submitter can't rename themselves as the author, and
    # can't set their own post straight to PUBLISHED (see status action).
    author_username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'body', 'status', 'created_at', 'author_username']
        read_only_fields = ['status']
