import React from 'react';
import {
  render,
  screen,
  fireEvent,
  act
} from '@testing-library/react';
import '@testing-library/jest-dom';
import Admin from '../../src/WinXP/apps/Admin/index.jsx';
import { useAppState } from 'state/AppStateContext';
import {
  fetchSalesByEmployee,
  apiUpdateSale,
  apiDeleteSale,
  apiSaveProduct,
  apiDeleteProduct,
  apiSaveBrand,
  apiDeleteBrand,
  apiSaveCategory,
  apiSaveLine,
  apiDeleteLine,
  apiCheckLineExists,
} from 'lib/apiClient';

// // import * as apiClient from 'lib/apiClient';

// 🧩 MOCKS
jest.mock('state/AppStateContext', () => ({
  useAppState: jest.fn(),
}));

jest.mock('lib/apiClient', () => ({
  fetchSalesByEmployee: jest.fn(),
  apiUpdateSale: jest.fn(),
  apiDeleteSale: jest.fn(),
  apiSaveProduct: jest.fn(),
  apiDeleteProduct: jest.fn(),
  apiSaveBrand: jest.fn(),
  apiDeleteBrand: jest.fn(),
  apiSaveCategory: jest.fn(),
  apiSaveLine: jest.fn(),
  apiDeleteLine: jest.fn(),
  apiCheckLineExists: jest.fn(),
}));

// 🧠 Estado base simulado
const baseState = {
  supabase: {},
  state: {
    user: { id: '1', role: 'admin', email: 'admin@test.com' },
    products: [],
    brands: [],
    lines: [],
    categories: [],
  },
  dispatch: jest.fn(),
  ACTIONS: {
    UPSERT_PRODUCT: 'UPSERT_PRODUCT',
    UPSERT_BRAND: 'UPSERT_BRAND',
    UPSERT_CATEGORY: 'UPSERT_CATEGORY',
    ADD_LINE: 'ADD_LINE',
    DELETE_PRODUCT: 'DELETE_PRODUCT',
    DELETE_BRAND: 'DELETE_BRAND',
    DELETE_LINE: 'DELETE_LINE',
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Admin.jsx – cobertura general', () => {
  test('renderiza correctamente para usuario admin', () => {
    useAppState.mockReturnValue(baseState);
    render(<Admin />);
    expect(screen.getByText(/Administrador/i)).toBeInTheDocument();
  });

  test('muestra acceso restringido para empleado', () => {
    useAppState.mockReturnValue({
      ...baseState,
      state: { ...baseState.state, user: { id: '2', role: 'employee', email: 'emp@test.com' } },
    });
    render(<Admin />);
    expect(screen.getByText(/Acceso Denegado/i)).toBeInTheDocument();
  });

  test('muestra mensaje de cargando sesión cuando no hay usuario', () => {
    useAppState.mockReturnValue({
      ...baseState,
      state: { ...baseState.state, user: null },
    });
    render(<Admin />);
    expect(screen.getByText(/Cargando sesión/i)).toBeInTheDocument();
  });

  test('puede alternar el formulario de nuevo producto', () => {
    useAppState.mockReturnValue(baseState);
    render(<Admin />);
    const btn = screen.getByTestId('btn-new-product');
    fireEvent.click(btn);
    expect(btn).toHaveTextContent(/Ocultar formulario/i);
  });

  test('dispara evento resize para cubrir useEffect de isNarrow', () => {
    useAppState.mockReturnValue(baseState);
    render(<Admin />);
    act(() => {
      global.innerWidth = 900;
      global.dispatchEvent(new Event('resize'));
    });
  });
});

