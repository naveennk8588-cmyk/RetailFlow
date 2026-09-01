import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";


function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  /* =====================================================
     INPUT CHANGE
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
     LOGIN
  ===================================================== */

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);
      setError("");


      const response = await api.post(
        "accounts/login/",
        {
          username: form.username.trim(),
          password: form.password,
        }
      );


      /* SAVE JWT TOKENS */

      localStorage.setItem(
        "accessToken",
        response.data.access
      );

      localStorage.setItem(
        "refreshToken",
        response.data.refresh
      );


      /* REDIRECT */

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );

    } catch (err) {

      console.error(
        "Login error:",
        err
      );


      if (
        err.response?.data?.detail
      ) {

        setError(
          err.response.data.detail
        );

      } else if (
        err.response?.status === 401
      ) {

        setError(
          "Invalid username or password."
        );

      } else {

        setError(
          "Unable to connect to the server. Please try again."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  /* =====================================================
     UI
  ===================================================== */

  return (

    <div className="auth-page">

      <div className="auth-card">


        {/* LOGO */}

        <div className="auth-logo">
          🛒
        </div>


        {/* TITLE */}

        <h1>
          Welcome Back
        </h1>

        <p>
          Login to RetailFlow
        </p>


        {/* FORM */}

        <form
          onSubmit={
            handleSubmit
          }
        >


          {/* USERNAME */}

          <div className="auth-field">

            <label>
              Username
            </label>

            <input
              type="text"
              name="username"
              value={
                form.username
              }
              onChange={
                handleChange
              }
              placeholder="Enter username"
              autoComplete="username"
              required
            />

          </div>


          {/* PASSWORD */}

          <div className="auth-field">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              value={
                form.password
              }
              onChange={
                handleChange
              }
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />

          </div>


          {/* ERROR */}

          {error && (

            <div className="auth-error">
              ⚠ {error}
            </div>

          )}


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="auth-submit"
            disabled={
              loading
            }
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>


        {/* REGISTER LINK */}

        <div className="auth-link">

          Don't have an account?{" "}

          <a
            href="/register"
          >
            Register
          </a>

        </div>


      </div>

    </div>

  );
}


export default Login;