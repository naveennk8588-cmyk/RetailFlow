import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import api from "../api/axios";

import "./Customers.css";


function Customers() {

  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    total_purchases: 0,
  });


  /* =====================================================
     GET CUSTOMERS
  ===================================================== */

  const fetchCustomers = async () => {

    try {

      setLoading(true);

      const response =
        await api.get("customers/");

      const data = response.data;

      setCustomers(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Customer fetch error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchCustomers();

  }, []);


  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredCustomers = useMemo(() => {

    return customers.filter(
      (customer) => {

        const value =
          search
            .toLowerCase()
            .trim();

        return (

          customer.name
            ?.toLowerCase()
            .includes(value)

          ||

          customer.email
            ?.toLowerCase()
            .includes(value)

          ||

          customer.phone
            ?.toLowerCase()
            .includes(value)

          ||

          customer.city
            ?.toLowerCase()
            .includes(value)

        );

      }
    );

  }, [customers, search]);


  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  /* =====================================================
     OPEN ADD
  ===================================================== */

  const handleAddCustomer = () => {

    setEditingCustomer(null);

    setForm({

      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      total_purchases: 0,

    });

    setShowModal(true);

  };


  /* =====================================================
     OPEN EDIT
  ===================================================== */

  const handleEdit = (
    customer
  ) => {

    setEditingCustomer(
      customer
    );

    setForm({

      name:
        customer.name || "",

      email:
        customer.email || "",

      phone:
        customer.phone || "",

      address:
        customer.address || "",

      city:
        customer.city || "",

      total_purchases:
        customer.total_purchases ||
        0,

    });

    setShowModal(true);

  };


  /* =====================================================
     SAVE CUSTOMER
  ===================================================== */

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    try {

      const data = {

        name:
          form.name,

        email:
          form.email,

        phone:
          form.phone,

        address:
          form.address,

        city:
          form.city,

        total_purchases:
          Number(
            form.total_purchases
          ) || 0,

      };


      if (editingCustomer) {

        await api.put(
          `customers/${editingCustomer.id}/`,
          data
        );

        alert(
          "Customer updated successfully!"
        );

      } else {

        await api.post(
          "customers/",
          data
        );

        alert(
          "Customer added successfully!"
        );

      }


      setShowModal(false);

      setEditingCustomer(null);

      await fetchCustomers();

    } catch (error) {

      console.error(
        "Save customer error:",
        error
      );

      console.error(
        "Django response:",
        error.response?.data
      );

      alert(
        "Customer save panna mudiyala. Details check pannunga."
      );

    }

  };


  /* =====================================================
     DELETE CUSTOMER
  ===================================================== */

  const handleDelete = async (
    id
  ) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this customer?"
      );

    if (!confirmDelete) {
      return;
    }


    try {

      await api.delete(
        `customers/${id}/`
      );

      alert(
        "Customer deleted successfully!"
      );

      await fetchCustomers();

    } catch (error) {

      console.error(
        "Delete customer error:",
        error
      );

      alert(
        "Customer delete panna mudiyala."
      );

    }

  };


  /* =====================================================
     FORMAT MONEY
  ===================================================== */

  const formatMoney = (
    amount
  ) => {

    return `₹${Number(
      amount || 0
    ).toLocaleString(
      "en-IN"
    )}`;

  };


  /* =====================================================
     UI
  ===================================================== */

  return (

    <div className="customers-page">


      {/* =================================================
          TABLE ALIGNMENT
      ================================================= */}

      <style>{`

        .customers-page .customer-table-wrapper {
          width: 100%;
          overflow: hidden;
        }

        .customers-page .customer-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
        }

        .customers-page .customer-table
        .customer-col-name {
          width: 26%;
          text-align: left;
        }

        .customers-page .customer-table
        .customer-col-phone {
          width: 18%;
          text-align: left;
          padding-left: 14px;
        }

        .customers-page .customer-table
        .customer-col-email {
          width: 22%;
          text-align: left;
          padding-left: 14px;
        }

        .customers-page .customer-table
        .customer-col-purchase {
          width: 19%;
          text-align: center;
          padding: 0 14px;
          white-space: normal;
        }

        .customers-page .customer-table
        .customer-col-actions {
          width: 15%;
          text-align: center;
          padding: 0 12px;
        }

        .customers-page .customer-table th {
          white-space: normal;
        }

        .customers-page .customer-table td {
          vertical-align: middle;
        }

        .customers-page
        .customer-col-purchase
        .purchase-amount {
          display: inline-block;
          min-width: 70px;
          text-align: center;
          font-weight: 600;
        }

        .customers-page
        .customer-col-actions
        .customer-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 0;
        }

      `}</style>


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="customers-header">

        <div className="customers-title-section">

          <div className="customers-title-icon">

            <Users
              size={28}
              strokeWidth={2}
            />

          </div>


          <div>

            <h1>
              Customers
            </h1>

            <p>
              Manage your customers and their information
            </p>

          </div>

        </div>


        <button
          className="add-customer-btn"
          onClick={
            handleAddCustomer
          }
        >

          <UserPlus size={19} />

          <span>
            Add Customer
          </span>

        </button>

      </div>


      {/* =================================================
          STATS
      ================================================= */}

      <div className="customer-stat-card">

        <div className="stat-icon">

          <Users size={25} />

        </div>


        <div className="stat-content">

          <span>
            Total Customers
          </span>

          <strong>
            {customers.length}
          </strong>

        </div>

      </div>


      {/* =================================================
          CUSTOMER LIST
      ================================================= */}

      <section className="customer-list-card">


        {/* LIST HEADER */}

        <div className="customer-list-header">

          <div>

            <h2>
              Customer List
            </h2>

            <p>

              {filteredCustomers.length}{" "}

              customer
              {filteredCustomers.length !== 1
                ? "s"
                : ""}{" "}
              found

            </p>

          </div>


          <div className="customer-controls">


            {/* SEARCH */}

            <div className="customer-search">

              <Search size={19} />

              <input
                type="text"
                placeholder="Search customers..."
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
              className="refresh-btn"
              onClick={
                fetchCustomers
              }
              title="Refresh"
            >

              <RefreshCw size={20} />

            </button>

          </div>

        </div>


        {/* =================================================
            TABLE
        ================================================= */}

        <div className="customer-table-wrapper">

          <table className="customer-table">


            <thead>

              <tr>

                <th className="customer-col-name">
                  Customer Name
                </th>

                <th className="customer-col-phone">
                  Phone
                </th>

                <th className="customer-col-email">
                  Email
                </th>

                <th className="customer-col-purchase">
                  Total Purchases
                </th>

                <th className="customer-col-actions">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>


              {/* LOADING */}

              {loading ? (

                <tr>

                  <td
                    colSpan="5"
                    className="empty-state"
                  >
                    Loading customers...
                  </td>

                </tr>


              ) : filteredCustomers.length ===
                0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="empty-state"
                  >

                    <Users size={38} />

                    <strong>
                      No customers found
                    </strong>

                    <span>
                      Add your first customer to get started.
                    </span>

                  </td>

                </tr>


              ) : (

                filteredCustomers.map(
                  (customer, index) => {

                    const initials =
                      customer.name

                        ? customer.name
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
                            .toUpperCase()

                        : "CU";


                    return (

                      <tr
                        key={
                          customer.id
                        }
                      >


                        {/* CUSTOMER */}

                        <td>

                          <div className="customer-name-cell">

                            <div className="customer-avatar">

                              {initials}

                            </div>


                            <div>

                              <strong>
                                {customer.name}
                              </strong>

                              <span>
                                Customer #
                                {customer.id ||
                                  index + 1}
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* PHONE */}

                        <td>

                          <div className="contact-item">

                            <Phone size={16} />

                            <span>
                              {customer.phone}
                            </span>

                          </div>

                        </td>


                        {/* EMAIL */}

                        <td>

                          <div className="contact-item">

                            <Mail size={16} />

                            <span>
                              {customer.email}
                            </span>

                          </div>

                        </td>


                        {/* TOTAL PURCHASES */}

                        <td className="customer-col-purchase">

                          <span className="purchase-amount">

                            {formatMoney(
                              customer.total_purchases
                            )}

                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td className="customer-col-actions">

                          <div className="customer-actions">


                            <button
                              className="edit-btn"
                              onClick={() =>
                                handleEdit(
                                  customer
                                )
                              }
                              title="Edit Customer"
                            >

                              <Pencil size={17} />

                            </button>


                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDelete(
                                  customer.id
                                )
                              }
                              title="Delete Customer"
                            >

                              <Trash2 size={17} />

                            </button>


                          </div>

                        </td>

                      </tr>

                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (

        <div
          className="customer-modal-overlay"
          onClick={() =>
            setShowModal(false)
          }
        >

          <div
            className="customer-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <h2>

                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}

                </h2>


                <p>

                  {editingCustomer
                    ? "Update customer information"
                    : "Enter customer information"}

                </p>

              </div>


              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setShowModal(false)
                }
              >

                <X size={20} />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="form-grid">


                {/* CUSTOMER NAME */}

                <div className="form-group">

                  <label>
                    Customer Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter customer name"
                    required
                  />

                </div>


                {/* PHONE */}

                <div className="form-group">

                  <label>
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={
                      form.phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter phone number"
                    required
                  />

                </div>


                {/* EMAIL */}

                <div className="form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter email"
                    required
                  />

                </div>


                {/* CITY */}

                <div className="form-group">

                  <label>
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={
                      form.city
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter city"
                    required
                  />

                </div>


                {/* ADDRESS */}

                <div className="form-group full-width">

                  <label>
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={
                      form.address
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter address"
                    rows="3"
                  />

                </div>


                {/* TOTAL PURCHASES */}

                <div className="form-group">

                  <label>
                    Total Purchases
                  </label>

                  <input
                    type="number"
                    name="total_purchases"
                    value={
                      form.total_purchases
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="0"
                    min="0"
                  />

                </div>

              </div>


              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-btn"
                >

                  {editingCustomer
                    ? "Update Customer"
                    : "Add Customer"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}


export default Customers;