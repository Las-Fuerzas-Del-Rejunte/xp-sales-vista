// lib/apiClient.js (mock)
export const fetchProducts = jest.fn();
export const fetchCategories = jest.fn();
export const fetchBrands = jest.fn();
export const fetchLines = jest.fn();
export const API_BASE_URL = 'http://mock-api';

// FUNCIONES ADICIONALES PARA TESTS
export const apiSaveProduct = jest.fn();
export const apiDeleteProduct = jest.fn();
export const apiSaveBrand = jest.fn();
export const apiDeleteBrand = jest.fn();
export const apiSaveCategory = jest.fn();
export const apiSaveLine = jest.fn();
export const apiDeleteLine = jest.fn();
export const fetchSalesByEmployee = jest.fn();
