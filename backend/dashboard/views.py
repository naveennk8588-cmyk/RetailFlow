from datetime import timedelta

from django.utils import timezone
from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.response import Response

from products.models import Product
from customers.models import Customer
from billing.models import Bill
from invoices.models import Invoice


class DashboardView(APIView):

    def get(self, request):

        # ==========================================
        # BASIC COUNTS
        # ==========================================

        total_products = Product.objects.count()
        total_customers = Customer.objects.count()
        total_bills = Bill.objects.count()
        total_invoices = Invoice.objects.count()


        # ==========================================
        # TODAY'S SALES
        # ==========================================

        today = timezone.localdate()

        today_sales = (
            Bill.objects
            .filter(
                created_at__date=today,
                payment_status="Paid"
            )
            .aggregate(total=Sum("total_amount"))["total"]
            or 0
        )


        # ==========================================
        # TOTAL SALES
        # ==========================================

        total_sales = (
            Bill.objects
            .filter(payment_status="Paid")
            .aggregate(total=Sum("total_amount"))["total"]
            or 0
        )


        # ==========================================
        # PENDING PAYMENTS
        # ==========================================

        pending_payments = (
            Bill.objects
            .filter(payment_status="Pending")
            .aggregate(total=Sum("total_amount"))["total"]
            or 0
        )


        # ==========================================
        # WEEKLY REVENUE
        # ==========================================

        # Monday = start of week
        start_of_week = today - timedelta(days=today.weekday())

        weekly_revenue = []

        for i in range(7):

            current_day = start_of_week + timedelta(days=i)

            amount = (
                Bill.objects
                .filter(
                    created_at__date=current_day,
                    payment_status="Paid"
                )
                .aggregate(total=Sum("total_amount"))["total"]
                or 0
            )

            weekly_revenue.append({
                "day": current_day.strftime("%a"),
                "amount": float(amount)
            })


        # ==========================================
        # TOP SELLING PRODUCTS
        # ==========================================

        top_products = (
            Product.objects
            .annotate(
                total_quantity=Sum("bills__quantity")
            )
            .filter(total_quantity__isnull=False)
            .order_by("-total_quantity")[:5]
        )

        top_selling_products = []

        for product in top_products:

            top_selling_products.append({
                "id": product.id,
                "name": product.name,
                "quantity": product.total_quantity
            })


        # ==========================================
        # RESPONSE
        # ==========================================

        return Response({

            "total_products": total_products,

            "total_customers": total_customers,

            "total_bills": total_bills,

            "total_invoices": total_invoices,

            "today_sales": float(today_sales),

            "total_sales": float(total_sales),

            "pending_payments": float(pending_payments),

            "weekly_revenue": weekly_revenue,

            "top_selling_products": top_selling_products,

        })