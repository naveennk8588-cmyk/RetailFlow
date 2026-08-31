from django.db import models
from customers.models import Customer
from billing.models import Bill


class Invoice(models.Model):

    invoice_number = models.CharField(
        max_length=50,
        unique=True
    )

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='invoices'
    )

    bill = models.OneToOneField(
        Bill,
        on_delete=models.CASCADE,
        related_name='invoice'
    )

    issue_date = models.DateField(
        auto_now_add=True
    )

    due_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=[
            ('Draft', 'Draft'),
            ('Sent', 'Sent'),
            ('Paid', 'Paid'),
            ('Overdue', 'Overdue'),
        ],
        default='Draft'
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.invoice_number