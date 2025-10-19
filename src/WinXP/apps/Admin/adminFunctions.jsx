// src/adminFunctions.js
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

// Producto
export async function saveProduct(payload, dispatch, ACTIONS, emitCatalogRefresh) {
  try {
    const saved = await apiSaveProduct(payload);
    const stateProduct = {
      id: saved?.id || payload.id,
      name: saved?.name ?? payload.name,
      description: saved?.description ?? payload.description,
      category: saved?.category?.name ?? saved?.category ?? payload.category,
      categoryId: saved?.categoryId ?? saved?.category_id ?? saved?.category?.id,
      brandId: saved?.brandId ?? saved?.brand_id ?? payload.brandId,
      lineId: saved?.lineId ?? saved?.line_id ?? payload.lineId,
      price: Number(saved?.price ?? payload.price ?? 0),
      image: saved?.image ?? payload.image ?? '',
      stock_quantity: Number(saved?.stockQuantity ?? payload.stockQuantity ?? 0),
      min_stock: Number(saved?.minStock ?? payload.minStock ?? 0),
    };
    dispatch({ type: ACTIONS.UPSERT_PRODUCT, payload: stateProduct });
    emitCatalogRefresh?.();
    return saved;
  } catch (error) {
    console.error('Error guardando producto:', error);
    throw error;
  }
}

export async function deleteProduct(id, dispatch, ACTIONS, emitCatalogRefresh) {
  await apiDeleteProduct(id);
  dispatch({ type: ACTIONS.DELETE_PRODUCT, payload: id });
  emitCatalogRefresh?.();
}

// Marca
export async function saveBrand(payload, dispatch, ACTIONS, emitCatalogRefresh) {
  const saved = await apiSaveBrand(payload);
  const stateBrand = {
    id: saved?.id || payload.id,
    name: saved?.name ?? payload.name,
    description: saved?.description ?? payload.description ?? '',
    logo: saved?.logo ?? payload.logo ?? '',
  };
  dispatch({ type: ACTIONS.UPSERT_BRAND, payload: stateBrand });
  emitCatalogRefresh?.();
  return saved;
}

export async function deleteBrand(id, dispatch, ACTIONS, emitCatalogRefresh) {
  await apiDeleteBrand(id);
  dispatch({ type: ACTIONS.DELETE_BRAND, payload: id });
  emitCatalogRefresh?.();
}

// Línea
export async function saveLine(payload, dispatch, ACTIONS, emitCatalogRefresh) {
  if (!payload.name || !payload.brandId) throw new Error('El nombre y la marca son requeridos.');
  const savedId = await apiSaveLine(payload);
  const stateLine = {
    id: savedId || payload.id,
    name: payload.name,
    description: payload.description,
    brandId: payload.brandId,
  };
  if (payload.id) {
    dispatch({ type: 'UPDATE_LINE', payload: stateLine });
  } else {
    dispatch({ type: ACTIONS.ADD_LINE, payload: stateLine });
  }
  emitCatalogRefresh?.();
  return savedId;
}

export async function deleteLine(id, dispatch, ACTIONS, emitCatalogRefresh) {
  await apiDeleteLine(id);
  dispatch({ type: ACTIONS.DELETE_LINE, payload: id });
  emitCatalogRefresh?.();
}

// Categoría
export async function saveCategory(category, dispatch, ACTIONS, emitCatalogRefresh) {
  const saved = await apiSaveCategory(category);
  dispatch({ type: ACTIONS.UPSERT_CATEGORY, payload: saved });
  emitCatalogRefresh?.();
  return saved;
}
