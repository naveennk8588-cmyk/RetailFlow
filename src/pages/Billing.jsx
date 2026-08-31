import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";


const API = "http://127.0.0.1:8000/api";


function Billing() {

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [cart, setCart] =
    useState([]);

  const [discount, setDiscount] =
    useState(0);

  const [gst, setGst] =
    useState(5);

  const [paymentStatus, setPaymentStatus] =
    useState("Pending");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [generatedInvoices, setGeneratedInvoices] =
    useState([]);


  /* =====================================================
     LOAD PRODUCTS + CUSTOMERS
  ===================================================== */

  useEffect(() => {

    const loadData = async () => {

      try {

        setLoading(true);
        setError("");

        const [
          productsResponse,
          customersResponse,
        ] = await Promise.all([

          api.get("products/"),

          api.get("customers/"),

        ]);


        setProducts(
          Array.isArray(productsResponse.data)
            ? productsResponse.data
            : []
        );

        setCustomers(
          Array.isArray(customersResponse.data)
            ? customersResponse.data
            : []
        );

      } catch (err) {

        console.error(
          "Billing load error:",
          err
        );

        setError(
          "Unable to load products or customers from Django."
        );

      } finally {

        setLoading(false);

      }

    };


    loadData();

  }, []);


  /* =====================================================
     SEARCH PRODUCTS
  ===================================================== */

  const filteredProducts = useMemo(() => {

    const keyword =
      search
        .trim()
        .toLowerCase();


    if (!keyword) {
      return products;
    }


    return products.filter(
      (product) =>

        product.name
          ?.toLowerCase()
          .includes(keyword)

        ||

        product.category
          ?.toLowerCase()
          .includes(keyword)

    );

  }, [products, search]);


  /* =====================================================
     ADD PRODUCT
  ===================================================== */

  const addProduct = (
    product
  ) => {

    setError("");
    setMessage("");


    const existing =
      cart.find(
        (item) =>
          item.product.id ===
          product.id
      );


    if (
      Number(product.stock) <= 0
    ) {

      setError(
        `${product.name} is out of stock.`
      );

      return;
    }


    if (existing) {

      if (
        existing.quantity >=
        Number(product.stock)
      ) {

        setError(
          `Only ${product.stock} units available for ${product.name}.`
        );

        return;
      }


      setCart((prev) =>

        prev.map((item) => {

          if (
            item.product.id !==
            product.id
          ) {
            return item;
          }


          const quantity =
            item.quantity + 1;


          return {

            ...item,

            quantity,

            total:
              quantity *
              Number(
                product.price
              ),

          };

        })

      );

      return;
    }


    setCart((prev) => [

      ...prev,

      {
        product,

        quantity: 1,

        total:
          Number(product.price),

      },

    ]);

  };


  /* =====================================================
     INCREASE
  ===================================================== */

  const increaseQuantity = (
    productId
  ) => {

    setCart((prev) =>

      prev.map((item) => {

        if (
          item.product.id !==
          productId
        ) {
          return item;
        }


        if (
          item.quantity >=
          Number(
            item.product.stock
          )
        ) {

          setError(
            `Only ${item.product.stock} units available.`
          );

          return item;
        }


        const quantity =
          item.quantity + 1;


        return {

          ...item,

          quantity,

          total:
            quantity *
            Number(
              item.product.price
            ),

        };

      })

    );

  };


  /* =====================================================
     DECREASE
  ===================================================== */

  const decreaseQuantity = (
    productId
  ) => {

    setCart((prev) =>

      prev
        .map((item) => {

          if (
            item.product.id !==
            productId
          ) {
            return item;
          }


          const quantity =
            item.quantity - 1;


          return {

            ...item,

            quantity,

            total:
              quantity *
              Number(
                item.product.price
              ),

          };

        })

        .filter(
          (item) =>
            item.quantity > 0
        )

    );

  };


  /* =====================================================
     REMOVE
  ===================================================== */

  const removeProduct = (
    productId
  ) => {

    setCart((prev) =>
      prev.filter(
        (item) =>
          item.product.id !==
          productId
      )
    );

  };


  /* =====================================================
     CALCULATIONS
  ===================================================== */

  const subtotal = useMemo(() => {

    return cart.reduce(

      (sum, item) =>

        sum +
        Number(
          item.product.price
        ) *
        Number(
          item.quantity
        ),

      0

    );

  }, [cart]);


  const discountAmount =
    useMemo(() => {

      const value =
        Number(discount) || 0;

      return Math.min(
        value,
        subtotal
      );

    }, [
      discount,
      subtotal,
    ]);


  const taxableAmount =
    Math.max(
      subtotal -
      discountAmount,
      0
    );


  const gstAmount =
    useMemo(() => {

      return (
        taxableAmount *
        (Number(gst) || 0)
      ) / 100;

    }, [
      taxableAmount,
      gst,
    ]);


  const grandTotal =
    taxableAmount +
    gstAmount;


  /* =====================================================
     MAP PAYMENT STATUS
  ===================================================== */

  const getInvoiceStatus = () => {

    if (
      paymentStatus ===
      "Paid"
    ) {
      return "Paid";
    }


    if (
      paymentStatus ===
      "Cancelled"
    ) {
      return "Draft";
    }


    return "Sent";
  };


  /* =====================================================
     GENERATE INVOICE NUMBER
  ===================================================== */

  const createInvoiceNumber = (
    index
  ) => {

    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        "0"
      );

    const day =
      String(
        now.getDate()
      ).padStart(
        2,
        "0"
      );

    const time =
      String(
        now.getTime()
      ).slice(-6);


    return `INV-${year}${month}${day}-${time}-${index + 1}`;

  };


  /* =====================================================
     DUE DATE
  ===================================================== */

  const getDueDate = () => {

    const date =
      new Date();

    date.setDate(
      date.getDate() + 7
    );

    return date
      .toISOString()
      .split("T")[0];

  };


  /* =====================================================
     SAVE BILLS
  ===================================================== */

  const saveBills = async () => {

    if (!selectedCustomer) {

      throw new Error(
        "Please select a customer."
      );

    }


    if (cart.length === 0) {

      throw new Error(
        "Please add at least one product."
      );

    }


    const createdBills = [];


    for (
      const item of cart
    ) {

      const response =
        await api.post(
          "billing/",
          {

            customer:
              Number(
                selectedCustomer
              ),

            product:
              Number(
                item.product.id
              ),

            quantity:
              Number(
                item.quantity
              ),

            total_amount:
              Number(
                item.total
              ),

            payment_status:
              paymentStatus,

          }
        );


      createdBills.push(
        response.data
      );

    }


    return createdBills;

  };


  /* =====================================================
     GENERATE INVOICE
  ===================================================== */

  const generateInvoice =
    async () => {

      setMessage("");
      setError("");


      if (!selectedCustomer) {

        setError(
          "Please select a customer."
        );

        return;
      }


      if (cart.length === 0) {

        setError(
          "Please add at least one product."
        );

        return;
      }


      try {

        setSaving(true);


        /* CREATE BILLS */

        const bills =
          await saveBills();


        const invoiceResults =
          [];


        /* CREATE INVOICES */

        for (
          let i = 0;
          i < bills.length;
          i++
        ) {

          const bill =
            bills[i];


          const invoiceData = {

            invoice_number:
              createInvoiceNumber(i),

            customer:
              Number(
                selectedCustomer
              ),

            bill:
              Number(
                bill.id
              ),

            due_date:
              getDueDate(),

            status:
              getInvoiceStatus(),

            notes:
              "Generated from RetailFlow Billing.",

          };


          const response =
            await api.post(
              "invoices/",
              invoiceData
            );


          invoiceResults.push(
            response.data
          );

        }


        setGeneratedInvoices(
          invoiceResults
        );


        setMessage(
          `${invoiceResults.length} invoice${
            invoiceResults.length > 1
              ? "s"
              : ""
          } generated successfully.`
        );


      } catch (err) {

        console.error(
          "Generate invoice error:",
          err
        );

        console.error(
          "Django response:",
          err.response?.data
        );


        setError(
          "Unable to generate invoice. Check Django backend."
        );

      } finally {

        setSaving(false);

      }

    };


  /* =====================================================
     SAVE BILL ONLY
  ===================================================== */

  const saveBillOnly =
    async () => {

      setMessage("");
      setError("");


      if (!selectedCustomer) {

        setError(
          "Please select a customer."
        );

        return;
      }


      if (cart.length === 0) {

        setError(
          "Please add at least one product."
        );

        return;
      }


      try {

        setSaving(true);


        await saveBills();


        setMessage(
          "Bill saved successfully."
        );


        setCart([]);

        setSelectedCustomer("");

        setDiscount(0);

        setGeneratedInvoices([]);


      } catch (err) {

        console.error(
          "Save bill error:",
          err
        );


        setError(
          "Unable to save bill."
        );

      } finally {

        setSaving(false);

      }

    };


  /* =====================================================
     PRINT INVOICE
  ===================================================== */

  const printInvoice = () => {

    setError("");


    if (
      cart.length === 0
    ) {

      setError(
        "Add products before printing."
      );

      return;
    }


    const customer =
      customers.find(
        (item) =>
          Number(item.id) ===
          Number(
            selectedCustomer
          )
      );


    const customerName =
      customer?.name ||
      "Walk-in Customer";


    const customerPhone =
      customer?.phone || "";


    const invoiceNumber =
      generatedInvoices[0]
        ?.invoice_number ||
      createInvoiceNumber(0);


    const invoiceDate =
      new Date()
        .toLocaleDateString(
          "en-IN"
        );


    const dueDate =
      getDueDate();


    const itemRows =
      cart
        .map(
          (item) => `

            <tr>

              <td>
                ${item.product.name}
              </td>

              <td>
                ${item.quantity}
              </td>

              <td>
                ₹${Number(
                  item.product.price
                ).toFixed(2)}
              </td>

              <td>
                ₹${Number(
                  item.total
                ).toFixed(2)}
              </td>

            </tr>

          `
        )
        .join("");


    const printWindow =
      window.open(
        "",
        "_blank",
        "width=850,height=900"
      );


    if (!printWindow) {

      setError(
        "Popup blocked. Please allow popups to print."
      );

      return;
    }


    printWindow.document.write(`

      <!DOCTYPE html>

      <html>

      <head>

        <title>
          ${invoiceNumber}
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 35px;

            font-family:
              Arial,
              Helvetica,
              sans-serif;

            color: #17211b;

            background: #ffffff;
          }

          .invoice {
            max-width: 760px;

            margin: 0 auto;
          }

          .header {
            display: flex;

            justify-content:
              space-between;

            align-items:
              flex-start;

            padding-bottom: 25px;

            border-bottom:
              2px solid #16a34a;
          }

          .brand {
            font-size: 28px;

            font-weight: 800;
          }

          .brand span {
            color: #16a34a;
          }

          .small {
            margin-top: 5px;

            color: #6b7280;

            font-size: 12px;
          }

          .invoice-meta {
            text-align: right;

            font-size: 12px;

            line-height: 1.8;
          }

          .invoice-meta strong {
            font-size: 16px;
          }

          .customer {
            margin-top: 28px;

            padding: 16px;

            background: #f7f9f8;

            border-radius: 10px;
          }

          .customer h3 {
            margin: 0 0 8px;

            font-size: 13px;
          }

          .customer p {
            margin: 3px 0;

            font-size: 12px;
          }

          table {
            width: 100%;

            margin-top: 25px;

            border-collapse:
              collapse;
          }

          th {
            background:
              #f0fdf4;

            color:
              #166534;

            font-size: 11px;

            text-transform:
              uppercase;

            text-align: left;

            padding: 12px;
          }

          td {
            padding: 12px;

            font-size: 12px;

            border-bottom:
              1px solid #e5e7eb;
          }

          .totals {
            width: 310px;

            margin-left: auto;

            margin-top: 25px;
          }

          .total-row {
            display: flex;

            justify-content:
              space-between;

            padding: 7px 0;

            font-size: 12px;
          }

          .grand {
            margin-top: 8px;

            padding: 13px;

            border-radius: 8px;

            background: #ecfdf5;

            color: #166534;

            font-size: 17px;

            font-weight: 800;
          }

          .footer {
            margin-top: 45px;

            padding-top: 15px;

            border-top:
              1px solid #e5e7eb;

            color: #6b7280;

            font-size: 11px;

            text-align: center;
          }

          @media print {

            body {
              padding: 0;
            }

          }

        </style>

      </head>


      <body>

        <div class="invoice">


          <div class="header">

            <div>

              <div class="brand">

                Retail
                <span>
                  Flow
                </span>

              </div>


              <div class="small">

                Smart retail billing

              </div>

            </div>


            <div class="invoice-meta">

              <strong>
                ${invoiceNumber}
              </strong>

              <br />

              Issue Date:
              ${invoiceDate}

              <br />

              Due Date:
              ${dueDate}

            </div>

          </div>


          <div class="customer">

            <h3>
              BILL TO
            </h3>

            <p>

              <strong>
                ${customerName}
              </strong>

            </p>

            <p>
              ${customerPhone}
            </p>

          </div>


          <table>

            <thead>

              <tr>

                <th>
                  Product
                </th>

                <th>
                  Qty
                </th>

                <th>
                  Price
                </th>

                <th>
                  Total
                </th>

              </tr>

            </thead>


            <tbody>

              ${itemRows}

            </tbody>

          </table>


          <div class="totals">

            <div class="total-row">

              <span>
                Subtotal
              </span>

              <strong>
                ₹${subtotal.toFixed(2)}
              </strong>

            </div>


            <div class="total-row">

              <span>
                Discount
              </span>

              <strong>
                − ₹${discountAmount.toFixed(2)}
              </strong>

            </div>


            <div class="total-row">

              <span>
                GST (${Number(gst) || 0}%)
              </span>

              <strong>
                ₹${gstAmount.toFixed(2)}
              </strong>

            </div>


            <div class="total-row grand">

              <span>
                Grand Total
              </span>

              <strong>
                ₹${grandTotal.toFixed(2)}
              </strong>

            </div>

          </div>


          <div class="footer">

            Thank you for shopping with
            RetailFlow

          </div>


        </div>

      </body>

      </html>

    `);


    printWindow.document.close();

    printWindow.focus();


    setTimeout(() => {

      printWindow.print();

    }, 300);

  };


  /* =====================================================
     CLEAR BILL
  ===================================================== */

  const clearBill = () => {

    setCart([]);

    setSelectedCustomer("");

    setSearch("");

    setDiscount(0);

    setGst(5);

    setPaymentStatus(
      "Pending"
    );

    setMessage("");

    setError("");

    setGeneratedInvoices([]);

  };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div className="billing-loading">

        <div className="billing-loader"></div>

        <h3>
          Loading Billing...
        </h3>

        <p>
          Getting products and customers from Django.
        </p>

      </div>

    );

  }


  /* =====================================================
     UI
  ===================================================== */

  return (

    <div className="billing-page">


      {/* HEADER */}

      <div className="billing-header">

        <div>

          <h1>
            Billing
          </h1>

          <p>
            Create new bills quickly and easily
          </p>

        </div>


        <div className="billing-header-actions">

          <button
            className="billing-clear-btn"
            onClick={clearBill}
          >
            Clear
          </button>


          <button
            className="billing-print-btn"
            onClick={printInvoice}
          >
            Print Invoice
          </button>

        </div>

      </div>


      {/* MESSAGES */}

      {message && (

        <div className="billing-success">

          ✓ {message}

        </div>

      )}


      {error && (

        <div className="billing-error">

          ⚠ {error}

        </div>

      )}


      {/* MAIN */}

      <div className="billing-layout">


        {/* =================================================
            PRODUCTS
        ================================================= */}

        <div className="billing-products-card">


          <div className="billing-card-title">

            <div>

              <h2>
                Available Products
              </h2>

              <p>
                Select products from your inventory
              </p>

            </div>


            <span className="product-count">
              {products.length}
            </span>

          </div>


          {/* SEARCH */}

          <div className="billing-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search product name or category..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>


          {/* PRODUCTS */}

          <div className="billing-product-list">

            {filteredProducts.length ===
            0 ? (

              <div className="billing-empty">

                <div>
                  📦
                </div>

                <h3>
                  No products found
                </h3>

                <p>
                  Add products from Products page.
                </p>

              </div>

            ) : (

              filteredProducts.map(
                (product) => (

                  <div
                    className="billing-product-item"
                    key={product.id}
                  >


                    <div className="billing-product-image">

                      {product.image ? (

                        <img
                          src={product.image}
                          alt={product.name}
                        />

                      ) : (

                        <span>
                          📦
                        </span>

                      )}

                    </div>


                    <div className="billing-product-info">

                      <h3>
                        {product.name}
                      </h3>

                      <p>
                        {product.category}
                      </p>

                      <span>
                        Stock: {product.stock}
                      </span>

                    </div>


                    <div className="billing-product-right">

                      <strong>
                        ₹
                        {Number(
                          product.price
                        ).toFixed(2)}
                      </strong>


                      <button
                        onClick={() =>
                          addProduct(product)
                        }
                        disabled={
                          Number(
                            product.stock
                          ) <= 0
                        }
                      >

                        {Number(
                          product.stock
                        ) <= 0
                          ? "Out"
                          : "Add"}

                      </button>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>


        {/* =================================================
            BILL SUMMARY
        ================================================= */}

        <div className="billing-summary-card">


          <div className="billing-card-title">

            <div>

              <h2>
                New Invoice
              </h2>

              <p>
                Review your billing details
              </p>

            </div>


            <span className="bill-icon">
              ₹
            </span>

          </div>


          {/* CUSTOMER */}

          <div className="billing-form-group">

            <label>
              Customer
            </label>

            <select
              value={selectedCustomer}
              onChange={(e) =>
                setSelectedCustomer(
                  e.target.value
                )
              }
            >

              <option value="">
                Select customer
              </option>


              {customers.map(
                (customer) => (

                  <option
                    key={customer.id}
                    value={customer.id}
                  >

                    {customer.name}

                    {customer.phone
                      ? ` - ${customer.phone}`
                      : ""}

                  </option>

                )
              )}

            </select>

          </div>


          {/* PAYMENT */}

          <div className="billing-form-group">

            <label>
              Payment Status
            </label>

            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(
                  e.target.value
                )
              }
            >

              <option value="Pending">
                Pending
              </option>

              <option value="Paid">
                Paid
              </option>

              <option value="Cancelled">
                Cancelled
              </option>

            </select>

          </div>


          {/* ITEMS */}

          <div className="billing-items-section">

            <div className="billing-items-header">

              <h3>
                Invoice Items
              </h3>

              <span>
                {cart.length} items
              </span>

            </div>


            {cart.length === 0 ? (

              <div className="billing-cart-empty">

                <div className="cart-empty-icon">
                  🛒
                </div>

                <h3>
                  No items added
                </h3>

                <p>
                  Select products from the left.
                </p>

              </div>

            ) : (

              <div className="billing-cart-list">

                {cart.map(
                  (item) => (

                    <div
                      className="billing-cart-item"
                      key={item.product.id}
                    >


                      <div className="cart-item-info">

                        <h4>
                          {item.product.name}
                        </h4>

                        <span>
                          ₹
                          {Number(
                            item.product.price
                          ).toFixed(2)}
                        </span>

                      </div>


                      <div className="cart-item-controls">

                        <button
                          onClick={() =>
                            decreaseQuantity(
                              item.product.id
                            )
                          }
                        >
                          −
                        </button>


                        <strong>
                          {item.quantity}
                        </strong>


                        <button
                          onClick={() =>
                            increaseQuantity(
                              item.product.id
                            )
                          }
                        >
                          +
                        </button>

                      </div>


                      <div className="cart-item-total">

                        <strong>
                          ₹
                          {Number(
                            item.total
                          ).toFixed(2)}
                        </strong>


                        <button
                          className="cart-delete-btn"
                          onClick={() =>
                            removeProduct(
                              item.product.id
                            )
                          }
                        >
                          🗑
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* DISCOUNT / GST */}

          <div className="billing-adjustments">


            <div className="billing-form-group">

              <label>
                Discount
              </label>

              <div className="billing-input-with-symbol">

                <span>
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>


            <div className="billing-form-group">

              <label>
                GST %
              </label>

              <div className="billing-input-with-symbol">

                <input
                  type="number"
                  min="0"
                  value={gst}
                  onChange={(e) =>
                    setGst(
                      e.target.value
                    )
                  }
                />

                <span>
                  %
                </span>

              </div>

            </div>

          </div>


          {/* TOTAL */}

          <div className="billing-total-section">

            <div>

              <span>
                Subtotal
              </span>

              <strong>
                ₹{subtotal.toFixed(2)}
              </strong>

            </div>


            <div>

              <span>
                Discount
              </span>

              <strong className="discount-value">

                − ₹
                {discountAmount.toFixed(2)}

              </strong>

            </div>


            <div>

              <span>
                GST ({Number(gst) || 0}%)
              </span>

              <strong>
                ₹{gstAmount.toFixed(2)}
              </strong>

            </div>


            <div className="billing-grand-total">

              <span>
                Grand Total
              </span>

              <strong>
                ₹{grandTotal.toFixed(2)}
              </strong>

            </div>

          </div>


          {/* ACTIONS */}

          <div className="billing-action-buttons">


            <button
              className="billing-save-btn secondary"
              onClick={saveBillOnly}
              disabled={
                saving ||
                cart.length === 0
              }
            >

              {saving
                ? "Saving..."
                : "Save Bill"}

            </button>


            <button
              className="billing-save-btn"
              onClick={generateInvoice}
              disabled={
                saving ||
                cart.length === 0
              }
            >

              {saving
                ? "Generating..."
                : "Generate Invoice"}

            </button>

          </div>


          {/* GENERATED */}

          {generatedInvoices.length >
            0 && (

            <div className="generated-invoice-box">

              <strong>
                Invoice Generated
              </strong>


              {generatedInvoices.map(
                (invoice) => (

                  <span
                    key={invoice.id}
                  >
                    {invoice.invoice_number}
                  </span>

                )
              )}


              <button
                onClick={
                  printInvoice
                }
              >
                Print Invoice
              </button>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}


export default Billing;