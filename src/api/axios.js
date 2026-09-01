import axios from "axios";

const api = axios.create({
  baseURL: "https://retailflow-backend-bmbe.onrender.com/api/",
  headers: {
    "Content-Type": "application/json",
  },
});


// =====================================================
// ATTACH JWT ACCESS TOKEN
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
// REFRESH ACCESS TOKEN
// =====================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {

    const originalRequest =
      error.config;


    if (
      error.response?.status !== 401 ||
      !originalRequest
    ) {
      return Promise.reject(error);
    }


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


    if (!refreshToken) {

      localStorage.removeItem(
        "accessToken"
      );

      window.location.href =
        "/login";

      return Promise.reject(error);
    }


    try {

      const response =
        await axios.post(

          "https://retailflow-backend-bmbe.onrender.com/api/accounts/token/refresh/",

          {
            refresh:
              refreshToken,
          }

        );


      const newAccessToken =
        response.data.access;


      localStorage.setItem(
        "accessToken",
        newAccessToken
      );


      originalRequest.headers =
        originalRequest.headers || {};


      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;


      return api(
        originalRequest
      );

    } catch (refreshError) {

      console.error(
        "Token refresh failed:",
        refreshError
      );


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