from django.db import models


class StoreSettings(models.Model):

    shop_name = models.CharField(
        max_length=150,
        default="Retail Shop"
    )

    owner_name = models.CharField(
        max_length=150,
        blank=True
    )

    phone = models.CharField(
        max_length=20,
        blank=True
    )

    email = models.EmailField(
        blank=True
    )

    address = models.TextField(
        blank=True
    )

    gst_number = models.CharField(
        max_length=30,
        blank=True
    )

    default_gst = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5
    )

    invoice_prefix = models.CharField(
        max_length=20,
        default="INV"
    )

    # Invoice template
    invoice_template = models.CharField(
        max_length=30,
        choices=[
            ("classic", "Classic Template"),
            ("modern", "Modern Template"),
        ],
        default="classic"
    )

    # Logo upload
    logo = models.ImageField(
        upload_to="store_logos/",
        blank=True,
        null=True
    )

    # Voice billing
    voice_billing = models.BooleanField(
        default=False
    )

    # Auto save
    auto_save_invoices = models.BooleanField(
        default=True
    )

    # Theme
    appearance = models.CharField(
        max_length=20,
        choices=[
            ("light", "Light"),
            ("dark", "Dark"),
            ("system", "System"),
        ],
        default="light"
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.shop_name