import axios from "axios";

export const api = axios.create({
  baseURL: "http://10.245.208.4:5177",
  timeout: 10000,
});

export default api;
