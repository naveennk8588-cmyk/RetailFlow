from django.db import models
from customers.models import Customer
from products.models import Product


class Bill(models.Model):

    PAYMENT_STATUS = [
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Cancelled', 'Cancelled'),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='bills'
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='bills'
    )

    quantity = models.PositiveIntegerField()
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default='Pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bill #{self.id} - {self.customer.name}"