import { useEffect, useMemo, useState } from "react";

import {
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  X,
  Printer,
  FileText,
  CalendarDays,
  IndianRupee,
} from "lucide-react";

import api from "../api/axios";


function Invoices() {

  const [invoices, setInvoices] =
    useState([]);

  const [bills, setBills] =
    useState([]);

  const [customers, setCustomers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [selectedInvoice, setSelectedInvoice] =
    useState(null);

  const [editingInvoice, setEditingInvoice] =
    useState(null);

  const [editForm, setEditForm] =
    useState({
      invoice_number: "",
      due_date: "",
      status: "Draft",
      notes: "",
    });


  /* =====================================================
     LOAD INVOICES + BILLS + CUSTOMERS
  ===================================================== */

  const fetchData = async (
    showRefresh = false
  ) => {

    try {

      if (showRefresh) {

        setRefreshing(true);

      } else {

        setLoading(true);

      }

      setError("");
      setMessage("");


      const [
        invoiceResponse,
        billResponse,
        customerResponse,
      ] = await Promise.all([

        api.get("invoices/"),

        api.get("billing/"),

        api.get("customers/"),

      ]);


      setInvoices(

        Array.isArray(
          invoiceResponse.data
        )
          ? invoiceResponse.data
          : []

      );


      setBills(

        Array.isArray(
          billResponse.data
        )
          ? billResponse.data
          : []

      );


      setCustomers(

        Array.isArray(
          customerResponse.data
        )
          ? customerResponse.data
          : []

      );

    } catch (err) {

      console.error(
        "Invoice fetch error:",
        err
      );

      setError(
        "Unable to load invoices from Django backend."
      );

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  };


  useEffect(() => {

    fetchData();

  }, []);


  /* =====================================================
     HELPERS
  ===================================================== */

  const getBill = (
    billId
  ) => {

    return bills.find(
      (bill) =>
        Number(bill.id) ===
        Number(billId)
    );

  };


  const getCustomer = (
    customerId
  ) => {

    return customers.find(
      (customer) =>
        Number(customer.id) ===
        Number(customerId)
    );

  };


  const getAmount = (
    invoice
  ) => {

    const bill =
      getBill(invoice.bill);

    return Number(
      bill?.total_amount || 0
    );

  };


  const getCustomerName = (
    invoice
  ) => {

    const customer =
      getCustomer(invoice.customer);

    return (
      customer?.name ||
      "Unknown Customer"
    );

  };


  const getCustomerPhone = (
    invoice
  ) => {

    const customer =
      getCustomer(invoice.customer);

    return (
      customer?.phone || ""
    );

  };


  const formatAmount = (
    amount
  ) => {

    return `₹${Number(
      amount || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  };


  const formatDate = (
    dateValue
  ) => {

    if (!dateValue) {

      return "-";

    }


    const date =
      new Date(dateValue);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return dateValue;

    }


    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredInvoices =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();


      if (!keyword) {

        return invoices;

      }


      return invoices.filter(
        (invoice) => {

          const customerName =
            getCustomerName(
              invoice
            );


          const invoiceNumber =
            invoice.invoice_number ||
            "";


          const status =
            invoice.status || "";


          return (

            invoiceNumber
              .toLowerCase()
              .includes(keyword)

            ||

            customerName
              .toLowerCase()
              .includes(keyword)

            ||

            status
              .toLowerCase()
              .includes(keyword)

          );

        }
      );

    }, [
      invoices,
      bills,
      customers,
      search,
    ]);


  /* =====================================================
     STATUS CLASS
  ===================================================== */

  const getStatusClass = (
    status
  ) => {

    switch (status) {

      case "Paid":
        return "invoice-status paid";

      case "Sent":
        return "invoice-status sent";

      case "Overdue":
        return "invoice-status overdue";

      case "Draft":
      default:
        return "invoice-status draft";

    }

  };


  /* =====================================================
     VIEW
  ===================================================== */

  const handleView = (
    invoice
  ) => {

    setSelectedInvoice(
      invoice
    );

    setMessage("");
    setError("");

  };


  /* =====================================================
     EDIT
  ===================================================== */

  const handleEdit = (
    invoice
  ) => {

    setEditingInvoice(
      invoice
    );


    setEditForm({

      invoice_number:
        invoice.invoice_number ||
        "",

      due_date:
        invoice.due_date ||
        "",

      status:
        invoice.status ||
        "Draft",

      notes:
        invoice.notes ||
        "",

    });


    setMessage("");
    setError("");

  };


  const handleEditChange = (
    e
  ) => {

    const {
      name,
      value,
    } = e.target;


    setEditForm(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );

  };


  /* =====================================================
     UPDATE
  ===================================================== */

  const updateInvoice = async (
    e
  ) => {

    e.preventDefault();


    if (!editingInvoice) {

      return;

    }


    try {

      setError("");
      setMessage("");


      await api.put(
        `invoices/${editingInvoice.id}/`,
        {

          invoice_number:
            editForm.invoice_number,

          customer:
            Number(
              editingInvoice.customer
            ),

          bill:
            Number(
              editingInvoice.bill
            ),

          due_date:
            editForm.due_date,

          status:
            editForm.status,

          notes:
            editForm.notes,

        }
      );


      setEditingInvoice(
        null
      );


      setMessage(
        "Invoice updated successfully."
      );


      await fetchData();

    } catch (err) {

      console.error(
        "Invoice update error:",
        err
      );

      console.error(
        "Django response:",
        err.response?.data
      );


      setError(
        "Unable to update invoice."
      );

    }

  };


  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = async (
    invoice
  ) => {

    const confirmed =
      window.confirm(
        `Delete invoice ${invoice.invoice_number}?`
      );


    if (!confirmed) {

      return;

    }


    try {

      setError("");
      setMessage("");


      await api.delete(
        `invoices/${invoice.id}/`
      );


      setMessage(
        "Invoice deleted successfully."
      );


      await fetchData(true);

    } catch (err) {

      console.error(
        "Invoice delete error:",
        err
      );


      setError(
        "Unable to delete invoice."
      );

    }

  };


  /* =====================================================
     PRINT SINGLE INVOICE
  ===================================================== */

  const printInvoice = (
    invoice
  ) => {

    const bill =
      getBill(invoice.bill);


    const customer =
      getCustomer(invoice.customer);


    const customerName =
      customer?.name ||
      "Unknown Customer";


    const customerPhone =
      customer?.phone ||
      "";


    const issueDate =
      formatDate(
        invoice.issue_date
      );


    const dueDate =
      formatDate(
        invoice.due_date
      );


    const amount =
      Number(
        bill?.total_amount || 0
      );


    const quantity =
      Number(
        bill?.quantity || 0
      );


    const productName =
      bill?.product
        ? `Product #${bill.product}`
        : "Product";


    const invoiceNumber =
      invoice.invoice_number ||
      "Invoice";


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
            width: 100%;
            max-width: 760px;
            margin: 0 auto;
          }

          .top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;

            padding-bottom: 22px;

            border-bottom:
              2px solid #5f963d;
          }

          .brand {
            font-size: 28px;
            font-weight: 800;
          }

          .brand .green {
            color: #5f963d;
          }

          .tagline {
            margin-top: 5px;

            font-size: 12px;

            color: #7a827b;
          }

          .invoice-title {
            text-align: right;
          }

          .invoice-title h1 {
            margin: 0 0 8px;

            font-size: 24px;
          }

          .invoice-title p {
            margin: 3px 0;

            font-size: 12px;

            color: #6b7280;
          }

          .customer-box {
            margin-top: 25px;

            padding: 16px;

            background: #f5faf3;

            border-radius: 10px;
          }

          .customer-box h3 {
            margin: 0 0 8px;

            font-size: 12px;

            color: #5f963d;
          }

          .customer-box p {
            margin: 4px 0;

            font-size: 13px;
          }

          table {
            width: 100%;

            margin-top: 25px;

            border-collapse: collapse;
          }

          th {
            padding: 12px;

            background: #f0f7ed;

            color: #4f8132;

            font-size: 11px;

            text-align: left;

            text-transform: uppercase;
          }

          td {
            padding: 13px 12px;

            border-bottom:
              1px solid #e5e7eb;

            font-size: 12px;
          }

          .total-box {
            width: 300px;

            margin-left: auto;

            margin-top: 25px;
          }

          .row {
            display: flex;

            justify-content:
              space-between;

            padding: 6px 0;

            font-size: 12px;
          }

          .grand {
            margin-top: 7px;

            padding: 13px;

            border-radius: 9px;

            background: #eaf4e5;

            color: #4f8132;

            font-size: 16px;

            font-weight: 800;
          }

          .footer {
            margin-top: 45px;

            padding-top: 15px;

            border-top:
              1px solid #e5e7eb;

            text-align: center;

            color: #8b948e;

            font-size: 11px;
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


          <div class="top">

            <div>

              <div class="brand">

                Retail
                <span class="green">
                  Flow
                </span>

              </div>


              <div class="tagline">
                Smart retail billing
              </div>

            </div>


            <div class="invoice-title">

              <h1>
                INVOICE
              </h1>

              <p>
                <strong>
                  ${invoiceNumber}
                </strong>
              </p>

              <p>
                Issue Date:
                ${issueDate}
              </p>

              <p>
                Due Date:
                ${dueDate}
              </p>

            </div>

          </div>


          <div class="customer-box">

            <h3>
              CUSTOMER
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
                  Item
                </th>

                <th>
                  Qty
                </th>

                <th>
                  Total
                </th>

              </tr>

            </thead>


            <tbody>

              <tr>

                <td>
                  ${productName}
                </td>

                <td>
                  ${quantity}
                </td>

                <td>
                  ${formatAmount(amount)}
                </td>

              </tr>

            </tbody>

          </table>


          <div class="total-box">

            <div class="row">

              <span>
                Amount
              </span>

              <strong>
                ${formatAmount(amount)}
              </strong>

            </div>


            <div class="row grand">

              <span>
                Total
              </span>

              <strong>
                ${formatAmount(amount)}
              </strong>

            </div>

          </div>


          <div class="footer">

            Thank you for choosing
            RetailFlow.

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
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div className="invoices-loading">

        <div className="invoice-loader"></div>

        <h3>
          Loading Invoices...
        </h3>

        <p>
          Getting invoice data from Django.
        </p>

      </div>

    );

  }


  /* =====================================================
     UI
  ===================================================== */

  return (

    <div className="invoices-page">


      {/* HEADER */}

      <div className="invoices-header">

        <div className="invoices-title">

          <div className="invoices-title-icon">

            <FileText size={28} />

          </div>


          <div>

            <h1>
              Invoices
            </h1>

            <p>
              Manage your business invoices
            </p>

          </div>

        </div>

      </div>


      {/* MESSAGE */}

      {message && (

        <div className="invoice-success">

          ✓ {message}

        </div>

      )}


      {error && (

        <div className="invoice-error">

          ⚠ {error}

        </div>

      )}


      {/* LIST CARD */}

      <section className="invoice-list-card">


        {/* LIST HEADER */}

        <div className="invoice-list-header">

          <div>

            <h2>
              Invoice List
            </h2>

            <p>

              {filteredInvoices.length}
              {" "}
              invoice
              {filteredInvoices.length !== 1
                ? "s"
                : ""}{" "}
              found

            </p>

          </div>


          <div className="invoice-controls">


            {/* SEARCH */}

            <div className="invoice-search">

              <Search size={18} />

              <input
                type="text"
                placeholder="Search invoice or customer..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>


            {/* REFRESH */}

            <button
              className="invoice-refresh"
              onClick={() =>
                fetchData(true)
              }
              disabled={refreshing}
              title="Refresh"
            >

              <RefreshCw
                size={19}
                className={
                  refreshing
                    ? "refresh-spin"
                    : ""
                }
              />

            </button>

          </div>

        </div>


        {/* TABLE */}

        <div className="invoice-table-wrapper">

          <table className="invoice-table">

            <thead>

              <tr>

                <th>
                  Invoice ID
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Date
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredInvoices.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="invoice-empty"
                  >

                    <FileText size={38} />

                    <strong>
                      No invoices found
                    </strong>

                    <span>
                      Generate an invoice from Billing.
                    </span>

                  </td>

                </tr>

              ) : (

                filteredInvoices.map(
                  (invoice) => (

                    <tr
                      key={invoice.id}
                    >


                      {/* INVOICE */}

                      <td>

                        <div className="invoice-number">

                          <span className="invoice-number-icon">

                            <FileText size={17} />

                          </span>


                          <div>

                            <strong>
                              {invoice.invoice_number}
                            </strong>

                            <small>
                              Invoice #{invoice.id}
                            </small>

                          </div>

                        </div>

                      </td>


                      {/* CUSTOMER */}

                      <td>

                        <div className="invoice-customer">

                          <div className="invoice-customer-avatar">

                            {getCustomerName(
                              invoice
                            )

                              .split(" ")

                              .map(
                                (word) =>
                                  word[0]
                              )

                              .join("")

                              .slice(
                                0,
                                2
                              )

                              .toUpperCase()}

                          </div>


                          <span>

                            {getCustomerName(
                              invoice
                            )}

                          </span>

                        </div>

                      </td>


                      {/* AMOUNT */}

                      <td>

                        <div className="invoice-amount">

                          <IndianRupee
                            size={15}
                          />

                          <strong>

                            {Number(
                              getAmount(
                                invoice
                              )
                            ).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}

                          </strong>

                        </div>

                      </td>


                      {/* DATE */}

                      <td>

                        <div className="invoice-date">

                          <CalendarDays
                            size={15}
                          />

                          <span>

                            {formatDate(
                              invoice.issue_date
                            )}

                          </span>

                        </div>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            getStatusClass(
                              invoice.status
                            )
                          }
                        >

                          {invoice.status}

                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="invoice-actions">


                          {/* VIEW */}

                          <button
                            className="invoice-view-btn"
                            onClick={() =>
                              handleView(
                                invoice
                              )
                            }
                            title="View"
                          >

                            <Eye
                              size={17}
                            />

                          </button>


                          {/* EDIT */}

                          <button
                            className="invoice-edit-btn"
                            onClick={() =>
                              handleEdit(
                                invoice
                              )
                            }
                            title="Edit"
                          >

                            <Pencil
                              size={17}
                            />

                          </button>


                          {/* DELETE */}

                          <button
                            className="invoice-delete-btn"
                            onClick={() =>
                              handleDelete(
                                invoice
                              )
                            }
                            title="Delete"
                          >

                            <Trash2
                              size={17}
                            />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )

                )

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* =================================================
          VIEW MODAL
      ================================================= */}

      {selectedInvoice && (

        <div
          className="invoice-modal-overlay"
          onClick={() =>
            setSelectedInvoice(
              null
            )
          }
        >

          <div
            className="invoice-view-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            <div className="invoice-modal-header">

              <div>

                <h2>
                  {selectedInvoice.invoice_number}
                </h2>

                <p>
                  Invoice Details
                </p>

              </div>


              <button
                className="invoice-modal-close"
                onClick={() =>
                  setSelectedInvoice(
                    null
                  )
                }
              >

                <X size={20} />

              </button>

            </div>


            <div className="invoice-detail-grid">


              <div className="invoice-detail-item">

                <span>
                  Customer
                </span>

                <strong>

                  {getCustomerName(
                    selectedInvoice
                  )}

                </strong>

              </div>


              <div className="invoice-detail-item">

                <span>
                  Amount
                </span>

                <strong>

                  {formatAmount(
                    getAmount(
                      selectedInvoice
                    )
                  )}

                </strong>

              </div>


              <div className="invoice-detail-item">

                <span>
                  Issue Date
                </span>

                <strong>

                  {formatDate(
                    selectedInvoice.issue_date
                  )}

                </strong>

              </div>


              <div className="invoice-detail-item">

                <span>
                  Due Date
                </span>

                <strong>

                  {formatDate(
                    selectedInvoice.due_date
                  )}

                </strong>

              </div>


              <div className="invoice-detail-item">

                <span>
                  Status
                </span>

                <strong>

                  <span
                    className={
                      getStatusClass(
                        selectedInvoice.status
                      )
                    }
                  >
                    {selectedInvoice.status}
                  </span>

                </strong>

              </div>


              <div className="invoice-detail-item">

                <span>
                  Customer Phone
                </span>

                <strong>

                  {getCustomerPhone(
                    selectedInvoice
                  ) || "-"}

                </strong>

              </div>

            </div>


            {selectedInvoice.notes && (

              <div className="invoice-notes">

                <span>
                  Notes
                </span>

                <p>
                  {selectedInvoice.notes}
                </p>

              </div>

            )}


            <div className="invoice-modal-actions">


              <button
                className="invoice-print-action"
                onClick={() =>
                  printInvoice(
                    selectedInvoice
                  )
                }
              >

                <Printer size={17} />

                Print Invoice

              </button>


              <button
                className="invoice-close-action"
                onClick={() =>
                  setSelectedInvoice(
                    null
                  )
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          EDIT MODAL
      ================================================= */}

      {editingInvoice && (

        <div
          className="invoice-modal-overlay"
          onClick={() =>
            setEditingInvoice(
              null
            )
          }
        >

          <div
            className="invoice-edit-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            <div className="invoice-modal-header">

              <div>

                <h2>
                  Edit Invoice
                </h2>

                <p>
                  Update invoice information
                </p>

              </div>


              <button
                className="invoice-modal-close"
                onClick={() =>
                  setEditingInvoice(
                    null
                  )
                }
              >

                <X size={20} />

              </button>

            </div>


            <form
              onSubmit={
                updateInvoice
              }
              className="invoice-edit-form"
            >


              {/* INVOICE NUMBER */}

              <div className="invoice-edit-group">

                <label>
                  Invoice Number
                </label>

                <input
                  type="text"
                  name="invoice_number"
                  value={
                    editForm.invoice_number
                  }
                  onChange={
                    handleEditChange
                  }
                  required
                />

              </div>


              {/* DUE DATE */}

              <div className="invoice-edit-group">

                <label>
                  Due Date
                </label>

                <input
                  type="date"
                  name="due_date"
                  value={
                    editForm.due_date
                  }
                  onChange={
                    handleEditChange
                  }
                  required
                />

              </div>


              {/* STATUS */}

              <div className="invoice-edit-group">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={
                    editForm.status
                  }
                  onChange={
                    handleEditChange
                  }
                >

                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Sent">
                    Sent
                  </option>

                  <option value="Paid">
                    Paid
                  </option>

                  <option value="Overdue">
                    Overdue
                  </option>

                </select>

              </div>


              {/* NOTES */}

              <div className="invoice-edit-group">

                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={
                    editForm.notes
                  }
                  onChange={
                    handleEditChange
                  }
                  rows="4"
                  placeholder="Invoice notes..."
                />

              </div>


              {/* ACTIONS */}

              <div className="invoice-edit-actions">

                <button
                  type="button"
                  className="invoice-close-action"
                  onClick={() =>
                    setEditingInvoice(
                      null
                    )
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="invoice-save-action"
                >
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}


export default Invoices;