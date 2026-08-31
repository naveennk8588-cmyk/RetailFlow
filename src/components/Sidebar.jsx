import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <div className="logo-box">R</div>

        <div>
          <h2>RetailFlow</h2>
          <span>Business Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">

        <NavLink to="/dashboard" className="nav-item">
          <span>DB</span>
          Dashboard
        </NavLink>

        <NavLink to="/products" className="nav-item">
          <span>PR</span>
          Products
        </NavLink>

        <NavLink to="/customers" className="nav-item">
          <span>CU</span>
          Customers
        </NavLink>

        <NavLink to="/billing" className="nav-item">
          <span>BI</span>
          Billing
        </NavLink>

        <NavLink to="/invoices" className="nav-item">
          <span>IN</span>
          Invoices
        </NavLink>

        <NavLink to="/settings" className="nav-item">
          <span>SE</span>
          Settings
        </NavLink>

      </nav>

    </aside>
  );
}

export default Sidebar;