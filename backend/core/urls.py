from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello_api),
    path('upload/', views.UploadDocumentView.as_view()),
    path('query/', views.QueryDocumentView.as_view()),
]