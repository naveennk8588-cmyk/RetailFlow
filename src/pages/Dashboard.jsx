import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


/* =========================================================
   FORMAT CURRENCY
========================================================= */

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;


/* =========================================================
   ANIMATED NUMBER
========================================================= */

function AnimatedNumber({
  value,
  currency = false,
}) {
  const target = Number(value || 0);

  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;

    const start = performance.now();

    const duration = 800;

    const animate = (now) => {
      const progress = Math.min(
        (now - start) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      setDisplay(target * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(
          animate
        );
      }
    };

    frame = requestAnimationFrame(animate);

    return () =>
      cancelAnimationFrame(frame);
  }, [target]);

  return (
    <>
      {currency
        ? formatCurrency(display)
        : Math.round(display).toLocaleString(
            "en-IN"
          )}
    </>
  );
}


/* =========================================================
   DASHBOARD ICON
========================================================= */

function DashboardIcon({ type }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };


  /* SALES */

  if (type === "sales") {
    return (
      <svg {...common}>

        <path d="M4 19V5" />

        <path d="M4 19h16" />

        <path d="m7 15 4-4 3 2 5-6" />

        <path d="M15 7h4v4" />

      </svg>
    );
  }


  /* INVOICE */

  if (type === "invoice") {
    return (
      <svg {...common}>

        <rect
          x="5"
          y="3"
          width="14"
          height="18"
          rx="2"
        />

        <path d="M8 7h8M8 11h8M8 15h5" />

      </svg>
    );
  }


  /* PRODUCT */

  if (type === "product") {
    return (
      <svg {...common}>

        <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />

        <path d="m4 7.5 8 4.5 8-4.5" />

        <path d="M4 7.5V16l8 5 8-5V7.5" />

        <path d="M12 12v9" />

      </svg>
    );
  }


  /* CUSTOMER */

  return (
    <svg {...common}>

      <circle
        cx="9"
        cy="8"
        r="3"
      />

      <path
        d="
          M3 20
          c0-3.3 2.4-5 6-5
          s6 1.7 6 5
        "
      />

      <path
        d="
          M16 5.5
          a3 3 0 0 1 0 5.8
        "
      />

      <path
        d="
          M18 15
          c1.9.7 3 2.2 3 5
        "
      />

    </svg>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {

  const navigate = useNavigate();

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  useEffect(() => {

    let active = true;

    api
      .get("dashboard/")
      .then((response) => {

        if (!active) {
          return;
        }

        setData(response.data);

        setError("");
      })

      .catch((err) => {

        console.error(
          "Dashboard API error:",
          err
        );

        if (active) {

          setError(
            "Unable to load dashboard data from Django API."
          );

        }

      })

      .finally(() => {

        if (active) {

          setLoading(false);

        }

      });


    return () => {

      active = false;

    };

  }, []);


  /* =======================================================
     WEEKLY REVENUE
  ======================================================= */

  const weeklyRevenue = useMemo(() => {

    if (
      !Array.isArray(
        data?.weekly_revenue
      )
    ) {
      return [];
    }

    return data.weekly_revenue.map(
      (item) => ({

        day: item.day,

        amount:
          Number(item.amount || 0),

      })
    );

  }, [data]);


  /* =======================================================
     TOP PRODUCTS
  ======================================================= */

  const topProducts = useMemo(() => {

    if (
      !Array.isArray(
        data?.top_selling_products
      )
    ) {
      return [];
    }

    return data.top_selling_products

      .map((item) => ({

        name:
          item.name || "Product",

        quantity:
          Number(
            item.quantity || 0
          ),

      }))

      .filter(
        (item) =>
          item.quantity > 0
      );

  }, [data]);


  /* =======================================================
     KPI CARDS
  ======================================================= */

  const cards = data
    ? [

        {
          title: "Today's Sales",

          value:
            data.today_sales,

          icon: "sales",

          type: "sales",

          currency: true,
        },

        {
          title: "Total Invoices",

          value:
            data.total_invoices,

          icon: "invoice",

          type: "invoice",
        },

        {
          title: "Products",

          value:
            data.total_products,

          icon: "product",

          type: "product",
        },

        {
          title: "Customers",

          value:
            data.total_customers,

          icon: "customer",

          type: "customer",
        },

      ]
    : [];


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <div className="dashboard-loading">

        <div className="loader" />

        <p>
          Loading live dashboard...
        </p>

      </div>

    );

  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !data) {

    return (

      <div className="dashboard-error">

        <h2>
          Dashboard connection problem
        </h2>

        <p>
          {error ||
            "No dashboard data received."}
        </p>

        <button
          className="dashboard-retry"
          onClick={() =>
            window.location.reload()
          }
        >
          Retry
        </button>

      </div>

    );

  }


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="dashboard-header">

        <div>

          <h1>
            Dashboard
          </h1>

          <p>
            Welcome back! Here's your business overview.
          </p>

        </div>


        <div
          className="dashboard-date"
          title="Data loaded from Django REST API"
        >

          <span />

          Live Data

        </div>

      </header>


      {/* =================================================
          KPI CARDS
      ================================================= */}

      <section
        className="stats-grid"
        aria-label="Business statistics"
      >

        {cards.map((card) => (

          <article
            className={`stat-card ${card.type}`}
            key={card.title}
          >

            <div
              className={`stat-icon ${card.type}`}
            >

              <DashboardIcon
                type={card.icon}
              />

            </div>


            <div className="stat-content">

              <p>
                {card.title}
              </p>

              <h2>

                <AnimatedNumber
                  value={card.value}
                  currency={card.currency}
                />

              </h2>

            </div>

          </article>

        ))}

      </section>


      {/* =================================================
          CHARTS
      ================================================= */}

      <section className="dashboard-charts">


        {/* ===============================================
            WEEKLY REVENUE
        ================================================ */}

        <article className="dashboard-chart-card">

          <div className="chart-card-header">

            <div>

              <h3>
                Weekly Revenue
              </h3>

              <p>
                Paid sales from this week
              </p>

            </div>


            <div className="chart-filter">
              This Week
            </div>

          </div>


          <div className="chart-wrap">

            {weeklyRevenue.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart
                  data={weeklyRevenue}
                  margin={{
                    top: 8,
                    right: 8,
                    left: 0,
                    bottom: 0,
                  }}
                >

                  <defs>

                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#5f963d"
                        stopOpacity={0.34}
                      />

                      <stop
                        offset="100%"
                        stopColor="#5f963d"
                        stopOpacity={0.03}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    stroke="#e7ece8"
                    strokeDasharray="3 4"
                    vertical={false}
                  />


                  <XAxis
                    dataKey="day"

                    tick={{
                      fill: "#7b857e",
                      fontSize: 11,
                    }}

                    axisLine={{
                      stroke: "#dfe5e1",
                    }}

                    tickLine={false}
                  />


                  <YAxis

                    tick={{
                      fill: "#7b857e",
                      fontSize: 11,
                    }}

                    axisLine={false}

                    tickLine={false}

                    width={42}

                    tickFormatter={(value) =>
                      value >= 1000
                        ? `${Math.round(
                            value / 1000
                          )}k`
                        : value
                    }

                  />


                  <Tooltip
                    content={({
                      active,
                      payload,
                      label,
                    }) => {

                      if (
                        !active ||
                        !payload?.length
                      ) {
                        return null;
                      }

                      return (

                        <div className="chart-tooltip">

                          <strong>
                            {label}
                          </strong>

                          <span>
                            {formatCurrency(
                              payload[0].value
                            )}
                          </span>

                        </div>

                      );

                    }}
                  />


                  <Area

                    type="monotone"

                    dataKey="amount"

                    stroke="#5f963d"

                    strokeWidth={3}

                    fill="url(#revenueGradient)"

                    dot={{
                      r: 3,
                      fill: "#5f963d",
                      strokeWidth: 0,
                    }}

                    activeDot={{
                      r: 5,
                    }}

                  />

                </AreaChart>

              </ResponsiveContainer>

            ) : (

              <div className="chart-empty">

                No revenue data available yet.

              </div>

            )}

          </div>

        </article>


        {/* ===============================================
            TOP SELLING PRODUCTS
        ================================================ */}

        <article className="dashboard-chart-card">

          <div className="chart-card-header">

            <div>

              <h3>
                Top Selling Products
              </h3>

              <p>
                Best performing products
              </p>

            </div>


            <div className="chart-filter">
              This Week
            </div>

          </div>


          <div className="chart-wrap">

            {topProducts.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{
                    top: 4,
                    right: 18,
                    left: 5,
                    bottom: 4,
                  }}
                >

                  <CartesianGrid
                    stroke="#e7ece8"
                    strokeDasharray="3 4"
                    horizontal={false}
                  />


                  <XAxis

                    type="number"

                    tick={{
                      fill: "#7b857e",
                      fontSize: 10,
                    }}

                    axisLine={{
                      stroke: "#dfe5e1",
                    }}

                    tickLine={false}

                    allowDecimals={false}

                  />


                  <YAxis

                    type="category"

                    dataKey="name"

                    width={86}

                    tick={{
                      fill: "#69736d",
                      fontSize: 11,
                    }}

                    axisLine={false}

                    tickLine={false}

                  />


                  <Tooltip

                    cursor={{
                      fill:
                        "rgba(95,150,61,.05)",
                    }}

                    formatter={(value) => [
                      `${value} units`,
                      "Sold",
                    ]}

                  />


                  <Bar
                    dataKey="quantity"
                    radius={[
                      0,
                      7,
                      7,
                      0,
                    ]}
                    barSize={24}
                  >

                    {topProducts.map(
                      (
                        item,
                        index
                      ) => (

                        <Cell
                          key={`${item.name}-${index}`}
                          fill={
                            index === 0
                              ? "#5f963d"
                              : "#82b36c"
                          }
                        />

                      )
                    )}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="chart-empty">

                <div>

                  <div
                    style={{
                      fontSize: 30,
                      marginBottom: 8,
                    }}
                  >
                    ▦
                  </div>


                  <strong
                    style={{
                      display: "block",
                      color: "#4b5563",
                      marginBottom: 5,
                    }}
                  >
                    No sales yet
                  </strong>


                  <span>
                    Top selling products will appear
                    here after sales are recorded.
                  </span>

                </div>

              </div>

            )}

          </div>

        </article>

      </section>


      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <section className="quick-actions-card">

        <div className="quick-actions-header">

          <h3>
            Quick Actions
          </h3>

          <p>
            Manage your business quickly
          </p>

        </div>


        <div className="quick-actions-grid">


          {/* CREATE INVOICE */}

          <button
            className="quick-action invoice"
            onClick={() =>
              navigate("/invoices")
            }
          >

            <span className="quick-action-icon">
              +
            </span>

            <span className="quick-action-content">

              <strong>
                Create invoice
              </strong>

              <span>
                Start new billing
              </span>

            </span>

            <span className="quick-action-arrow">
              →
            </span>

          </button>


          {/* ADD PRODUCT */}

          <button
            className="quick-action product"
            onClick={() =>
              navigate("/products")
            }
          >

            <span className="quick-action-icon">

              <DashboardIcon
                type="product"
              />

            </span>


            <span className="quick-action-content">

              <strong>
                Add product
              </strong>

              <span>
                Manage inventory
              </span>

            </span>


            <span className="quick-action-arrow">
              →
            </span>

          </button>


        </div>

      </section>

    </div>

  );
}


export default Dashboard;