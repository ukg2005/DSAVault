from rest_framework import serializers
from .models import Pattern, Problem, Attempt


class AttemptSerializer(serializers.ModelSerializer):
    """
    Serializer for the Attempt model.

    `problem` is optional on write because it is injected from the URL kwargs
    in AttemptListView.perform_create. `solved_at` defaults to today when omitted.
    """

    problem = serializers.PrimaryKeyRelatedField(queryset=Problem.objects.all(), required=False)
    solved_at = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = Attempt
        fields = '__all__'


class ProblemSerializer(serializers.ModelSerializer):
    """
    Serializer for the Problem model.

    Nests a read-only `latest_attempt` via AttemptSerializer.
    `pattern` is optional on write because it is injected from the URL kwargs
    in ProblemListView.perform_create.
    """

    latest_attempt = AttemptSerializer(read_only=True)
    reminder = serializers.DateTimeField(required=False, allow_null=True, default=None)
    pattern = serializers.PrimaryKeyRelatedField(queryset=Pattern.objects.all(), required=False)

    class Meta:
        model = Problem
        fields = '__all__'


class PatternSerializer(serializers.ModelSerializer):
    """
    Serializer for the Pattern model.

    Exposes `problems_solved` as a read-only computed integer field.
    """

    problems_solved = serializers.IntegerField(read_only=True)

    class Meta:
        model = Pattern
        fields = '__all__'
