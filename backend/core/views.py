from django.db.models import Q
from rest_framework import viewsets, permissions, status as http_status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import (
    Facility, SymptomLog, ScreeningReminder,
    VolunteerApplication, DonationRecord, FAQItem, MythFact,
    Article, ArticleBookmark, BlogPost, Event, EventRSVP,
)
from .serializers import (
    FacilitySerializer, SymptomLogSerializer, ScreeningReminderSerializer,
    VolunteerApplicationSerializer, DonationRecordSerializer, FAQItemSerializer,
    MythFactSerializer, ArticleSerializer, BlogPostSerializer,
    EventSerializer,
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
        GET /api/faqs/search/?q=...&lang=en|sw
        Rule-based, offline keyword match over existing FAQ content - no
        external LLM call, works with zero API budget. Question-text matches
        are weighted more heavily than answer-body matches, and both the
        English and Kiswahili fields are searched regardless of `lang` (a
        user might type in either). If nothing scores, we hand back a
        suggestion, in the requested language, to visit a screening centre
        instead.
        """
        query_tokens = _tokenise(request.query_params.get('q', ''))
        lang = request.query_params.get('lang', 'en')
        if not query_tokens:
            return Response({'results': [], 'suggestion': None})

        scored = []
        for faq in FAQItem.objects.all():
            q_tokens = set(_tokenise(faq.question)) | set(_tokenise(faq.question_sw))
            a_tokens = set(_tokenise(faq.answer)) | set(_tokenise(faq.answer_sw))
            score = 2 * len(q_tokens & set(query_tokens)) + len(a_tokens & set(query_tokens))
            if score:
                scored.append((score, faq))

        scored.sort(key=lambda pair: (-pair[0], pair[1].order))
        top = [faq for _, faq in scored[:5]]

        if not top:
            suggestion = (
                "Hatukuweza kulinganisha swali lako na majibu yetu. Tafadhali "
                "tembelea kituo cha uchunguzi au zungumza na mhudumu wa afya, "
                "unaweza kupata kilicho karibu nawe katika Vituo vya Uchunguzi."
                if lang == 'sw' else
                "We could not match your question to our answers. "
                "Please visit a screening centre or talk to a health "
                "worker - you can find your nearest one in the "
                "Screening Directory."
            )
            return Response({'results': [], 'suggestion': suggestion})
        return Response({
            'results': FAQItemSerializer(top, many=True).data,
            'suggestion': None,
        })


class MythFactViewSet(viewsets.ModelViewSet):
    """Myth-vs-fact cards. Public read, ADMIN-only write - same as FAQs."""
    queryset = MythFact.objects.all()
    serializer_class = MythFactSerializer
    permission_classes = [IsAdminRoleOrReadOnly]


class ArticleViewSet(viewsets.ModelViewSet):
    """Science articles for the Info Hub. Public read, ADMIN-only write - same as FAQs/myths."""
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminRoleOrReadOnly]

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_bookmark(self, request, pk=None):
        """
        POST /api/articles/{id}/toggle_bookmark/
        Saves the article to the signed-in user's bookmarks if it isn't
        already there, otherwise removes it. Returns the new state so the
        frontend doesn't need a second request to know what happened.
        """
        article = self.get_object()
        bookmark = ArticleBookmark.objects.filter(user=request.user, article=article).first()
        if bookmark:
            bookmark.delete()
            return Response({'is_bookmarked': False})
        ArticleBookmark.objects.create(user=request.user, article=article)
        return Response({'is_bookmarked': True})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def bookmarked(self, request):
        """GET /api/articles/bookmarked/ - the signed-in user's saved articles."""
        articles = self.get_queryset().filter(bookmarked_by__user=request.user)
        serializer = self.get_serializer(articles, many=True)
        return Response(serializer.data)


class BlogPostViewSet(viewsets.ModelViewSet):
    """
    Survivor Blog. Anyone can read PUBLISHED posts; a signed-in author can
    also see their own PENDING/REJECTED ones so they can track what they
    submitted, and Admin sees everything. Any signed-in user can submit a
    post, but only Admin can move it out of PENDING (see `status` action).
    """
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'ADMIN':
            return BlogPost.objects.all()
        if user.is_authenticated:
            return BlogPost.objects.filter(Q(status=BlogPost.Status.PUBLISHED) | Q(author=user))
        return BlogPost.objects.filter(status=BlogPost.Status.PUBLISHED)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        # An author can edit their own post's title/body; an admin can edit
        # any post. Nobody else reaches this - get_queryset already hides
        # posts a non-owner, non-admin request has no business touching.
        post = serializer.instance
        if self.request.user != post.author and self.request.user.role != 'ADMIN':
            raise PermissionDenied("You can only edit your own posts.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != instance.author and self.request.user.role != 'ADMIN':
            raise PermissionDenied("You can only delete your own posts.")
        instance.delete()

    @action(detail=True, methods=['patch'], url_path='status', permission_classes=[permissions.IsAuthenticated])
    def set_status(self, request, pk=None):
        """
        PATCH /api/blog-posts/{id}/status/  {"status": "PUBLISHED"}
        ADMIN-only, same shape as the volunteer application status action.
        """
        if not (request.user.is_authenticated and request.user.role == 'ADMIN'):
            raise PermissionDenied("Only an admin can change a post's status.")

        post = self.get_object()
        new_status = request.data.get('status')
        valid = [choice[0] for choice in BlogPost.Status.choices]
        if new_status not in valid:
            return Response(
                {'status': [f"Must be one of: {', '.join(valid)}."]},
                status=http_status.HTTP_400_BAD_REQUEST,
            )
        post.status = new_status
        post.save(update_fields=['status'])
        return Response(self.get_serializer(post).data)


class SymptomLogViewSet(viewsets.ModelViewSet):
    """
    A user can only ever see/create/edit THEIR OWN symptom logs.
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
    Read: a user sees only their own reminder; an admin sees all.
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
    """A user can create + view their own applications. Admin sees all (future: separate admin endpoint)."""
    serializer_class = VolunteerApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return VolunteerApplication.objects.all()
        return VolunteerApplication.objects.filter(volunteer=user)

    def perform_create(self, serializer):
        # Enforced server-side: an Admin account cannot file a volunteer
        # application, no matter what the client sends.
        if self.request.user.role == 'ADMIN':
            raise PermissionDenied(
                "Admin accounts cannot submit a volunteer application."
            )
        serializer.save(volunteer=self.request.user)

    @action(detail=True, methods=['patch'], url_path='status')
    def set_status(self, request, pk=None):
        """
        PATCH /api/volunteer-applications/{id}/status/  {"status": "APPROVED"}
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

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def stats(self, request):
        """
        GET /api/volunteer-applications/stats/ - public, real counts for the
        Get Involved page header. Never a made-up round number.
        """
        engaged = VolunteerApplication.objects.exclude(status=VolunteerApplication.Status.REJECTED)
        return Response({
            'volunteer_count': engaged.values('volunteer').distinct().count(),
            'county_count': engaged.exclude(county='').values('county').distinct().count(),
        })


class DonationRecordViewSet(viewsets.ModelViewSet):
    """
    Simulated donations. Donating does not require an account (like
    contributing to a real Kenyan fundraiser on M-Changa doesn't require the
    contributor to have one) - only listing your own history does.
    """
    serializer_class = DonationRecordSerializer

    def get_permissions(self):
        if self.action in ('create', 'leaderboard'):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return DonationRecord.objects.all()
        return DonationRecord.objects.filter(donor=user)

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(donor=user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def leaderboard(self, request):
        """
        GET /api/donations/leaderboard/ - public top 10 by amount. Anonymous
        donors are included (their amount still counts toward the public
        total) but donor_display comes back null, same as everywhere else.
        """
        top = DonationRecord.objects.order_by('-amount_kes')[:10]
        return Response(self.get_serializer(top, many=True).data)


class EventViewSet(viewsets.ModelViewSet):
    """Cervical cancer awareness events. Public read, ADMIN-only write - same as FAQs/myths/articles."""
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAdminRoleOrReadOnly]

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_rsvp(self, request, pk=None):
        """
        POST /api/events/{id}/toggle_rsvp/
        Same pattern as Article's toggle_bookmark: RSVPs the signed-in user
        if they weren't already going, un-RSVPs them if they were.
        """
        if request.user.role == 'ADMIN':
            raise PermissionDenied("Admin accounts cannot RSVP to events.")
        event = self.get_object()
        rsvp = EventRSVP.objects.filter(event=event, user=request.user).first()
        if rsvp:
            rsvp.delete()
            return Response({'is_rsvped': False, 'rsvp_count': event.rsvps.count()})
        EventRSVP.objects.create(event=event, user=request.user)
        return Response({'is_rsvped': True, 'rsvp_count': event.rsvps.count()})