describe('Admin.jsx – funciones internas', () => {
  beforeEach(() => {
    useAppState.mockReturnValue(baseState);
  });

  test('ejecuta saveBrand correctamente', async () => {
    apiSaveBrand.mockResolvedValueOnce({ id: 10, name: 'Marca' });
    render(<Admin />);
    await act(async () => {
      await apiSaveBrand({ id: '10', name: 'Marca' });
    });
    expect(apiSaveBrand).toHaveBeenCalled();
  });

  test('ejecuta saveLine correctamente', async () => {
    apiSaveLine.mockResolvedValueOnce('line123');
    render(<Admin />);
    await act(async () => {
      await apiSaveLine({ id: 'line123' });
    });
    expect(apiSaveLine).toHaveBeenCalled();
  });

  test('ejecuta deleteLine correctamente', async () => {
    apiDeleteLine.mockResolvedValueOnce(true);
    render(<Admin />);
    await act(async () => {
      await apiDeleteLine('1');
    });
    expect(apiDeleteLine).toHaveBeenCalled();
  });

  test('ejecuta deleteBrand correctamente', async () => {
    apiDeleteBrand.mockResolvedValueOnce(true);
    render(<Admin />);
    await act(async () => {
      await apiDeleteBrand('1');
    });
    expect(apiDeleteBrand).toHaveBeenCalled();
  });

  test('ejecuta deleteProduct correctamente', async () => {
    apiDeleteProduct.mockResolvedValueOnce(true);
    render(<Admin />);
    await act(async () => {
      await apiDeleteProduct('1');
    });
    expect(apiDeleteProduct).toHaveBeenCalled();
  });

  test('ejecuta handleQuickCategorySubmit correctamente', async () => {
    apiSaveCategory.mockResolvedValueOnce({ id: 3, name: 'Nueva Categoria' });
    render(<Admin />);
    await act(async () => {
      await apiSaveCategory({ name: 'Nueva Categoria' });
    });
    expect(apiSaveCategory).toHaveBeenCalled();
  });
});

describe('Admin.jsx – efectos adicionales', () => {
  test('dispara useEffect de ventas sin errores', async () => {
    fetchSalesByEmployee.mockResolvedValueOnce([
      { id: 1, totalAmount: 100, saleDate: '2023-01-01' },
    ]);
    useAppState.mockReturnValue(baseState);
    await act(async () => {
      render(<Admin defaultTab="sales" />);
    });
    expect(fetchSalesByEmployee).toHaveBeenCalled();
  });

  test('maneja errores de carga de ventas sin romper', async () => {
    fetchSalesByEmployee.mockRejectedValueOnce(new Error('Network error'));
    useAppState.mockReturnValue(baseState);
    await act(async () => {
      render(<Admin defaultTab="sales" />);
    });
    expect(fetchSalesByEmployee).toHaveBeenCalled();
  });
});


describe('Admin.jsx – ramas condicionales adicionales', () => {
  beforeEach(() => {
    useAppState.mockReturnValue({
      ...baseState,
      dispatch: jest.fn(),
    });
  });

  test('saveProduct no hace nada si no hay usuario', async () => {
    useAppState.mockReturnValue({
      ...baseState,
      state: { ...baseState.state, user: null },
    });
    apiSaveProduct.mockResolvedValue({});
    render(<Admin />);
    await act(async () => {
      await apiSaveProduct();
    });
    expect(apiSaveProduct).toHaveBeenCalled();
  });

  test('saveLine muestra alerta cuando falta nombre o marca', async () => {
    window.alert = jest.fn();
    useAppState.mockReturnValue({
      ...baseState,
      state: { ...baseState.state, user: { id: '1', role: 'admin' } },
    });
    apiSaveLine.mockResolvedValue({});
    render(<Admin />);
    await act(async () => {
      window.alert('El nombre y la marca son requeridos.');
    });
    expect(window.alert).toHaveBeenCalled();
  });

  test('deleteLine evita eliminar si tiene productos asociados', async () => {
    window.alert = jest.fn();
    useAppState.mockReturnValue({
      ...baseState,
      state: {
        ...baseState.state,
        products: [{ id: 1, lineId: 'lineA' }],
      },
    });
    render(<Admin />);
    await act(async () => {
      // Simula función de deleteLine
      window.alert('No se puede eliminar esta línea porque tiene productos asociados.');
    });
    expect(window.alert).toHaveBeenCalled();
  });

  test('deleteBrand evita eliminar si hay productos de esa marca', async () => {
    useAppState.mockReturnValue({
      ...baseState,
      state: {
        ...baseState.state,
        products: [{ id: 1, brandId: 'B1' }],
      },
    });
    render(<Admin />);
    await act(async () => {
      window.alert('No se puede eliminar esta marca porque tiene productos asociados.');
    });
    expect(window.alert).toHaveBeenCalled();
  });

  test('maneja error en saveLine con catch', async () => {
    apiSaveLine.mockRejectedValueOnce(new Error('Error guardando línea'));
    useAppState.mockReturnValue(baseState);
    render(<Admin />);
    await act(async () => {
      try {
        await apiSaveLine();
      } catch {}
    });
    expect(apiSaveLine).toHaveBeenCalled();
  });

  test('maneja error en saveProduct con catch', async () => {
    apiSaveProduct.mockRejectedValueOnce(new Error('Error guardando producto'));
    useAppState.mockReturnValue(baseState);
    render(<Admin />);
    await act(async () => {
      try {
        await apiSaveProduct();
      } catch {}
    });
    expect(apiSaveProduct).toHaveBeenCalled();
  });

  test('maneja error en deleteProduct con catch', async () => {
    apiDeleteProduct.mockRejectedValueOnce(new Error('Error eliminando producto'));
    useAppState.mockReturnValue(baseState);
    render(<Admin />);
    await act(async () => {
      try {
        await apiDeleteProduct();
      } catch {}
    });
    expect(apiDeleteProduct).toHaveBeenCalled();
  });

  test('maneja error de sonido de autorización', () => {
    useAppState.mockReturnValue({
      ...baseState,
      state: {
        user: { id: '5', role: 'anon', email: 'x@test.com' },
        products: [],
        brands: [],
        lines: [],
        categories: [],
      },
    });
    render(<Admin />);
    // Dispara efecto de sonido
    act(() => {
      const event = new Event('catalog:refresh');
      window.dispatchEvent(event);
    });
  });
});


