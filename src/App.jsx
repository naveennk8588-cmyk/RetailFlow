import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Billing from "./pages/Billing";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";

import Login from "./pages/Login";
import Register from "./pages/Register";

import "./App.css";


/* =========================================================
   RETAILFLOW LOGO
========================================================= */

function LogoIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Cart */}
      <path d="M7 10h5l3 19h17c2 0 3-1 3.5-3L38 16H13" />

      {/* Cart handle */}
      <path d="M17 16h18" />

      {/* Wheels */}
      <circle
        cx="18"
        cy="36"
        r="2.5"
        fill="currentColor"
      />

      <circle
        cx="31"
        cy="36"
        r="2.5"
        fill="currentColor"
      />

      {/* Growth / check */}
      <path d="M21 21l4 4 7-8" />
    </svg>
  );
}


/* =========================================================
   SIDEBAR ICONS
========================================================= */

function SidebarIcon({ type }) {

  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };


  /* Dashboard */

  if (type === "dashboard") {
    return (
      <svg {...common}>

        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1.2"
        />

        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1.2"
        />

        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1.2"
        />

        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1.2"
        />

      </svg>
    );
  }


  /* Products */

  if (type === "products") {
    return (
      <svg {...common}>

        <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />

        <path d="m4 7.5 8 4.5 8-4.5" />

        <path d="M4 7.5V16l8 5 8-5V7.5" />

        <path d="M12 12v9" />

      </svg>
    );
  }


  /* Customers */

  if (type === "customers") {
    return (
      <svg {...common}>

        <circle
          cx="9"
          cy="8"
          r="3"
        />

        <path d="M3 20c0-3.4 2.4-5 6-5s6 1.6 6 5" />

        <path d="M16 5.5a3 3 0 0 1 0 5.8" />

        <path d="M18 15c1.9.7 3 2.2 3 5" />

      </svg>
    );
  }


  /* Billing */

  if (type === "billing") {
    return (
      <svg {...common}>

        <rect
          x="5"
          y="3"
          width="14"
          height="18"
          rx="2"
        />

        <path d="M8 7h8" />

        <path d="M8 11h8" />

        <path d="M8 15h4" />

        <path d="M13 17h4" />

      </svg>
    );
  }


  /* Invoices */

  if (type === "invoices") {
    return (
      <svg {...common}>

        <path d="M6 3h12v18l-2-1-2 1-2-1-2 1-2-1-2 1V3Z" />

        <path d="M9 7h6" />

        <path d="M9 11h6" />

        <path d="M9 15h4" />

      </svg>
    );
  }


  /* Settings */

  return (
    <svg {...common}>

      <path d="M12 3.5 13.5 5a7.7 7.7 0 0 1 2 .8l2.1-.6 1.7 1.7-.6 2.1a7.7 7.7 0 0 1 .8 2l1.5 1.5-1.5 1.5a7.7 7.7 0 0 1-.8 2l.6 2.1-1.7 1.7-2.1-.6a7.7 7.7 0 0 1-2 .8L12 20.5l-1.5-1.5a7.7 7.7 0 0 1-2-.8l-2.1.6-1.7-1.7.6-2.1a7.7 7.7 0 0 1-.8-2L3 11.5 4.5 10a7.7 7.7 0 0 1 .8-2l-.6-2.1 1.7-1.7 2.1.6a7.7 7.7 0 0 1 2-.8L12 3.5Z" />

      <circle
        cx="12"
        cy="12"
        r="2.7"
      />

    </svg>
  );
}


/* =========================================================
   LOGOUT ICON
========================================================= */

function LogoutIcon() {

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >

      <path d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />

      <path d="M16 17l5-5-5-5" />

      <path d="M21 12H9" />

    </svg>
  );

}


/* =========================================================
   NAVIGATION
========================================================= */

const navItems = [
  ["/dashboard", "Dashboard", "dashboard"],
  ["/products", "Products", "products"],
  ["/customers", "Customers", "customers"],
  ["/billing", "Billing", "billing"],
  ["/invoices", "Invoices", "invoices"],
  ["/settings", "Settings", "settings"],
];


/* =========================================================
   PROTECTED ROUTE
========================================================= */

function ProtectedRoute({
  children,
}) {

  const token =
    localStorage.getItem(
      "accessToken"
    );


  if (!token) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  return children;

}


