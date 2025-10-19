import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { useAppState } from 'state/AppStateContext';
import * as apiClient from 'lib/apiClient';
import Admin from '../../src/WinXP/apps/Admin/index.jsx';

jest.mock('state/AppStateContext', () => ({
  useAppState: jest.fn(),
}));

jest.mock('components/WindowDropDowns', () => () => <div>MockDropdown</div>);

// 👇 Mock explícito de las funciones del cliente API
jest.mock('lib/apiClient', () => ({
  apiSaveBrand: jest.fn(),
  apiSaveLine: jest.fn(),
  apiDeleteLine: jest.fn(),
}));

describe('Admin - gestión de marcas y líneas', () => {
  const mockDispatch = jest.fn();
  const baseState = {
    user: { id: '1', email: 'admin@test.com', role: 'admin' },
    products: [],
    brands: [{ id: 'b1', name: 'Nike' }],
    lines: [{ id: 'l1', name: 'Air', brandId: 'b1' }],
    categories: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAppState.mockReturnValue({
      state: baseState,
      dispatch: mockDispatch,
      ACTIONS: {
        UPSERT_BRAND: 'UPSERT_BRAND',
        UPSERT_LINE: 'UPSERT_LINE',
        DELETE_BRAND: 'DELETE_BRAND',
        DELETE_LINE: 'DELETE_LINE',
      },
    });
  });

  test('guarda marca correctamente', async () => {
    apiClient.apiSaveBrand.mockResolvedValueOnce({ id: 'b2', name: 'Adidas' });
    render(<Admin />);
    await waitFor(() => expect(apiClient.apiSaveBrand).not.toThrow());
  });

  test('guarda línea correctamente', async () => {
    apiClient.apiSaveLine.mockResolvedValueOnce('l2');
    render(<Admin />);
    await waitFor(() => expect(apiClient.apiSaveLine).not.toThrow());
  });

  test('elimina línea correctamente', async () => {
    global.confirm = jest.fn(() => true);
    apiClient.apiDeleteLine.mockResolvedValueOnce({});
    render(<Admin />);
    await waitFor(() => expect(apiClient.apiDeleteLine).not.toThrow());
  });
});
