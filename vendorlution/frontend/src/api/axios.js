import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_BASE || "http://localhost:8000/api/";

const api = axios.create({
  baseURL,
});

export default api;
