import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

const BACKEND_URL = "http://127.0.0.1:8000";

function Settings() {

  const [settings, setSettings] = useState({
    id: 1,
    shop_name: "",
    owner_name: "",
    phone: "",
    email: "",
    address: "",
    gst_number: "",
    default_gst: 5,
    invoice_prefix: "INV",
    invoice_template: "classic",
    logo: "",
    voice_billing: false,
    auto_save_invoices: true,
    appearance: "light",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);


  /* =====================================================
     LOAD SETTINGS
  ===================================================== */

  useEffect(() => {

    const loadSettings = async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await api.get("accounts/settings/");

        const data =
          response.data;


        setSettings({
          id:
            data.id || 1,

          shop_name:
            data.shop_name || "",

          owner_name:
            data.owner_name || "",

          phone:
            data.phone || "",

          email:
            data.email || "",

          address:
            data.address || "",

          gst_number:
            data.gst_number || "",

          default_gst:
            data.default_gst ?? 5,

          invoice_prefix:
            data.invoice_prefix || "INV",

          invoice_template:
            data.invoice_template ||
            "classic",

          logo:
            data.logo || "",

          voice_billing:
            Boolean(
              data.voice_billing
            ),

          auto_save_invoices:
            Boolean(
              data.auto_save_invoices
            ),

          appearance:
            data.appearance ||
            "light",
        });


        if (data.logo) {

          setLogoPreview(
            data.logo.startsWith("http")
              ? data.logo
              : `${BACKEND_URL}${data.logo}`
          );

        }

      } catch (err) {

        console.error(
          "Settings load error:",
          err
        );

        setError(
          "Unable to load settings from Django."
        );

      } finally {

        setLoading(false);

      }

    };


    loadSettings();

  }, []);


  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setSettings((prev) => ({

      ...prev,

      [name]:
        value,

    }));

  };


  /* =====================================================
     TOGGLE
  ===================================================== */

  const handleToggle = (
    name
  ) => {

    setSettings((prev) => ({

      ...prev,

      [name]:
        !prev[name],

    }));

  };


  /* =====================================================
     APPEARANCE
  ===================================================== */

  const handleAppearance = (
    value
  ) => {

    setSettings((prev) => ({

      ...prev,

      appearance:
        value,

    }));


    applyTheme(value);

  };


  /* =====================================================
     INVOICE TEMPLATE
  ===================================================== */

  const handleTemplate = (
    value
  ) => {

    setSettings((prev) => ({

      ...prev,

      invoice_template:
        value,

    }));

  };


  /* =====================================================
     APPLY THEME
  ===================================================== */

  const applyTheme = (
    theme
  ) => {

    const root =
      document.documentElement;


    if (
      theme ===
      "dark"
    ) {

      root.setAttribute(
        "data-theme",
        "dark"
      );

      return;

    }


    if (
      theme ===
      "light"
    ) {

      root.setAttribute(
        "data-theme",
        "light"
      );

      return;

    }


    const isDark =
      window.matchMedia &&
      window
        .matchMedia(
          "(prefers-color-scheme: dark)"
        )
        .matches;


    root.setAttribute(
      "data-theme",
      isDark
        ? "dark"
        : "light"
    );

  };


  /* =====================================================
     APPLY SAVED THEME
  ===================================================== */

  useEffect(() => {

    if (!loading) {

      applyTheme(
        settings.appearance
      );

    }

  }, [
    loading,
    settings.appearance,
  ]);


  /* =====================================================
     LOGO SELECT
  ===================================================== */

  const handleLogoChange = (
    e
  ) => {

    const file =
      e.target.files?.[0];


    if (!file) {

      return;

    }


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      setError(
        "Please select a valid image file."
      );

      e.target.value = "";

      return;

    }


    if (
      file.size >
      2 * 1024 * 1024
    ) {

      setError(
        "Logo size must be less than 2 MB."
      );

      e.target.value = "";

      return;

    }


    setError("");
    setMessage("");


    setLogoFile(file);


    const previewUrl =
      URL.createObjectURL(
        file
      );


    setLogoPreview(
      previewUrl
    );

  };


  /* =====================================================
     REMOVE NEW LOGO
  ===================================================== */

  const removeLogo = () => {

    setLogoFile(null);


    setLogoPreview(

      settings.logo

        ? settings.logo.startsWith(
            "http"
          )

          ? settings.logo

          : `${BACKEND_URL}${settings.logo}`

        : ""

    );


    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        "";

    }

  };


  /* =====================================================
     SAVE SETTINGS
  ===================================================== */

  const saveSettings = async (
    e
  ) => {

    e.preventDefault();


    try {

      setSaving(true);

      setMessage("");
      setError("");


      const formData =
        new FormData();


      formData.append(
        "shop_name",
        settings.shop_name
      );


      formData.append(
        "owner_name",
        settings.owner_name
      );


      formData.append(
        "phone",
        settings.phone
      );


      formData.append(
        "email",
        settings.email
      );


      formData.append(
        "address",
        settings.address
      );


      formData.append(
        "gst_number",
        settings.gst_number
      );


      formData.append(
        "default_gst",
        settings.default_gst
      );


      formData.append(
        "invoice_prefix",
        settings.invoice_prefix
      );


      formData.append(
        "invoice_template",
        settings.invoice_template
      );


      formData.append(
        "voice_billing",
        settings.voice_billing
      );


      formData.append(
        "auto_save_invoices",
        settings.auto_save_invoices
      );


      formData.append(
        "appearance",
        settings.appearance
      );


      if (logoFile) {

        formData.append(
          "logo",
          logoFile
        );

      }


      /*
        IMPORTANT:
        Don't manually set Content-Type here.
        Axios/browser will create the multipart
        boundary automatically for FormData.
      */

      const response =
        await api.put(
          "accounts/settings/",
          formData
        );


      setSettings((prev) => ({

        ...prev,

        ...response.data,

      }));


      if (
        response.data.logo
      ) {

        setLogoPreview(

          response.data.logo.startsWith(
            "http"
          )

            ? response.data.logo

            : `${BACKEND_URL}${response.data.logo}`

        );

      }


      setLogoFile(null);


      if (
        fileInputRef.current
      ) {

        fileInputRef.current.value =
          "";

      }


      applyTheme(
        response.data.appearance
      );


      setMessage(
        "Settings saved successfully."
      );

    } catch (err) {

      console.error(
        "Settings save error:",
        err
      );


      console.error(
        "Django response:",
        err.response?.data
      );


      /*
        If Django returns validation errors,
        show them in console and user-friendly alert.
      */

      const djangoError =
        err.response?.data;


      if (
        djangoError &&
        typeof djangoError ===
          "object"
      ) {

        console.error(
          "Validation details:",
          djangoError
        );

      }


      setError(
        "Unable to save settings. Check Django backend."
      );

    } finally {

      setSaving(false);

    }

  };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div className="settings-loading">

        <div className="settings-loader"></div>

        <h3>
          Loading Settings...
        </h3>

        <p>
          Getting your shop settings from Django.
        </p>

      </div>

    );

  }


  /* =====================================================
     UI
  ===================================================== */

  return (

    <div className="settings-page">


      {/* ===============================================
          HEADER
      ================================================ */}

      <div className="settings-header">

        <div>

          <h1>
            Settings
          </h1>

          <p>
            Manage your shop settings and preferences
          </p>

        </div>

      </div>


      {/* ===============================================
          ALERTS
      ================================================ */}

      {message && (

        <div className="settings-success">

          ✓ {message}

        </div>

      )}


      {error && (

        <div className="settings-error">

          ⚠ {error}

        </div>

      )}


      <form
        onSubmit={saveSettings}
      >


        {/* =============================================
            SHOP INFORMATION
        ============================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div>

              <h2>
                Shop Information
              </h2>

              <p>
                Update your business information
              </p>

            </div>

          </div>


          <div className="settings-form-grid">


            {/* SHOP NAME */}

            <div className="settings-field">

              <label>
                Shop Name *
              </label>

              <input
                type="text"
                name="shop_name"
                value={
                  settings.shop_name
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>


            {/* OWNER */}

            <div className="settings-field">

              <label>
                Owner Name *
              </label>

              <input
                type="text"
                name="owner_name"
                value={
                  settings.owner_name
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>


            {/* PHONE */}

            <div className="settings-field">

              <label>
                Phone Number *
              </label>

              <input
                type="tel"
                name="phone"
                value={
                  settings.phone
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>


            {/* EMAIL */}

            <div className="settings-field">

              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={
                  settings.email
                }
                onChange={
                  handleChange
                }
              />

            </div>


            {/* ADDRESS */}

            <div className="settings-field full">

              <label>
                Shop Address
              </label>

              <textarea
                name="address"
                value={
                  settings.address
                }
                onChange={
                  handleChange
                }
                rows="4"
              />

            </div>


            {/* GST */}

            <div className="settings-field">

              <label>
                GST Number
              </label>

              <input
                type="text"
                name="gst_number"
                value={
                  settings.gst_number
                }
                onChange={
                  handleChange
                }
                placeholder="22AAAAA0000A1Z5"
              />

            </div>


            {/* LOGO */}

            <div className="settings-field">

              <label>
                Shop Logo
              </label>


              <div className="settings-logo-box">


                {/* PREVIEW */}

                <div className="settings-logo-preview">

                  {logoPreview ? (

                    <img
                      src={
                        logoPreview
                      }
                      alt="Shop Logo"
                    />

                  ) : (

                    <span>
                      Logo
                    </span>

                  )}

                </div>


                {/* CONTROLS */}

                <div className="settings-logo-controls">

                  <button
                    type="button"
                    className="logo-upload-btn"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    Upload Logo
                  </button>


                  {logoFile && (

                    <button
                      type="button"
                      className="logo-remove-btn"
                      onClick={
                        removeLogo
                      }
                    >
                      Remove
                    </button>

                  )}


                  <small>
                    JPG, PNG or WEBP · Max 2 MB
                  </small>

                </div>


                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={
                    handleLogoChange
                  }
                  hidden
                />

              </div>

            </div>

          </div>

        </section>


        {/* =============================================
            TAX SETTINGS
        ============================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <h2>
              Tax Settings
            </h2>

            <p>
              Configure default tax and invoice numbering
            </p>

          </div>


          <div className="settings-two-column">


            {/* GST */}

            <div className="settings-field">

              <label>
                Default GST %
              </label>


              <div className="settings-input-symbol">

                <input
                  type="number"
                  name="default_gst"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    settings.default_gst
                  }
                  onChange={
                    handleChange
                  }
                />

                <span>
                  %
                </span>

              </div>

            </div>


            {/* PREFIX */}

            <div className="settings-field">

              <label>
                Invoice Prefix
              </label>

              <input
                type="text"
                name="invoice_prefix"
                value={
                  settings.invoice_prefix
                }
                onChange={
                  handleChange
                }
                placeholder="INV"
              />

            </div>

          </div>

        </section>


        {/* =============================================
            INVOICE TEMPLATE
        ============================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <h2>
              Invoice Template
            </h2>

            <p>
              Choose how your invoice should look
            </p>

          </div>


          {/* CLASSIC */}

          <button
            type="button"
            className={
              `template-option ${
                settings.invoice_template ===
                "classic"
                  ? "selected"
                  : ""
              }`
            }
            onClick={() =>
              handleTemplate(
                "classic"
              )
            }
          >

            <div>

              <h3>
                Classic Template
              </h3>

              <p>
                Simple and professional invoice layout
              </p>

            </div>


            <span>

              {settings.invoice_template ===
              "classic"
                ? "Selected"
                : "Select"}

            </span>

          </button>


          {/* MODERN */}

          <button
            type="button"
            className={
              `template-option ${
                settings.invoice_template ===
                "modern"
                  ? "selected"
                  : ""
              }`
            }
            onClick={() =>
              handleTemplate(
                "modern"
              )
            }
          >

            <div>

              <h3>
                Modern Template
              </h3>

              <p>
                Contemporary design with vibrant colors
              </p>

            </div>


            <span>

              {settings.invoice_template ===
              "modern"
                ? "Selected"
                : "Select"}

            </span>

          </button>

        </section>


        {/* =============================================
            VOICE SETTINGS
        ============================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <h2>
              Voice Command Settings
            </h2>

            <p>
              Control quick billing options
            </p>

          </div>


          {/* VOICE BILLING */}

          <div className="settings-option">

            <div>

              <h3>
                Enable Voice Billing
              </h3>

              <p>
                Use microphone for quick product entry
              </p>

            </div>


            <button
              type="button"
              className={
                `settings-switch ${
                  settings.voice_billing
                    ? "on"
                    : ""
                }`
              }
              onClick={() =>
                handleToggle(
                  "voice_billing"
                )
              }
              aria-label="Toggle voice billing"
            >

              <span></span>

            </button>

          </div>


          {/* AUTO SAVE */}

          <div className="settings-option">

            <div>

              <h3>
                Auto-save Invoices
              </h3>

              <p>
                Automatically save invoices as drafts
              </p>

            </div>


            <button
              type="button"
              className={
                `settings-switch ${
                  settings.auto_save_invoices
                    ? "on"
                    : ""
                }`
              }
              onClick={() =>
                handleToggle(
                  "auto_save_invoices"
                )
              }
              aria-label="Toggle auto save invoices"
            >

              <span></span>

            </button>

          </div>

        </section>


        {/* =============================================
            APPEARANCE
        ============================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <h2>
              Appearance
            </h2>

            <p>
              Choose your preferred interface theme
            </p>

          </div>


          <div className="appearance-grid">


            {/* LIGHT */}

            <button
              type="button"
              className={
                `appearance-option ${
                  settings.appearance ===
                  "light"
                    ? "selected"
                    : ""
                }`
              }
              onClick={() =>
                handleAppearance(
                  "light"
                )
              }
            >

              <div className="appearance-icon">
                ☀
              </div>


              <div>

                <strong>
                  Light Mode
                </strong>

                <span>
                  Clean and bright interface
                </span>

              </div>


              <div className="appearance-radio">

                {settings.appearance ===
                "light"
                  ? "●"
                  : "○"}

              </div>

            </button>


            {/* DARK */}

            <button
              type="button"
              className={
                `appearance-option ${
                  settings.appearance ===
                  "dark"
                    ? "selected"
                    : ""
                }`
              }
              onClick={() =>
                handleAppearance(
                  "dark"
                )
              }
            >

              <div className="appearance-icon">
                ☾
              </div>


              <div>

                <strong>
                  Dark Mode
                </strong>

                <span>
                  Easy on the eyes
                </span>

              </div>


              <div className="appearance-radio">

                {settings.appearance ===
                "dark"
                  ? "●"
                  : "○"}

              </div>

            </button>

          </div>

        </section>


        {/* =============================================
            SAVE SETTINGS
        ============================================== */}

        <div className="settings-save-area">

          <button
            type="submit"
            className="settings-save-btn"
            disabled={
              saving
            }
          >

            {saving
              ? "Saving..."
              : "Save Settings"}

          </button>

        </div>

      </form>

    </div>

  );

}


export default Settings;