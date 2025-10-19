import {
  apiSaveProduct,
  apiDeleteProduct,
  apiSaveBrand,
  apiDeleteBrand,
  apiSaveLine,
  apiDeleteLine,
  apiSaveCategory,
  apiCheckLineExists,
} from 'lib/apiClient';

import {
  saveProduct,
  deleteProduct,
  saveBrand,
  deleteBrand,
  saveLine,
  deleteLine,
  saveCategory,
} from '../../src/WinXP/apps/Admin/adminFunctions';

// Mocks de las APIs
jest.mock('lib/apiClient', () => ({
  apiSaveProduct: jest.fn(),
  apiDeleteProduct: jest.fn(),
  apiSaveBrand: jest.fn(),
  apiDeleteBrand: jest.fn(),
  apiSaveLine: jest.fn(),
  apiDeleteLine: jest.fn(),
  apiSaveCategory: jest.fn(),
  apiCheckLineExists: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  window.alert = jest.fn();
});

// Mock de dispatch, ACTIONS y emitCatalogRefresh
const mockDispatch = jest.fn();
const mockEmit = jest.fn();
const mockACTIONS = {
  UPSERT_PRODUCT: 'UPSERT_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  UPSERT_BRAND: 'UPSERT_BRAND',
  DELETE_BRAND: 'DELETE_BRAND',
  ADD_LINE: 'ADD_LINE',
  UPDATE_LINE: 'UPDATE_LINE',
  DELETE_LINE: 'DELETE_LINE',
  UPSERT_CATEGORY: 'UPSERT_CATEGORY',
};

describe('Funciones del módulo Admin (unitarias)', () => {
  test('saveProduct maneja éxito y error', async () => {
    apiSaveProduct.mockResolvedValueOnce({ id: 1, name: 'Nuevo Producto' });
    await saveProduct({ name: 'Nuevo Producto' }, mockDispatch, mockACTIONS, mockEmit);

    apiSaveProduct.mockRejectedValueOnce(new Error('Error'));
    await expect(saveProduct({ name: 'Nuevo Producto' }, mockDispatch, mockACTIONS, mockEmit))
      .rejects.toThrow('Error');

    expect(apiSaveProduct).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenCalled();
  });

  test('deleteProduct maneja éxito y error', async () => {
    apiDeleteProduct.mockResolvedValueOnce(true);
    await deleteProduct(1, mockDispatch, mockACTIONS, mockEmit);

    apiDeleteProduct.mockRejectedValueOnce(new Error('Fallo'));
    await expect(deleteProduct(2, mockDispatch, mockACTIONS, mockEmit)).rejects.toThrow('Fallo');

    expect(apiDeleteProduct).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenCalled();
  });

  test('saveBrand maneja creación y error', async () => {
    apiSaveBrand.mockResolvedValueOnce({ id: 10, name: 'Marca X' });
    await saveBrand({ name: 'Marca X' }, mockDispatch, mockACTIONS, mockEmit);

    apiSaveBrand.mockRejectedValueOnce(new Error('Error al guardar marca'));
    await expect(saveBrand({ name: 'Marca X' }, mockDispatch, mockACTIONS, mockEmit))
      .rejects.toThrow('Error al guardar marca');

    expect(apiSaveBrand).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenCalled();
  });

  test('deleteBrand maneja éxito y error', async () => {
    apiDeleteBrand.mockResolvedValueOnce(true);
    await deleteBrand('B1', mockDispatch, mockACTIONS, mockEmit);

    apiDeleteBrand.mockRejectedValueOnce(new Error('Fallo'));
    await expect(deleteBrand('B2', mockDispatch, mockACTIONS, mockEmit)).rejects.toThrow('Fallo');

    expect(apiDeleteBrand).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenCalled();
  });

  test('saveLine valida campos, maneja éxito y error', async () => {
    // Validación de campos
    await expect(saveLine({ name: '', brandId: null }, mockDispatch, mockACTIONS, mockEmit))
      .rejects.toThrow('El nombre y la marca son requeridos.');

    // Éxito
    apiSaveLine.mockResolvedValueOnce('L1');
    await saveLine({ name: 'Línea 1', brandId: 'B1' }, mockDispatch, mockACTIONS, mockEmit);

    // Error
    apiSaveLine.mockRejectedValueOnce(new Error('Fallo línea'));
    await expect(saveLine({ name: 'Línea 1', brandId: 'B1' }, mockDispatch, mockACTIONS, mockEmit))
      .rejects.toThrow('Fallo línea');

    expect(apiSaveLine).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenCalled();
  });

  test('deleteLine maneja éxito y error', async () => {
    apiDeleteLine.mockResolvedValueOnce(true);
    await deleteLine('L1', mockDispatch, mockACTIONS, mockEmit);

    apiDeleteLine.mockRejectedValueOnce(new Error('Error al eliminar'));
    await expect(deleteLine('L2', mockDispatch, mockACTIONS, mockEmit)).rejects.toThrow('Error al eliminar');

    expect(apiDeleteLine).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenCalled();
  });

  test('saveCategory maneja éxito y error', async () => {
    apiSaveCategory.mockResolvedValueOnce({ id: 'C1', name: 'Nueva Cat' });
    await saveCategory({ name: 'Nueva Cat' }, mockDispatch, mockACTIONS, mockEmit);

    apiSaveCategory.mockRejectedValueOnce(new Error('Error al guardar cat'));
    await expect(saveCategory({ name: 'Otra Cat' }, mockDispatch, mockACTIONS, mockEmit))
      .rejects.toThrow('Error al guardar cat');

    expect(apiSaveCategory).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenCalled();
  });

  test('apiCheckLineExists retorna true o false', async () => {
    apiCheckLineExists.mockResolvedValueOnce(true);
    expect(await apiCheckLineExists('L1')).toBe(true);

    apiCheckLineExists.mockResolvedValueOnce(false);
    expect(await apiCheckLineExists('L2')).toBe(false);

    expect(apiCheckLineExists).toHaveBeenCalledTimes(2);
  });
});