/* =========================================================
   AUTH ROUTE
========================================================= */

function AuthRoute({
  children,
}) {

  const token =
    localStorage.getItem(
      "accessToken"
    );


  if (token) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );

  }


  return children;

}


/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar() {

  const navigate =
    useNavigate();


  /* ===============================================
     LOGOUT
  ================================================ */

  const handleLogout = () => {

    const confirmed =
      window.confirm(
        "Are you sure you want to logout?"
      );


    if (!confirmed) {
      return;
    }


    /* Remove JWT tokens */

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "refreshToken"
    );


    /* Redirect to login */

    navigate(
      "/login",
      {
        replace: true,
      }
    );

  };


  return (

    <aside className="sidebar">


      {/* ==========================================
          LOGO
      =========================================== */}

      <div className="sidebar-logo">

        <div className="logo-box">

          <LogoIcon />

        </div>


        <div className="logo-content">

          <h2>
            Retail<span>Flow</span>
          </h2>

          <small>
            Smart retail billing
          </small>

        </div>

      </div>


      {/* ==========================================
          NAVIGATION
      =========================================== */}

      <nav className="sidebar-nav">

        {navItems.map(
          ([to, label, icon]) => (

            <NavLink
              key={to}
              to={to}
              className={({
                isActive,
              }) =>
                `nav-item${
                  isActive
                    ? " active"
                    : ""
                }`
              }
            >

              <span className="nav-icon">

                <SidebarIcon
                  type={icon}
                />

              </span>


              <span className="nav-label">

                {label}

              </span>

            </NavLink>

          )
        )}

      </nav>


      {/* ==========================================
          SIDEBAR FOOTER
      =========================================== */}

      <div className="sidebar-footer">


        {/* OWNER */}

        <div className="owner-avatar">
          RS
        </div>


        <div className="owner-info">

          <div className="owner-name">
            Retail Shop
          </div>

          <div className="owner-role">
            Owner
          </div>

        </div>


        {/* LOGOUT */}

        <button
          type="button"
          className="logout-btn"
          onClick={
            handleLogout
          }
          title="Logout"
        >

          <LogoutIcon />

          <span>
            Logout
          </span>

        </button>


      </div>


    </aside>

  );

}


/* =========================================================
   APP
========================================================= */

function App() {

  const location =
    useLocation();


  const isAuthPage =
    location.pathname ===
      "/login" ||
    location.pathname ===
      "/register";


  return (

    <div className="app-layout">


      {/* =============================================
          SIDEBAR
      ============================================== */}

      {!isAuthPage && (
        <Sidebar />
      )}


      {/* =============================================
          MAIN CONTENT
      ============================================== */}

      <main
        className={
          isAuthPage
            ? "auth-main"
            : "main-content"
        }
      >

        <Routes>


          {/* ==========================================
              LOGIN
          =========================================== */}

          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />


          {/* ==========================================
              REGISTER
          =========================================== */}

          <Route
            path="/register"
            element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            }
          />


          {/* ==========================================
              DEFAULT
          =========================================== */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />


          {/* ==========================================
              DASHBOARD
          =========================================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>

                <Dashboard />

              </ProtectedRoute>
            }
          />


          {/* ==========================================
              PRODUCTS
          =========================================== */}

          <Route
            path="/products"
            element={
              <ProtectedRoute>

                <Products />

              </ProtectedRoute>
            }
          />


          {/* ==========================================
              CUSTOMERS
          =========================================== */}

          <Route
            path="/customers"
            element={
              <ProtectedRoute>

                <Customers />

              </ProtectedRoute>
            }
          />


          {/* ==========================================
              BILLING
          =========================================== */}

          <Route
            path="/billing"
            element={
              <ProtectedRoute>

                <Billing />

              </ProtectedRoute>
            }
          />


          {/* ==========================================
              INVOICES
          =========================================== */}

          <Route
            path="/invoices"
            element={
              <ProtectedRoute>

                <Invoices />

              </ProtectedRoute>
            }
          />


          {/* ==========================================
              SETTINGS
          =========================================== */}

          <Route
            path="/settings"
            element={
              <ProtectedRoute>

                <Settings />

              </ProtectedRoute>
            }
          />


          {/* ==========================================
              FALLBACK
          =========================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>

      </main>

    </div>

  );

}


export default App;