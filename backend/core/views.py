from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
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


class ScreeningReminderViewSet(viewsets.ReadOnlyModelViewSet):
    """Patients can view their own reminder. Admin creates/updates these (via Django admin for now)."""
    serializer_class = ScreeningReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ScreeningReminder.objects.filter(patient=self.request.user)


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
