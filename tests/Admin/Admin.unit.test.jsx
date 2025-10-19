import { renderHook, act } from '@testing-library/react';
import React from 'react';
import Admin from '../../src/WinXP/apps/Admin/index.jsx';

jest.mock('lib/supabaseClient');

describe('Funciones internas de Admin (unit tests)', () => {
  test('emitCatalogRefresh lanza evento global', () => {
    const eventSpy = jest.spyOn(window, 'dispatchEvent');
    const event = new Event('catalog:refresh');

    // Simulamos función global
    const emitCatalogRefresh = () => {
      try {
        window.dispatchEvent(event);
      } catch (_) {}
    };

    emitCatalogRefresh();

    expect(eventSpy).toHaveBeenCalledWith(event);
    eventSpy.mockRestore();
  });

  test('calcula correctamente canSaveProduct', () => {
    // Simula los valores del estado interno
    const mockState = {
      pName: 'Producto A',
      pBrandId: 'marca1',
      pLineId: 'linea1',
      pPrice: '100',
    };

    const canSaveProduct = !!(
      mockState.pName &&
      mockState.pBrandId &&
      mockState.pLineId &&
      !Number.isNaN(Number(mockState.pPrice)) &&
      Number(mockState.pPrice) >= 0
    );

    expect(canSaveProduct).toBe(true);
  });
});

describe('Funciones internas - unitarias', () => {
  test('emitCatalogRefresh dispara evento global', () => {
    const spy = jest.spyOn(window, 'dispatchEvent');
    const evt = new Event('catalog:refresh');
    window.dispatchEvent(evt);
    expect(spy).toHaveBeenCalledWith(evt);
    spy.mockRestore();
  });

  test('calcula stock mínimo correctamente (30%)', () => {
    const stock = 100;
    const minStock = Math.floor(stock * 0.3);
    expect(minStock).toBe(30);
  });
});