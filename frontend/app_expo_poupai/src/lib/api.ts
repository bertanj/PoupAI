import axios from "axios";


const baseURL = "http://192.168.1.8:5177";

export const api = axios.create({ baseURL, timeout: 10000 });
export default api;
