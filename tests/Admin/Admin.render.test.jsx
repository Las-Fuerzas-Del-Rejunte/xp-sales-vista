import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAppState } from 'state/AppStateContext';
import Admin from '../../src/WinXP/apps/Admin/index.jsx';

jest.mock('state/AppStateContext', () => ({
  useAppState: jest.fn(),
}));

jest.mock('components/WindowDropDowns', () => () => <div>MockDropdown</div>);

describe('Admin component rendering', () => {
  const baseState = {
    user: { id: '1', email: 'admin@test.com', role: 'admin' },
    products: [],
    brands: [],
    lines: [],
    categories: [],
  };
  const mockDispatch = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  test('muestra “Cargando sesión…” sin usuario', () => {
    useAppState.mockReturnValue({
      state: { user: null, products: [], brands: [], lines: [], categories: [] },
      dispatch: mockDispatch,
      ACTIONS: {},
    });
    render(<Admin />);
    expect(screen.getByText(/Cargando sesión/i)).toBeInTheDocument();
  });

  test('muestra panel de administración si el rol es admin', () => {
    useAppState.mockReturnValue({ state: baseState, dispatch: mockDispatch, ACTIONS: {} });
    render(<Admin />);
    expect(screen.getByText(/Administrador/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Productos/i).length).toBeGreaterThan(0);
  });

  test('muestra acceso restringido si el rol es empleado', () => {
    useAppState.mockReturnValue({
      state: { ...baseState, user: { id: '2', email: 'empleado@test.com', role: 'empleado' } },
      dispatch: mockDispatch,
      ACTIONS: {},
    });
    render(<Admin />);
    expect(screen.getByText(/Acceso Denegado/i)).toBeInTheDocument();
  });

  test('muestra autenticación requerida si el rol no es admin ni empleado', () => {
    useAppState.mockReturnValue({
      state: { ...baseState, user: { id: '3', email: 'anon@test.com', role: 'anon' } },
      dispatch: mockDispatch,
      ACTIONS: {},
    });
    render(<Admin />);
    expect(screen.getByText(/Autenticación Requerida/i)).toBeInTheDocument();
  });

  test('permite cambiar pestañas (products, brands, sales)', () => {
    useAppState.mockReturnValue({ state: baseState, dispatch: mockDispatch, ACTIONS: {} });
    render(<Admin />);
    const brandsButton = screen.getByText('Marcas');
    fireEvent.click(brandsButton);
    expect(brandsButton.closest('.com__function_bar__button')).toHaveClass('com__function_bar__button--active');
  });
});
