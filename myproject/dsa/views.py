from rest_framework import generics, filters
from .models import Pattern, Problem, Attempt
from .serializers import PatternSerializer, ProblemSerializer, AttemptSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta


class PatternListView(generics.ListCreateAPIView):
    """
    GET  /api/patterns/   - list all patterns
    POST /api/patterns/   - create a new pattern
    """

    serializer_class = PatternSerializer
    queryset = Pattern.objects.all()


class PatternDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/patterns/<pattern_pk>/  - retrieve a single pattern
    PUT    /api/patterns/<pattern_pk>/  - full update
    PATCH  /api/patterns/<pattern_pk>/  - partial update
    DELETE /api/patterns/<pattern_pk>/  - delete
    """

    serializer_class = PatternSerializer
    queryset = Pattern.objects.all()
    lookup_url_kwarg = 'pattern_pk'


class ProblemListView(generics.ListCreateAPIView):
    """
    GET  /api/patterns/<pattern_pk>/problems/  - list problems for a pattern
    POST /api/patterns/<pattern_pk>/problems/  - create a problem under this pattern
    """

    serializer_class = ProblemSerializer

    def get_queryset(self):
        return Problem.objects.filter(pattern_id=self.kwargs['pattern_pk']).order_by('-id')

    def perform_create(self, serializer):
        serializer.save(pattern_id=self.kwargs['pattern_pk'])


class ProblemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/patterns/<pattern_pk>/problems/<problem_pk>/  - retrieve a problem
    PUT    /api/patterns/<pattern_pk>/problems/<problem_pk>/  - full update
    PATCH  /api/patterns/<pattern_pk>/problems/<problem_pk>/  - partial update
    DELETE /api/patterns/<pattern_pk>/problems/<problem_pk>/  - delete
    """

    serializer_class = ProblemSerializer
    queryset = Problem.objects.all()
    lookup_url_kwarg = 'problem_pk'


class AttemptListView(generics.ListCreateAPIView):
    """
    GET  /api/patterns/<pattern_pk>/problems/<problem_pk>/attempts/  - list attempts
    POST /api/patterns/<pattern_pk>/problems/<problem_pk>/attempts/  - record a new attempt
    """

    serializer_class = AttemptSerializer

    def get_queryset(self):
        return Attempt.objects.filter(problem_id=self.kwargs['problem_pk']).order_by('-solved_at')

    def perform_create(self, serializer):
        serializer.save(problem_id=self.kwargs['problem_pk'])


class ProblemHistoryView(generics.ListAPIView):
    """
    GET /api/history/  - list all problems ordered by most recently added
    """

    serializer_class = ProblemSerializer
    queryset = Problem.objects.all().order_by('-id')


class DashboardView(APIView):
    """
    GET /api/dashboard/  - aggregated statistics for the dashboard

    Returns:
        total_problems   - total number of problems tracked
        by_pattern       - problem count and confidence per pattern
        by_difficulty    - problem count grouped by difficulty
        by_status        - attempt count grouped by status
        due_for_revision - problems whose reminder datetime has passed
        recent_attempts  - attempts recorded in the last 7 days
        weak_patterns    - patterns with BLIND or LOW confidence
    """

    def get(self, request):
        total_problems = Problem.objects.all().count()

        by_pattern = Pattern.objects.annotate(
            problem_count=Count('problems')
        ).values('pattern', 'problem_count', 'confidence')

        by_difficulty = Problem.objects.values('difficulty').annotate(
            count=Count('id')
        )

        by_status = Attempt.objects.values('status').annotate(
            count=Count('id')
        )

        due_for_revision = Problem.objects.filter(
            reminder__lte=timezone.now()
        ).values('id', 'problem_name', 'difficulty', 'reminder')

        recent_attempts = Attempt.objects.filter(
            solved_at__gte=timezone.now() - timedelta(days=7)
        ).select_related('problem').values(
            'problem__problem_name', 'status', 'solved_at'
        )

        weak_patterns = Pattern.objects.filter(
            Q(confidence='BLIND') | Q(confidence='LOW')
        ).values('pattern', 'confidence')

        return Response({
            'total_problems': total_problems,
            'by_pattern': list(by_pattern),
            'by_difficulty': list(by_difficulty),
            'by_status': list(by_status),
            'due_for_revision': list(due_for_revision),
            'recent_attempts': list(recent_attempts),
            'weak_patterns': list(weak_patterns),
        })


