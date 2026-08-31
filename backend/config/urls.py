from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include('products.urls')),
    path('api/', include('customers.urls')),
    path('api/', include('billing.urls')),
    path('api/', include('invoices.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/accounts/', include('accounts.urls')),
]


# Serve uploaded media files during development
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )