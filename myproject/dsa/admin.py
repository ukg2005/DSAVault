from django.contrib import admin
from .models import Pattern, Problem, Attempt

# Register your models here.

admin.site.register(Pattern)
admin.site.register(Problem)
admin.site.register(Attempt)