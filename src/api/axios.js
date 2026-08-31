import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});


// =====================================================
// REQUEST INTERCEPTOR
// Attach access token to every API request
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// =====================================================
// RESPONSE INTERCEPTOR
// Refresh access token when it expires
// =====================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {

    const originalRequest =
      error.config;


    // Only handle 401
    if (
      error.response?.status !== 401 ||
      !originalRequest
    ) {
      return Promise.reject(error);
    }


    // Don't retry the refresh endpoint itself
    if (
      originalRequest.url?.includes(
        "accounts/token/refresh/"
      )
    ) {

      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "refreshToken"
      );

      window.location.href =
        "/login";

      return Promise.reject(error);
    }


    // Prevent infinite retry loop
    if (originalRequest._retry) {

      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "refreshToken"
      );

      window.location.href =
        "/login";

      return Promise.reject(error);
    }


    originalRequest._retry = true;


    const refreshToken =
      localStorage.getItem(
        "refreshToken"
      );


    // No refresh token
    if (!refreshToken) {

      localStorage.removeItem(
        "accessToken"
      );

      window.location.href =
        "/login";

      return Promise.reject(error);
    }


    try {

      // Request a new access token
      const response =
        await axios.post(
          "http://127.0.0.1:8000/api/accounts/token/refresh/",
          {
            refresh: refreshToken,
          }
        );


      const newAccessToken =
        response.data.access;


      // Save new token
      localStorage.setItem(
        "accessToken",
        newAccessToken
      );


      // Update original request
      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;


      // Retry original API request
      return api(originalRequest);

    } catch (refreshError) {

      console.error(
        "Token refresh failed:",
        refreshError
      );


      // Refresh token expired/invalid
      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "refreshToken"
      );


      window.location.href =
        "/login";


      return Promise.reject(
        refreshError
      );
    }
  }
);


export default api;