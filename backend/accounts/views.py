from django.contrib.auth.models import User

from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import StoreSettings
from .serializers import (
    RegisterSerializer,
    StoreSettingsSerializer,
)


# ==========================================
# REGISTER API
# ==========================================

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# ==========================================
# STORE SETTINGS API
# ==========================================

class StoreSettingsView(APIView):

    permission_classes = [AllowAny]

    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

    def get_settings(self):

        settings, created = StoreSettings.objects.get_or_create(
            id=1,
            defaults={
                "shop_name": "Retail Shop",
                "owner_name": "",
                "phone": "",
                "email": "",
                "address": "",
                "gst_number": "",
                "default_gst": 5,
                "invoice_prefix": "INV",
                "invoice_template": "classic",
                "voice_billing": False,
                "auto_save_invoices": True,
                "appearance": "light",
            },
        )

        return settings

    # ======================================
    # GET
    # ======================================

    def get(self, request):

        settings = self.get_settings()

        serializer = StoreSettingsSerializer(
            settings,
            context={"request": request}
        )

        return Response(serializer.data)

    # ======================================
    # PUT
    # ======================================

    def put(self, request):

        settings = self.get_settings()

        serializer = StoreSettingsSerializer(
            settings,
            data=request.data,
            partial=True,
            context={"request": request}
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================
    # PATCH
    # ======================================

    def patch(self, request):

        settings = self.get_settings()

        serializer = StoreSettingsSerializer(
            settings,
            data=request.data,
            partial=True,
            context={"request": request}
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )