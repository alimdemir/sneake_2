from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/save-score/', views.save_score, name='save_score'),
    path('api/high-scores/', views.get_high_scores, name='get_high_scores'),
] 