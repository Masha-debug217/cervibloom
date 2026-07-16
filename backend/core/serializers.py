from rest_framework import serializers
from .models import (
    Facility, SymptomLog, ScreeningReminder,
    VolunteerApplication, DonationRecord, FAQItem
)


class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = '__all__'


class SymptomLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomLog
        fields = ['id', 'symptoms', 'notes', 'created_at']
        # 'patient' is set automatically from the logged-in user (see views.py) -
        # never trust the client to say who they are.


class ScreeningReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScreeningReminder
        fields = ['id', 'next_due_date', 'guidance_note']


class VolunteerApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerApplication
        fields = ['id', 'message', 'status', 'submitted_at']
        read_only_fields = ['status']  # only admin changes status, via a separate action


class DonationRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationRecord
        fields = ['id', 'amount_kes', 'created_at']


class FAQItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQItem
        fields = ['id', 'question', 'answer', 'order']
