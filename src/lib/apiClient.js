import { getSupabaseClient } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function buildUrl(path) {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL no esta configurada.');
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

async function resolveAccessToken() {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? null;
  } catch (_error) {
    return null;
  }
}

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (_error) {
    return null;
  }
}

export async function apiFetch(path, { method = 'GET', body, headers } = {}) {
  const token = await resolveAccessToken();
  const url = buildUrl(path);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const finalHeaders = {
    ...(headers || {}),
  };
  if (token && !finalHeaders.Authorization) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }
  if (!isFormData && body !== undefined && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await parseJsonSafe(response);
    const message = errorBody?.message || errorBody?.error || `Error ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return parseJsonSafe(response);
}

const mapBrand = (raw) => ({
  id: raw?.id ?? null,
  userId: raw?.userId ?? raw?.user_id ?? null,
  name: raw?.name ?? '',
  description: raw?.description ?? '',
  logo: raw?.logo ?? '',
});

const mapCategory = (raw) => ({
  id: raw?.id ?? null,
  userId: raw?.userId ?? raw?.user_id ?? null,
  name: raw?.name ?? raw?.title ?? raw?.label ?? '',
  description: raw?.description ?? '',
  slug: raw?.slug ?? null,
});

const mapProduct = (raw) => ({
  id: raw?.id ?? null,
  userId: raw?.userId ?? raw?.user_id ?? null,
  brandId: raw?.brandId ?? raw?.brand_id ?? '',
  lineId: raw?.lineId ?? raw?.line_id ?? null,
  categoryId: raw?.categoryId ?? raw?.category_id ?? null,
  name: raw?.name ?? '',
  description: raw?.description ?? '',
  category: raw?.category?.name ?? raw?.category ?? 'general',
  price: Number(raw?.price ?? 0),
  image: raw?.image ?? '',
  stockQuantity: Number(raw?.stockQuantity ?? raw?.stock_quantity ?? 0),
  minStock: Number(raw?.minStock ?? raw?.min_stock ?? 0),
});

const mapSale = (raw) => ({
  id: raw?.id ?? null,
  employeeId: raw?.employeeId ?? raw?.employee_id ?? null,
  customerId: raw?.clientId ?? raw?.client_id ?? null,
  customerName: raw?.customerName ?? raw?.customer_name ?? null,
  totalAmount: Number(raw?.totalAmount ?? raw?.total_amount ?? 0),
  saleDate: raw?.saleDate ?? raw?.sale_date ?? null,
  notes: raw?.notes ?? null,
  items: Array.isArray(raw?.items ?? raw?.sale_items) ? raw.items ?? raw.sale_items : [],
});

export async function fetchBrands() {
  const data = await apiFetch('/api/brands');
  return Array.isArray(data) ? data.map(mapBrand) : [];
}

export async function fetchCategories() {
  const data = await apiFetch('/api/categories');
  return Array.isArray(data) ? data.map(mapCategory) : [];
}

export async function fetchLines() {
  const data = await apiFetch('/api/lines');
  return Array.isArray(data) ? data : [];
}

export async function fetchProducts() {
  const data = await apiFetch('/api/products');
  return Array.isArray(data) ? data.map(mapProduct) : [];
}

export async function saveBrand(payload) {
  const body = {
    name: payload.name,
    description: payload.description ?? '',
    logo: payload.logo ?? '',
    userId: payload.userId,
  };
  const endpoint = payload.id ? `/api/brands/${payload.id}` : '/api/brands';
  const method = payload.id ? 'PUT' : 'POST';
  const result = await apiFetch(endpoint, { method, body });
  return mapBrand(result || { ...body, id: payload.id });
}

export async function checkLineExists(name, brandId) {
  const response = await apiFetch(
    `/api/lines/check/name?name=${encodeURIComponent(name)}&brandId=${brandId}`
  );
  return response?.exists ?? false;
}

export async function saveLine(payload) {
  const body = {
    name: payload.name,
    brandId: payload.brandId,
  };
  
  // Solo incluir description si existe
  if (payload.description) {
    body.description = payload.description;
  }
  
  const endpoint = payload.id ? `/api/lines/${payload.id}` : '/api/lines';
  const method = payload.id ? 'PUT' : 'POST';
  const result = await apiFetch(endpoint, { method, body });
  return result?.id;
}

export async function saveCategory(payload) {
  const body = {
    name: payload.name,
    description: payload.description ?? '',
  };
  const endpoint = payload.id ? `/api/categories/${payload.id}` : '/api/categories';
  const method = payload.id ? 'PUT' : 'POST';
  const result = await apiFetch(endpoint, { method, body });
  return mapCategory(result || { ...body, id: payload.id });
}

export async function deleteBrand(id) {
  await apiFetch(`/api/brands/${id}`, { method: 'DELETE' });
}

export async function deleteCategory(id) {
  await apiFetch(`/api/categories/${id}`, { method: 'DELETE' });
}

export async function deleteLine(id) {
  await apiFetch(`/api/lines/${id}`, { method: 'DELETE' });
}

export async function saveProduct(payload) {
  const body = {
    userId: payload.userId,
    brandId: payload.brandId,
    lineId: payload.lineId ?? null,
    name: payload.name,
    description: payload.description ?? '',
    price: Number(payload.price ?? 0),
    image: payload.image ?? '',
    stockQuantity: Number(payload.stockQuantity ?? 0),
    minStock: Number(payload.minStock ?? 0),
  };
  
  // Si existe categoryId, usarlo. Si no, usar newCategory para crear una nueva
  if (payload.categoryId) {
    body.categoryId = payload.categoryId;
  } else if (payload.newCategory) {
    body.newCategory = payload.newCategory;
  }
  
  const endpoint = payload.id ? `/api/products/${payload.id}` : '/api/products';
  const method = payload.id ? 'PUT' : 'POST';
  const result = await apiFetch(endpoint, { method, body });
  const merged = result || { ...body, id: payload.id };
  return mapProduct(merged);
}

export async function deleteProduct(id) {
  await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
}

export async function fetchSalesByEmployee(employeeId) {
  if (!employeeId) return [];
  const data = await apiFetch(`/api/sales/by-employee/${employeeId}`);
  return Array.isArray(data) ? data.map(mapSale) : [];
}

export async function updateSale(id, payload) {
  const body = {
    totalAmount: payload.totalAmount,
    saleDate: payload.saleDate,
    notes: payload.notes ?? null,
    items: payload.items ?? undefined,
  };
  
  // Solo incluir clientId si es un UUID válido (no es un ID local)
  if (payload.customerId && !payload.customerId.startsWith('local-')) {
    body.clientId = payload.customerId;
  }
  
  const result = await apiFetch(`/api/sales/${id}`, { method: 'PUT', body });
  return mapSale(result || { id, ...body });
}

export async function deleteSale(id) {
  await apiFetch(`/api/sales/${id}`, { method: 'DELETE' });
}

export async function fetchLowStockProducts() {
  const data = await apiFetch('/api/products/low-stock');
  return Array.isArray(data) ? data.map(mapProduct) : [];
}

export async function createClient(payload) {
  const body = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone || null,
  };
  const data = await apiFetch('/api/clients', { method: 'POST', body });
  return data;
}

export { mapBrand, mapCategory, mapProduct, mapSale };


export async function fetchProduct(id) {
  if (!id) return null;
  const data = await apiFetch(`/api/products/${id}`);
  return data ? mapProduct(data) : null;
}

export async function fetchProductsByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const results = await Promise.all(ids.map((itemId) => fetchProduct(itemId).catch(() => null)));
  return results.filter(Boolean);
}

export async function updateProductStock(id, stockQuantity, minStock) {
  // Primero obtenemos el producto completo
  const product = await apiFetch(`/api/products/${id}`);
  if (!product) return null;
  
  // Verificar si el producto tiene lineId (ahora es requerido por el backend)
  const lineId = product.line_id || product.lineId;
  if (!lineId) {
    console.error(`El producto ${product.name} (${id}) no tiene lineId asignado. No se puede actualizar el stock.`);
    throw new Error(`El producto "${product.name}" no tiene una línea asignada. Por favor, asigna una línea antes de realizar ventas.`);
  }
  
  // Ahora actualizamos con todos los campos requeridos
  const body = {
    userId: product.user_id || product.userId,
    brandId: product.brand_id || product.brandId,
    lineId: lineId,
    categoryId: product.category_id || product.categoryId || null,
    name: product.name,
    description: product.description || '',
    price: Number(product.price || 0),
    image: product.image || '',
    stockQuantity: Number(stockQuantity ?? 0),
    minStock: Number(minStock ?? 0),
  };
  
  const data = await apiFetch(`/api/products/${id}`, { method: 'PUT', body });
  return data ? mapProduct(data) : null;
}

export async function createSale(payload) {
  const body = {
    employeeId: payload.employeeId,
    items: Array.isArray(payload.items) ? payload.items : [],
    totalAmount: payload.totalAmount,
    saleDate: payload.saleDate,
    notes: payload.notes ?? null,
  };
  
  // Solo incluir clientId si es un UUID válido (no es un ID local)
  if (payload.customerId && !payload.customerId.startsWith('local-')) {
    body.clientId = payload.customerId;
  }
  
  const data = await apiFetch('/api/sales', { method: 'POST', body });
  return data ? mapSale(data) : null;
}
