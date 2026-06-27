import axios from "axios";

const api = axios.create({
  baseURL: "https://nexmeeting.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nexmeet_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("nexmeet_token");
      localStorage.removeItem("nexmeet_user");
      window.location.href = "/auth";
    }
    return Promise.reject(err);
  }
);

export default api;

// import axios from "axios";

// const api = axios.create({
//   baseURL: `${import.meta.env.VITE_API_URL}/api`,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Attach JWT token to every request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("nexmeet_token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Handle 401 globally
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem("nexmeet_token");
//       localStorage.removeItem("nexmeet_user");
//       window.location.href = "/auth";
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;
