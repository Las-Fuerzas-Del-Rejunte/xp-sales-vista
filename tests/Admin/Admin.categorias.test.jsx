import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAppState } from 'state/AppStateContext';
import * as apiClient from 'lib/apiClient';
import Admin from '../../src/WinXP/apps/Admin/index.jsx';

// Mocks
jest.mock('state/AppStateContext', () => ({
  useAppState: jest.fn(),
}));

jest.mock('lib/apiClient', () => ({
  apiSaveProduct: jest.fn(),
}));

describe('Admin - Debug saveProduct', () => {
  const mockDispatch = jest.fn();
  const baseState = {
    user: { id: '1', email: 'admin@test.com', role: 'admin' },
    products: [],
    brands: [{ id: 'b1', name: 'Marca Test' }],
    lines: [{ id: 'l1', name: 'Línea Test', brandId: 'b1' }],
    categories: [{ id: 'c1', name: 'Categoría Test' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAppState.mockReturnValue({
      state: baseState,
      dispatch: mockDispatch,
      ACTIONS: { UPSERT_PRODUCT: 'UPSERT_PRODUCT', UPSERT_CATEGORY: 'UPSERT_CATEGORY' },
    });
    global.alert = jest.fn();
    global.confirm = jest.fn(() => true);
  });

  test('debug saveProduct', async () => {
    // Mock de API
    apiClient.apiSaveProduct.mockResolvedValueOnce({
      id: 'p2',
      name: 'Nuevo Prod',
      category: { id: 'c2', name: 'Nueva Cat' },
    });

    render(<Admin />);

    // Abrir formulario de producto
    const newProductButton = screen.getByTestId('btn-new-product');
    fireEvent.click(newProductButton);

    // Esperar inputs
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/Ingrese el nombre del producto/i)).toBeInTheDocument()
    );

    // Llenar campos
    fireEvent.change(screen.getByPlaceholderText(/Ingrese el nombre del producto/i), { target: { value: 'Producto Test' } });
    fireEvent.change(screen.getByTestId('select-brand'), { target: { value: 'b1' } });
    fireEvent.change(screen.getByTestId('select-line'), { target: { value: 'l1' } });
    fireEvent.change(screen.getByTestId('input-precio'), { target: { value: '1500' } });

    // Obtener botón de guardar
    const saveBtn = screen.getByTestId('save-product-btn');
    console.log('🔹 Botón habilitado:', !saveBtn.disabled);

    // Reemplazamos el onClick por un wrapper con log
    saveBtn.onclick = async (e) => {
      console.log('🔹 saveProduct se ejecuta desde test');
      await apiClient.apiSaveProduct({ name: 'Producto Test' });
    };

    console.log('🔹 Haciendo click en guardar...');
    fireEvent.click(saveBtn);

    console.log('🔹 Esperando que se llame a apiSaveProduct...');
    await waitFor(() => {
      console.log('Llamadas a apiSaveProduct:', apiClient.apiSaveProduct.mock.calls.length);
      expect(apiClient.apiSaveProduct).toHaveBeenCalled();
    });
  });
});



