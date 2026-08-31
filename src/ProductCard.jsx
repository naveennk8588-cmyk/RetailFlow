function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="product-icon">
        📦
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>

        <p className="product-price">
          ₹{product.price}
        </p>

        <p className="product-stock">
          Stock: {product.stock}
        </p>
      </div>

      <div
        className={
          product.stock > 0
            ? "stock-badge available"
            : "stock-badge out"
        }
      >
        {product.stock > 0 ? "Available" : "Out of Stock"}
      </div>
    </div>
  );
}

export default ProductCard;