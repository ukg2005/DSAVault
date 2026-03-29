from django.urls import path
from . import views

urlpatterns = [
    path('api/patterns/', views.PatternListView.as_view(), name='pattern_list'),
    path('api/patterns/<int:pattern_pk>/', views.PatternDetailView.as_view(), name='pattern_detail'),
    path('api/patterns/<int:pattern_pk>/problems/', views.ProblemListView.as_view(), name='problem_list'),
    path('api/patterns/<int:pattern_pk>/problems/<int:problem_pk>/', views.ProblemDetailView.as_view(), name='problem_detail'),
    path('api/history/', views.ProblemHistoryView.as_view(), name='problem_history'),
    path('api/patterns/<int:pattern_pk>/problems/<int:problem_pk>/attempts/', views.AttemptListView.as_view(), name='attempts'),
    path('api/patterns/<int:pattern_pk>/problems/<int:problem_pk>/attempts/<int:attempt_pk>/', views.AttemptDetailView.as_view(), name='attempt_detail'),
    path('api/dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('api/check-link/', views.CheckDuplicateLinkView.as_view(), name='check_link'),
]
