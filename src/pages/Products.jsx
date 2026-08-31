import { useEffect, useState } from "react";
import api from "../api/axios";


const emptyForm = {
  name: "",
  category: "",
  price: "",
  stock: "",
  description: "",
  image: "",
};


function Products() {

  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] =
    useState(emptyForm);


  /* =====================================================
     GET PRODUCTS
  ===================================================== */

  const fetchProducts = async () => {

    try {

      setLoading(true);

      const response =
        await api.get("products/");

      setProducts(response.data);

    } catch (error) {

      console.error(
        "Error fetching products:",
        error
      );

      alert(
        "Unable to load products"
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchProducts();

  }, []);


  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  /* =====================================================
     OPEN ADD MODAL
  ===================================================== */

  const openAddModal = () => {

    setEditingId(null);

    setFormData({
      ...emptyForm,
    });

    setShowForm(true);

  };


  /* =====================================================
     OPEN EDIT MODAL
  ===================================================== */

  const openEditModal = (
    product
  ) => {

    setEditingId(product.id);

    setFormData({

      name:
        product.name || "",

      category:
        product.category || "",

      price:
        product.price || "",

      stock:
        product.stock || "",

      description:
        product.description || "",

      image:
        product.image || "",

    });

    setShowForm(true);

  };


  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal = () => {

    setShowForm(false);

    setEditingId(null);

    setFormData({
      ...emptyForm,
    });

  };


  /* =====================================================
     ADD / UPDATE PRODUCT
  ===================================================== */

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    try {

      const data = {

        name:
          formData.name,

        category:
          formData.category,

        price:
          Number(formData.price),

        stock:
          Number(formData.stock),

        description:
          formData.description,

        image:
          formData.image,

      };


      if (editingId) {

        await api.put(
          `products/${editingId}/`,
          data
        );

        alert(
          "Product updated successfully!"
        );

      } else {

        await api.post(
          "products/",
          data
        );

        alert(
          "Product added successfully!"
        );

      }


      closeModal();

      fetchProducts();

    } catch (error) {

      console.error(
        "Save error:",
        error
      );

      if (error.response?.data) {

        console.log(
          "Django response:",
          error.response.data
        );

      }

      alert(
        editingId
          ? "Failed to update product"
          : "Failed to add product"
      );

    }
  };


  /* =====================================================
     DELETE PRODUCT
  ===================================================== */

  const handleDelete = async (
    id,
    name
  ) => {

    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete "${name}"?`
      );

    if (!confirmDelete) {
      return;
    }


    try {

      await api.delete(
        `products/${id}/`
      );

      alert(
        "Product deleted successfully!"
      );

      fetchProducts();

    } catch (error) {

      console.error(
        "Delete error:",
        error
      );

      alert(
        "Failed to delete product"
      );

    }
  };


  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredProducts =
    products.filter(
      (product) => {

        const searchText =
          search
            .toLowerCase()
            .trim();

        return (

          product.name
            ?.toLowerCase()
            .includes(searchText)

          ||

          product.category
            ?.toLowerCase()
            .includes(searchText)

        );

      }
    );


  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalProducts =
    products.length;

  const inStock =
    products.filter(
      (product) =>
        Number(product.stock) > 0
    ).length;

  const outOfStock =
    products.filter(
      (product) =>
        Number(product.stock) === 0
    ).length;


  /* =====================================================
     UI
  ===================================================== */

  return (

    <div className="products-page">


      {/* ===============================================
          PAGE HEADER
      ================================================ */}

      <div className="page-header">

        <div>

          <h1>
            Products
          </h1>

          <p>
            Manage your products and inventory.
          </p>

        </div>


        <button
          className="add-product-btn"
          onClick={
            openAddModal
          }
        >
          + Add Product
        </button>

      </div>


      {/* ===============================================
          STATISTICS
      ================================================ */}

      <div className="product-stats">

        <div className="stat-card">

          <span>
            Total Products
          </span>

          <strong>
            {totalProducts}
          </strong>

        </div>


        <div className="stat-card">

          <span>
            In Stock
          </span>

          <strong>
            {inStock}
          </strong>

        </div>


        <div className="stat-card">

          <span>
            Out of Stock
          </span>

          <strong>
            {outOfStock}
          </strong>

        </div>

      </div>


      {/* ===============================================
          PRODUCT LIST
      ================================================ */}

      <div className="product-list">


        <div className="product-list-header">

          <div>

            <h2>
              Product List
            </h2>

            <p>
              {
                filteredProducts.length
              }{" "}
              products found
            </p>

          </div>


          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>


        {/* TABLE */}

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  Product
                </th>

                <th>
                  Category
                </th>

                <th>
                  Price
                </th>

                <th>
                  Stock
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="empty-table"
                  >
                    Loading products...
                  </td>

                </tr>

              ) : filteredProducts.length ===
                0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="empty-table"
                  >
                    No products found
                  </td>

                </tr>

              ) : (

                filteredProducts.map(
                  (product) => (

                    <tr
                      key={
                        product.id
                      }
                    >


                      {/* PRODUCT */}

                      <td>

                        <div className="product-name">

                          <div className="product-icon">

                            {product.name
                              ?.charAt(0)
                              .toUpperCase()}

                          </div>


                          <div>

                            <strong>
                              {product.name}
                            </strong>

                            <small>
                              ID: #{product.id}
                            </small>

                          </div>

                        </div>

                      </td>


                      {/* CATEGORY */}

                      <td>

                        <span className="category-badge">

                          {product.category}

                        </span>

                      </td>


                      {/* PRICE */}

                      <td>

                        ₹
                        {Number(
                          product.price
                        ).toFixed(2)}

                      </td>


                      {/* STOCK */}

                      <td>

                        {product.stock}

                      </td>


                      {/* STATUS */}

                      <td>

                        {Number(
                          product.stock
                        ) > 0 ? (

                          <span className="status in-stock">

                            ● In Stock

                          </span>

                        ) : (

                          <span className="status out-stock">

                            ● Out of Stock

                          </span>

                        )}

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="action-buttons">

                          <button
                            className="action-btn edit-btn"
                            onClick={() =>
                              openEditModal(
                                product
                              )
                            }
                            title="Edit Product"
                          >
                            ✎
                          </button>


                          <button
                            className="action-btn delete-btn"
                            onClick={() =>
                              handleDelete(
                                product.id,
                                product.name
                              )
                            }
                            title="Delete Product"
                          >
                            🗑
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

      </div>


      {/* ===============================================
          ADD / EDIT MODAL
      ================================================ */}

      {showForm && (

        <div
          className="modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {

              closeModal();

            }

          }}
        >

          <div className="product-modal">


            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <h2>

                  {editingId
                    ? "Edit Product"
                    : "Add Product"}

                </h2>

                <p>

                  {editingId
                    ? "Update your product information."
                    : "Add a new product to your inventory."}

                </p>

              </div>


              <button
                type="button"
                className="close-btn"
                onClick={
                  closeModal
                }
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="product-form"
              onSubmit={
                handleSubmit
              }
            >


              {/* PRODUCT NAME */}

              <div className="form-group full-width">

                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter product name"
                  required
                />

              </div>


              {/* CATEGORY */}

              <div className="form-group">

                <label>
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter category"
                  required
                />

              </div>


              {/* PRICE */}

              <div className="form-group">

                <label>
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={
                    formData.price
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="₹ 0.00"
                  min="0"
                  step="0.01"
                  required
                />

              </div>


              {/* STOCK */}

              <div className="form-group">

                <label>
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  value={
                    formData.stock
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0"
                  min="0"
                  required
                />

              </div>


              {/* IMAGE */}

              <div className="form-group">

                <label>
                  Image URL
                </label>

                <input
                  type="url"
                  name="image"
                  value={
                    formData.image
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://example.com/image.jpg"
                />

              </div>


              {/* DESCRIPTION */}

              <div className="form-group full-width">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter product description"
                  rows="2"
                />

              </div>


              {/* ACTIONS */}

              <div className="modal-actions full-width">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    closeModal
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-btn"
                >

                  {editingId
                    ? "Update Product"
                    : "Save Product"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


export default Products;