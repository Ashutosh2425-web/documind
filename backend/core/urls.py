from django.urls import path
from . import views
from .auth_views import SignupView, LoginView

urlpatterns = [
    path('hello/', views.hello_api),
    path('upload/', views.UploadDocumentView.as_view()),
    path('query/', views.QueryDocumentView.as_view()),
    path('documents/', views.ListDocumentsView.as_view()),
    path('signup/', SignupView.as_view()),
    path('login/', LoginView.as_view()),
]