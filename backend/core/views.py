from rest_framework import viewsets, permissions, status as http_status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import (
    Facility, SymptomLog, ScreeningReminder,
    VolunteerApplication, DonationRecord, FAQItem, MythFact
)
from .serializers import (
    FacilitySerializer, SymptomLogSerializer, ScreeningReminderSerializer,
    VolunteerApplicationSerializer, DonationRecordSerializer, FAQItemSerializer,
    MythFactSerializer
)
from .permissions import IsAdminRole, IsAdminRoleOrReadOnly
from . import symptom_navigator


class FacilityViewSet(viewsets.ModelViewSet):
    """Public directory data. Anyone (even logged out) can read; only Admin can edit."""
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    permission_classes = [IsAdminRoleOrReadOnly]


FAQ_STOPWORDS = {
    'the', 'and', 'for', 'are', 'was', 'how', 'what', 'does', 'did', 'can',
    'you', 'your', 'with', 'that', 'this', 'have', 'has', 'get', 'got',
    'about', 'from', 'when', 'why', 'which', 'would', 'should', 'could',
    'is', 'it', 'of', 'to', 'in', 'on', 'do', 'my', 'me', 'am', 'be',
}


def _tokenise(text):
    token = ''
    tokens = []
    for ch in text.lower():
        if ch.isalnum():
            token += ch
        elif token:
            tokens.append(token)
            token = ''
    if token:
        tokens.append(token)
    return [t for t in tokens if len(t) >= 3 and t not in FAQ_STOPWORDS]


class FAQItemViewSet(viewsets.ModelViewSet):
    """Info Hub content. Anyone (even logged out) can read; only Admin can edit."""
    queryset = FAQItem.objects.all()
    serializer_class = FAQItemSerializer
    permission_classes = [IsAdminRoleOrReadOnly]

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def search(self, request):
        """
        GET /api/faqs/search/?q=...
        Rule-based, offline keyword match over existing FAQ content - no
        external LLM call, works with zero API budget. Question-text matches
        are weighted more heavily than answer-body matches. If nothing scores,
        we hand back a suggestion to visit a screening centre instead.
        """
        query_tokens = _tokenise(request.query_params.get('q', ''))
        if not query_tokens:
            return Response({'results': [], 'suggestion': None})

        scored = []
        for faq in FAQItem.objects.all():
            q_tokens = set(_tokenise(faq.question))
            a_tokens = set(_tokenise(faq.answer))
            score = 2 * len(q_tokens & set(query_tokens)) + len(a_tokens & set(query_tokens))
            if score:
                scored.append((score, faq))

        scored.sort(key=lambda pair: (-pair[0], pair[1].order))
        top = [faq for _, faq in scored[:5]]

        if not top:
            return Response({
                'results': [],
                'suggestion': "We could not match your question to our answers. "
                              "Please visit a screening centre or talk to a health "
                              "worker - you can find your nearest one in the "
                              "Screening Directory.",
            })
        return Response({
            'results': FAQItemSerializer(top, many=True).data,
            'suggestion': None,
        })


class MythFactViewSet(viewsets.ModelViewSet):
    """Myth-vs-fact cards. Public read, ADMIN-only write - same as FAQs."""
    queryset = MythFact.objects.all()
    serializer_class = MythFactSerializer
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
        # Risk tier and the summary string are computed here from the
        # submitted answers - never taken from the client.
        answers = serializer.validated_data.get('answers') or {}
        serializer.save(
            patient=self.request.user,
            risk_tier=symptom_navigator.score(answers),
            symptoms=symptom_navigator.summary(answers),
        )

    @action(detail=False, methods=['get'])
    def questions(self, request):
        """
        GET /api/symptom-logs/questions/
        The fixed question sequence + tier copy, so the frontend and the
        scoring rule stay in sync from one source.
        """
        return Response({
            'questions': symptom_navigator.QUESTIONS,
            'tiers': symptom_navigator.TIERS,
        })


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