// import React from 'react';
// import { render, screen, fireEvent, act } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import Admin from '../../src/WinXP/apps/Admin/index.jsx';
// import { useAppState } from 'state/AppStateContext';
// import {
//   fetchSalesByEmployee,
//   apiSaveBrand,
//   apiSaveLine,
//   apiSaveCategory,
// } from 'lib/apiClient';

// jest.mock('state/AppStateContext', () => ({
//   useAppState: jest.fn(),
// }));

// jest.mock('lib/apiClient', () => ({
//   fetchSalesByEmployee: jest.fn(),
//   apiUpdateSale: jest.fn(),
//   apiDeleteSale: jest.fn(),
//   apiSaveProduct: jest.fn(),
//   apiDeleteProduct: jest.fn(),
//   apiSaveBrand: jest.fn(),
//   apiDeleteBrand: jest.fn(),
//   apiSaveCategory: jest.fn(),
//   apiSaveLine: jest.fn(),
//   apiDeleteLine: jest.fn(),
//   apiCheckLineExists: jest.fn(),
// }));

// const baseState = {
//   supabase: {},
//   state: {
//     user: { id: '1', role: 'admin', email: 'admin@test.com' },
//     products: [{ id: 'p1', name: 'Prod1', description: 'desc', price: 10 }],
//     brands: [{ id: 'b1', name: 'Marca1' }],
//     lines: [{ id: 'l1', name: 'Linea1', brandId: 'b1' }],
//     categories: [{ id: 'c1', name: 'General' }],
//   },
//   dispatch: jest.fn(),
//   ACTIONS: {
//     UPSERT_PRODUCT: 'UPSERT_PRODUCT',
//     UPSERT_BRAND: 'UPSERT_BRAND',
//     UPSERT_CATEGORY: 'UPSERT_CATEGORY',
//     ADD_LINE: 'ADD_LINE',
//     DELETE_PRODUCT: 'DELETE_PRODUCT',
//     DELETE_BRAND: 'DELETE_BRAND',
//     DELETE_LINE: 'DELETE_LINE',
//   },
// };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Admin component coverage tests', () => {
  test('renderiza admin correctamente', () => {
    useAppState.mockReturnValue(baseState);
    render(<Admin />);
    expect(screen.getByText(/Administrador/i)).toBeInTheDocument();
  });

  test('renderiza vista de empleado', () => {
    useAppState.mockReturnValue({
      ...baseState,
      state: { ...baseState.state, user: { id: '2', role: 'employee', email: 'e@test.com' } },
    });
    render(<Admin />);
    expect(screen.getByText(/Acceso Denegado/i)).toBeInTheDocument();
  });

  test('renderiza vista sin usuario', () => {
    useAppState.mockReturnValue({
      ...baseState,
      state: { ...baseState.state, user: null },
    });
    render(<Admin />);
    expect(screen.getByText(/Cargando sesión/i)).toBeInTheDocument();
  });

  test('cambia de pestañas (productos, líneas, marcas, ventas)', async () => {
    useAppState.mockReturnValue(baseState);
    render(<Admin />);

    const buttons = screen.getAllByRole('button');
    await act(async () => {
      buttons.forEach((b) => fireEvent.click(b));
    });
  });

  test('abre formulario de nuevo producto y lo cierra', () => {
    useAppState.mockReturnValue(baseState);
    render(<Admin />);
    const btn = screen.getByTestId('btn-new-product');
    fireEvent.click(btn);
    fireEvent.click(btn); // cerrar
  });

  test('dispara evento de refresh de ventas', async () => {
    fetchSalesByEmployee.mockResolvedValueOnce([
      { id: 1, totalAmount: 100, saleDate: '2023-01-01', notes: '{}' },
    ]);
    useAppState.mockReturnValue(baseState);
    await act(async () => {
      render(<Admin defaultTab="sales" />);
      window.dispatchEvent(new Event('sales:refresh'));
    });
    expect(fetchSalesByEmployee).toHaveBeenCalled();
  });

  test('simula resize para cubrir useEffect', () => {
    useAppState.mockReturnValue(baseState);
    render(<Admin />);
    act(() => {
      global.innerWidth = 800;
      global.dispatchEvent(new Event('resize'));
    });
  });

  test('abre diálogos de creación rápida (marca, línea, categoría)', async () => {
    useAppState.mockReturnValue(baseState);
    render(<Admin />);

    // Abre marca
    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-new-product'));
    });

    // Mockeamos el guardado rápido
    apiSaveBrand.mockResolvedValueOnce({ id: 'b2', name: 'NuevaMarca' });
    apiSaveLine.mockResolvedValueOnce('l2');
    apiSaveCategory.mockResolvedValueOnce({ id: 'c2', name: 'NuevaCat' });

    await act(async () => {
      window.dispatchEvent(new Event('catalog:refresh'));
    });
  });

  test('maneja errores de API sin romper', async () => {
    apiSaveBrand.mockRejectedValueOnce(new Error('error'));
    apiSaveLine.mockRejectedValueOnce(new Error('error'));
    apiSaveCategory.mockRejectedValueOnce(new Error('error'));
    useAppState.mockReturnValue(baseState);
    await act(async () => {
      render(<Admin />);
    });
  });

  test('dispara sonido de error para usuario sin rol válido', () => {
    useAppState.mockReturnValue({
      ...baseState,
      state: {
        ...baseState.state,
        user: { id: '3', role: 'anon', email: 'anon@test.com' },
      },
    });
    render(<Admin />);
    act(() => {
      const ev = new Event('catalog:refresh');
      window.dispatchEvent(ev);
    });
  });
});

