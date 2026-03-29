from rest_framework import serializers
from .models import Pattern, Problem, Attempt


class PatternSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pattern
        fields = '__all__'


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

    def validate_link(self, value):
        from django.core.exceptions import ValidationError
        request = self.context.get('request')
        # Only check on creation (POST), let updates pass
        if request and request.method == 'POST':
            if Problem.objects.filter(link=value).exists():
                # We can't do a "warning" natively in DRF validation easily without breaking the flow, 
                # but we can return a standard error so frontend can ask "Are you sure?"
                # Wait, the prompt says "warn if you try to log". 
                pass
        return value
