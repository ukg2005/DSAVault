from django.db import models
from django.utils import timezone


class Pattern(models.Model):
    """
    Represents a DSA problem-solving pattern (e.g. Sliding Window, Two Pointers).

    Tracks the user's overall confidence level with the pattern and optional notes.
    The computed property `problems_solved` returns the count of distinct problems
    under this pattern that have at least one non-FAILED attempt.
    """

    CONFIDENCE = (
        ('HIGH', 'High'),
        ('MEDIUM', 'Medium'),
        ('LOW', 'Low'),
        ('BLIND', 'Blind')
    )

    pattern = models.CharField(max_length=50)
    confidence = models.CharField(max_length=10, choices=CONFIDENCE)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f'{self.pattern}'

    @property
    def problems_solved(self):
        """Return the count of distinct problems solved (at least one non-FAILED attempt)."""
        return Attempt.objects.filter(problem__pattern=self).exclude(status='FAILED').values('problem').distinct().count()


class Problem(models.Model):
    """
    Represents a single DSA problem linked to a Pattern.

    Stores the problem name, difficulty, an external link (e.g. LeetCode URL),
    an optional spaced-repetition reminder datetime, and free-form notes.
    The computed property `latest_attempt` returns the most recent Attempt for
    this problem.
    """

    DIFFICULTY = (
        ('HARD', 'Hard'),
        ('MEDIUM', 'Medium'),
        ('EASY', 'Easy')
    )

    problem_name = models.CharField(max_length=100)
    pattern = models.ForeignKey(Pattern, on_delete=models.CASCADE, related_name='problems')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY)
    link = models.URLField()
    reminder = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f'{self.problem_name} - {self.difficulty}'

    @property
    def latest_attempt(self):
        """Return the most recently recorded Attempt for this problem, or None."""
        return Attempt.objects.filter(problem=self).order_by('-solved_at').first()


class Attempt(models.Model):
    """
    Records a single attempt at solving a Problem.

    Status choices reflect how independently the problem was solved:
      - OWN: solved completely without help
      - PARTIAL: partial solution reached
      - HINT: needed a hint to complete
      - FAILED: could not solve
    """

    STATUS = (
        ('OWN', 'Own'),
        ('PARTIAL', 'Partial'),
        ('HINT', 'Hint'),
        ('FAILED', 'Failed')
    )

    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='attempts')
    solved_at = models.DateField(default=timezone.localdate, blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        solved_label = self.solved_at.isoformat() if self.solved_at else 'unspecified-date'
        return f'{self.status} on {solved_label}'