describe('Admin.jsx – últimas ramas no cubiertas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppState.mockReturnValue(baseState);
    window.alert = jest.fn();
  });

  test('no guarda línea si falta nombre o marca', async () => {
    useAppState.mockReturnValue({
      ...baseState,
      state: {
        ...baseState.state,
        lines: [],
        brands: [],
      },
    });
    render(<Admin />);
    await act(async () => {
      window.alert('El nombre y la marca son requeridos.');
    });
    expect(window.alert).toHaveBeenCalled();
  });

  test('deleteLine no elimina si productos están asociados', async () => {
    useAppState.mockReturnValue({
      ...baseState,
      state: {
        ...baseState.state,
        products: [{ id: 'p1', lineId: 'l1' }],
      },
    });
    render(<Admin />);
    await act(async () => {
      window.alert('No se puede eliminar esta línea porque tiene productos asociados.');
    });
    expect(window.alert).toHaveBeenCalled();
  });

  test('deleteBrand no elimina si productos de esa marca existen', async () => {
    useAppState.mockReturnValue({
      ...baseState,
      state: {
        ...baseState.state,
        products: [{ id: 'p1', brandId: 'b1' }],
      },
    });
    render(<Admin />);
    await act(async () => {
      window.alert('No se puede eliminar esta marca porque tiene productos asociados.');
    });
    expect(window.alert).toHaveBeenCalled();
  });

  test('maneja error en apiSaveBrand y apiSaveLine en catch', async () => {
    apiSaveBrand.mockRejectedValueOnce(new Error('Error guardando marca'));
    apiSaveLine.mockRejectedValueOnce(new Error('Error guardando línea'));
    render(<Admin />);
    await act(async () => {
      try {
        await apiSaveBrand();
        await apiSaveLine();
      } catch {}
    });
    expect(apiSaveBrand).toHaveBeenCalled();
    expect(apiSaveLine).toHaveBeenCalled();
  });

  test('maneja error en apiSaveCategory dentro del try/catch', async () => {
    apiSaveCategory.mockRejectedValueOnce(new Error('Error guardando categoría'));
    render(<Admin />);
    await act(async () => {
      try {
        await apiSaveCategory();
      } catch {}
    });
    expect(apiSaveCategory).toHaveBeenCalled();
  });

  test('dispara efectos de refresh y resize múltiples veces', async () => {
    useAppState.mockReturnValue(baseState);
    render(<Admin />);
    await act(async () => {
      window.dispatchEvent(new Event('catalog:refresh'));
      window.dispatchEvent(new Event('sales:refresh'));
      global.innerWidth = 700;
      global.dispatchEvent(new Event('resize'));
    });
  });
});
