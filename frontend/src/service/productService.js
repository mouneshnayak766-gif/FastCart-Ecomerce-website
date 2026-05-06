import API from "./api";

export const getAllProducts = () => API.get("/products");

export const getByCategory = (category) =>
  API.get(`/products/category/${category}`);