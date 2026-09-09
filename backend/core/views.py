from rest_framework import viewsets, permissions, status as http_status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import (
    Facility, SymptomLog, ScreeningReminder,
    VolunteerApplication, DonationRecord, FAQItem
)
from .serializers import (
    FacilitySerializer, SymptomLogSerializer, ScreeningReminderSerializer,
    VolunteerApplicationSerializer, DonationRecordSerializer, FAQItemSerializer
)
from .permissions import IsAdminRole, IsAdminRoleOrReadOnly


class FacilityViewSet(viewsets.ModelViewSet):
    """Public directory data. Anyone (even logged out) can read; only Admin can edit."""
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    permission_classes = [IsAdminRoleOrReadOnly]


class FAQItemViewSet(viewsets.ModelViewSet):
    """Info Hub content. Anyone (even logged out) can read; only Admin can edit."""
    queryset = FAQItem.objects.all()
    serializer_class = FAQItemSerializer
    permission_classes = [IsAdminRoleOrReadOnly]


class SymptomLogViewSet(viewsets.ModelViewSet):
    """
    A patient can only ever see/create/edit THEIR OWN symptom logs.
    This is the key privacy rule from our proposal - enforced here,
    not just in the UI (the UI hiding a button is not security).
    """
    serializer_class = SymptomLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SymptomLog.objects.filter(patient=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)


class ScreeningReminderViewSet(viewsets.ModelViewSet):
    """
    Read: a patient sees only their own reminder; an admin sees all.
    Write (create/update/delete): ADMIN only - `IsAdminRole` already allows
    any authenticated read and restricts unsafe methods to role=ADMIN.

    Create is idempotent per patient (ScreeningReminder is OneToOne): POSTing
    for a patient who already has a reminder updates it instead of 500-ing.
    """
    serializer_class = ScreeningReminderSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'ADMIN':
            return ScreeningReminder.objects.all()
        return ScreeningReminder.objects.filter(patient=user)

    def perform_create(self, serializer):
        patient = serializer.validated_data['patient']
        defaults = {
            k: v for k, v in serializer.validated_data.items() if k != 'patient'
        }
        obj, _ = ScreeningReminder.objects.update_or_create(
            patient=patient, defaults=defaults
        )
        serializer.instance = obj


class VolunteerApplicationViewSet(viewsets.ModelViewSet):
    """A volunteer can create + view their own applications. Admin sees all (future: separate admin endpoint)."""
    serializer_class = VolunteerApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return VolunteerApplication.objects.all()
        return VolunteerApplication.objects.filter(volunteer=user)

    def perform_create(self, serializer):
        # Enforced server-side: a Patient or Admin account cannot file a
        # volunteer application, no matter what the client sends.
        if self.request.user.role != 'VOLUNTEER':
            raise PermissionDenied(
                "Only volunteer accounts can submit a volunteer application."
            )
        serializer.save(volunteer=self.request.user)

    @action(detail=True, methods=['patch'], url_path='status')
    def set_status(self, request, pk=None):
        """
        PATCH /api/volunteer-applications/{id}/status/  {"status": "CONTACTED"}
        ADMIN-only. This is the "separate action" the serializer's
        read_only status field always referred to.
        """
        if not (request.user.is_authenticated and request.user.role == 'ADMIN'):
            raise PermissionDenied("Only an admin can change application status.")

        application = self.get_object()
        new_status = request.data.get('status')
        valid = [choice[0] for choice in VolunteerApplication.Status.choices]
        if new_status not in valid:
            return Response(
                {'status': [f"Must be one of: {', '.join(valid)}."]},
                status=http_status.HTTP_400_BAD_REQUEST,
            )
        application.status = new_status
        application.save(update_fields=['status'])
        return Response(self.get_serializer(application).data)


class DonationRecordViewSet(viewsets.ModelViewSet):
    """Simulated donations - donor can create/view their own; admin sees all."""
    serializer_class = DonationRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return DonationRecord.objects.all()
        return DonationRecord.objects.filter(donor=user)

    def perform_create(self, serializer):
        serializer.save(donor=self.request.user)
