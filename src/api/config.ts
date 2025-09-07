import axios, { AxiosError } from "axios";
import { Notification } from "../helpers/notification";

interface CustomError {
  message: string;
}

axios.defaults.baseURL = import.meta.env.DEV ? '' : (import.meta.env.VITE_BASE_URL || 'http://localhost:3000');
axios.defaults.withCredentials = true;

export function apiConfig() {
  async function getRequest(url: string, params: object = {}) {
    try {
      const res = await axios.get(url, { params });
      Notification("success", res.data.message || 'success');
      return res;
    } catch (error) {
      const axiosError = error as AxiosError<CustomError>;
      Notification("error", axiosError.response?.data.message || "Something went wrong");
    }
  }

  async function postRequest(url: string, body: object = {}) {
    try {
      const res = await axios.post(url, body);
      Notification("success", res.data.message);
      return res;
    } catch (error) {
      const axiosError = error as AxiosError<CustomError>;
      Notification("error", axiosError.response?.data.message || "Something went wrong");
    }
  }

  async function putRequest(url: string, body: object = {}) {
    try {
      const res = await axios.put(url, body);
      Notification("success", res.data.message);
      return res;
    } catch (error) {
      const axiosError = error as AxiosError<CustomError>;
      Notification("error", axiosError.response?.data.message || "Something went wrong");
    }
  }

  async function patchRequest(url: string, body: object = {}) {
    try {
      const res = await axios.patch(url, body);
      Notification("success", res.data.message);
      return res;
    } catch (error) {
      const axiosError = error as AxiosError<CustomError>;
      Notification("error", axiosError.response?.data.message || "Something went wrong");
    }
  }

  async function deleteRequest(url: string, params: object = {}) {
    try {
      const res = await axios.delete(url, { params });
      Notification("success", res.data.message);
      return res;
    } catch (error) {
      const axiosError = error as AxiosError<CustomError>;
      Notification("error", axiosError.response?.data.message || "Something went wrong");
    }
  }

  return {
    getRequest,
    postRequest,
    putRequest,
    deleteRequest,
    patchRequest
  };
}
