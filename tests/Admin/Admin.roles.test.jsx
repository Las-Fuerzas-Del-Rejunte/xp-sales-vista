import React from 'react';
import { render, screen } from '@testing-library/react';
import { useAppState } from 'state/AppStateContext';
import Admin from '../../src/WinXP/apps/Admin/index.jsx';

jest.mock('state/AppStateContext', () => ({
  useAppState: jest.fn(),
}));

jest.mock('components/WindowDropDowns', () => () => <div>MockDropdown</div>);

describe('Admin - control de roles y renderizado', () => {
  const mockDispatch = jest.fn();

  const baseState = {
    products: [],
    brands: [],
    lines: [],
    categories: [],
  };

  const PLACEHOLDER_ROLE = 'anon'; // reemplazar según lo que esté definido en PLACEHOLDER_ROLES

  beforeEach(() => jest.clearAllMocks());

  test('renderiza mensaje de carga si no hay usuario', () => {
    useAppState.mockReturnValue({
      state: { ...baseState, user: null },
      dispatch: mockDispatch,
      ACTIONS: {},
    });
    render(<Admin />);
    expect(screen.getByText(/Cargando sesión/i)).toBeInTheDocument();
  });

  test('muestra panel de administración si el usuario es admin', () => {
    useAppState.mockReturnValue({
      state: { ...baseState, user: { id: '1', email: 'admin@test.com', role: 'admin' } },
      dispatch: mockDispatch,
      ACTIONS: {},
    });
    render(<Admin />);
    expect(screen.getByText(/Administrador/i)).toBeInTheDocument();
    // Si hay múltiples "Productos", tomamos el primero
    expect(screen.getAllByText(/Productos/i)[0]).toBeInTheDocument();
  });

  test('muestra acceso restringido si es empleado', () => {
    useAppState.mockReturnValue({
      state: { ...baseState, user: { id: '2', email: 'empleado@test.com', role: 'empleado' } },
      dispatch: mockDispatch,
      ACTIONS: {},
    });
    render(<Admin />);
    expect(screen.getByText(/Acceso Denegado/i)).toBeInTheDocument();
    expect(screen.getByText(/Los empleados no tienen acceso/i)).toBeInTheDocument();
  });

  test('muestra autenticación requerida si no es admin ni empleado', () => {
    useAppState.mockReturnValue({
      state: { ...baseState, user: { id: '3', email: 'anon@test.com', role: 'anon' } },
      dispatch: mockDispatch,
      ACTIONS: {},
    });
    render(<Admin />);
    expect(screen.getByText(/Autenticación Requerida/i)).toBeInTheDocument();
  });
});
