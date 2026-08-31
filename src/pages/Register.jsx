import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API}/accounts/register/`,
        {
          username: form.username,
          email: form.email,
          password: form.password,
        }
      );

      setSuccess(
        "Registration successful. Redirecting to login..."
      );

      setForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response?.data) {
        const data = err.response.data;

        if (data.username) {
          setError(
            `Username: ${data.username.join(", ")}`
          );
        } else if (data.email) {
          setError(
            `Email: ${data.email.join(", ")}`
          );
        } else if (data.password) {
          setError(
            `Password: ${data.password.join(", ")}`
          );
        } else {
          setError(
            "Registration failed. Please check your details."
          );
        }
      } else {
        setError(
          "Unable to connect to Django backend."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          🛒
        </div>

        <h1>
          Create Account
        </h1>

        <p>
          Register your RetailFlow account
        </p>


        <form onSubmit={handleSubmit}>

          <div className="auth-field">

            <label>
              Username
            </label>

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              autoComplete="username"
              required
            />

          </div>


          <div className="auth-field">

            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              autoComplete="email"
              required
            />

          </div>


          <div className="auth-field">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              required
            />

          </div>


          <div className="auth-field">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              autoComplete="new-password"
              required
            />

          </div>


          {error && (
            <div className="auth-error">
              ⚠ {error}
            </div>
          )}


          {success && (
            <div className="auth-success">
              ✓ {success}
            </div>
          )}


          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Register"}
          </button>

        </form>


        <div className="auth-link">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </div>

      </div>

    </div>
  );
}

export default Register;