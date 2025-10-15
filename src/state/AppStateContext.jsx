import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { getSupabaseClient } from 'lib/supabaseClient';
import { fetchBrands, fetchCategories, fetchProducts, fetchLines } from 'lib/apiClient';
import startupSound from 'assets/sounds/windows-xp-startup.wav';

const PERSIST_KEY = 'app.state.v1';

const initialData = {
  session: null,
  user: null,
  products: [],
  brands: [],
  categories: [],
  // filtros de catálogo
  catalog: {
    query: '',
    category: 'all',
    brandId: 'all',
    minPrice: 0,
    maxPrice: 0,
  },
  lines: [],
};

const ACTIONS = {
  SET_SESSION: 'SET_SESSION',
  SET_USER: 'SET_USER',
  UPSERT_PRODUCT: 'UPSERT_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  UPSERT_BRAND: 'UPSERT_BRAND',
  DELETE_BRAND: 'DELETE_BRAND',
  UPSERT_CATEGORY: 'UPSERT_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
  SET_CATALOG_FILTERS: 'SET_CATALOG_FILTERS',
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_BRANDS: 'SET_BRANDS',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_LINES: 'SET_LINES',
  ADD_LINE: 'ADD_LINE',
  UPDATE_LINE: 'UPDATE_LINE',
  DELETE_LINE: 'DELETE_LINE',
  HYDRATE: 'HYDRATE',
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.HYDRATE:
      return { ...state, ...action.payload };
    case ACTIONS.SET_SESSION:
      return { ...state, session: action.payload.session, user: action.payload.user || null };
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload };
    case ACTIONS.UPSERT_PRODUCT: {
      const p = action.payload;
      const exists = state.products.some(x => x.id === p.id);
      return {
        ...state,
        products: exists
          ? state.products.map(x => (x.id === p.id ? { ...x, ...p } : x))
          : [...state.products, { ...p, id: p.id || `prd_${Date.now()}` }],
      };
    }
    case ACTIONS.DELETE_PRODUCT:
      return { ...state, products: state.products.filter(x => x.id !== action.payload) };
    case ACTIONS.SET_PRODUCTS:
      return { ...state, products: Array.isArray(action.payload) ? action.payload : [] };
    case ACTIONS.UPSERT_BRAND: {
      const brand = action.payload;
      if (!brand) return state;

      const normalizedName = typeof brand.name === 'string' ? brand.name.trim() : '';
      const normalizedNameLower = normalizedName.toLowerCase();
      const existingById = brand.id ? state.brands.find((item) => item.id === brand.id) : null;

      if (existingById) {
        return {
          ...state,
          brands: state.brands.map((item) =>
            item.id === brand.id ? { ...item, ...brand, name: normalizedName || brand.name || item.name } : item
          ),
        };
      }

      const existingByName = normalizedNameLower
        ? state.brands.find((item) => (item.name || '').toLowerCase() === normalizedNameLower)
        : null;

      if (existingByName) {
        return {
          ...state,
          brands: state.brands.map((item) =>
            item.id === existingByName.id
              ? { ...item, ...brand, id: existingByName.id, name: normalizedName || existingByName.name }
              : item
          ),
        };
      }

      const brandToInsert = {
        ...brand,
        id: brand.id || `br_${Date.now()}`,
        name: normalizedName || brand.name || '',
      };

      return { ...state, brands: [...state.brands, brandToInsert] };
    }
    case ACTIONS.UPSERT_CATEGORY: {
      const category = action.payload;
      if (!category) return state;
      const normalizedName = typeof category.name === 'string' ? category.name.trim() : '';
      const existingById = category.id ? state.categories.find((item) => item.id === category.id) : null;

      if (existingById) {
        return {
          ...state,
          categories: state.categories.map((item) =>
            item.id === category.id ? { ...item, ...category, name: normalizedName || category.name || item.name } : item,
          ),
        };
      }

      const normalizedNameLower = normalizedName.toLowerCase();
      const existingByName = normalizedNameLower
        ? state.categories.find((item) => (item.name || '').toLowerCase() === normalizedNameLower)
        : null;

      if (existingByName) {
        return {
          ...state,
          categories: state.categories.map((item) =>
            item.id === existingByName.id
              ? { ...item, ...category, id: existingByName.id, name: normalizedName || existingByName.name }
              : item,
          ),
        };
      }

      const categoryToInsert = {
        ...category,
        id: category.id || `cat_${Date.now()}`,
        name: normalizedName || category.name || '',
      };

      return { ...state, categories: [...state.categories, categoryToInsert] };
    }
    case ACTIONS.DELETE_BRAND: {
      const brandId = action.payload;
      const hasProducts = state.products.some(p => p.brandId === brandId);
      if (hasProducts) return state;
      return { ...state, brands: state.brands.filter(x => x.id !== brandId) };
    }
    case ACTIONS.DELETE_CATEGORY: {
      const categoryName = action.payload;
      if (!categoryName) return state;
      return { ...state, categories: state.categories.filter((cat) => cat.name !== categoryName && cat.id !== categoryName) };
    }
    case ACTIONS.SET_BRANDS:
      return { ...state, brands: Array.isArray(action.payload) ? action.payload : [] };
    case ACTIONS.SET_CATEGORIES:
      return { ...state, categories: Array.isArray(action.payload) ? action.payload : [] };
    case ACTIONS.SET_LINES:
      return { ...state, lines: Array.isArray(action.payload) ? action.payload : [] };
    case ACTIONS.ADD_LINE:
      return { ...state, lines: [...state.lines, action.payload] };
    case ACTIONS.UPDATE_LINE:
      return {
        ...state,
        lines: state.lines.map(line =>
          line.id === action.payload.id ? action.payload : line
        ),
      };
    case ACTIONS.DELETE_LINE:
      return {
        ...state,
        lines: state.lines.filter(line => line.id !== action.payload),
      };
    case ACTIONS.SET_CATALOG_FILTERS:
      return { ...state, catalog: { ...state.catalog, ...action.payload } };
    default:
      return state;
  }
}

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [state, dispatch] = useReducer(reducer, initialData);
  const previousUserIdRef = useRef(null);

  async function resolveUserWithRole(baseUser) {
    if (!baseUser) return null;
    let role = (baseUser.user_metadata && baseUser.user_metadata.role) || baseUser.role || '';
    let profileExists = false;
    
    try {
      if (supabase && supabase.from && baseUser.id) {
        const tryQueries = [
          { table: 'profiles', field: 'id', value: baseUser.id },
          { table: 'profiles', field: 'user_id', value: baseUser.id },
          { table: 'profile',  field: 'id', value: baseUser.id },
          { table: 'profile',  field: 'user_id', value: baseUser.id },
          { table: 'profiles', field: 'email', value: baseUser.email },
        ];
        for (let i = 0; i < tryQueries.length && !role; i += 1) {
          const q = tryQueries[i];
          try {
            const { data: prof } = await supabase
              .from(q.table)
              .select('role')
              .eq(q.field, q.value)
              .maybeSingle();
            if (prof && prof.role) {
              role = prof.role;
              profileExists = true;
            }
          } catch (_inner) {}
        }
        
        // Si no existe perfil, crearlo automáticamente (especialmente para usuarios de Google)
        if (!profileExists && baseUser.id && baseUser.email) {
          try {
            const newProfile = {
              id: baseUser.id,
              user_id: baseUser.id,
              email: baseUser.email,
              role: 'cliente',
              full_name: baseUser.user_metadata?.full_name || baseUser.user_metadata?.name || baseUser.email.split('@')[0],
              avatar_url: baseUser.user_metadata?.avatar_url || '',
            };
            
            const { data: insertedProfile, error: insertError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();
            
            if (!insertError && insertedProfile) {
              console.log('✅ Perfil creado automáticamente para:', baseUser.email);
              role = insertedProfile.role || 'cliente';
              profileExists = true;
            } else if (insertError) {
              console.warn('⚠️ No se pudo crear el perfil automáticamente:', insertError.message);
            }
          } catch (createError) {
            console.warn('⚠️ Error al crear perfil:', createError);
          }
        }
      }
    } catch (_e) {}
    const normalizedRole = role ? String(role).trim().toLowerCase() : '';
    return normalizedRole ? { ...baseUser, role: normalizedRole } : baseUser;
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PERSIST_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // No hidratamos user/session para exigir login real
        const { products, brands, categories, catalog } = parsed || {};
        dispatch({
          type: ACTIONS.HYDRATE,
          payload: {
            products: products || [],
            brands: brands || [],
            categories: categories || [],
            catalog: catalog || initialData.catalog,
          },
        });
      }
    } catch (_e) {}
    supabase.auth.getSession().then(async ({ data }) => {
      if (data && data.session && data.session.user) {
        const baseUser = data.session.user;
        const mergedUser = await resolveUserWithRole(baseUser);
        dispatch({ type: ACTIONS.SET_SESSION, payload: { session: data.session, user: mergedUser } });
      }
    });
    // Suscripción a cambios de sesión para refrescar el rol al instante tras login/logout
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const baseUser = session && session.user ? session.user : null;
      const mergedUser = baseUser ? await resolveUserWithRole(baseUser) : null;
      dispatch({ type: ACTIONS.SET_SESSION, payload: { session, user: mergedUser } });
    });
    // Los datos de catálogo se cargarán cuando exista sesión

    return () => {
      try { authListener.subscription.unsubscribe(); } catch (_e) {}
    };
  }, [supabase]);

  useEffect(() => {
    const currentUserId = state.user?.id || null;
    const previousUserId = previousUserIdRef.current;
    const canPlayAudio = typeof window !== 'undefined' && typeof Audio !== 'undefined';

    if (currentUserId && currentUserId !== previousUserId && canPlayAudio) {
      try {
        new Audio(startupSound).play();
      } catch (error) {
        console.error('No se pudo reproducir el sonido de inicio de sesión:', error);
      }
    }

    if (previousUserId !== currentUserId) {
      previousUserIdRef.current = currentUserId;
    }
  }, [state.user]);

  useEffect(() => {
    if (!state.user) {
      dispatch({ type: ACTIONS.SET_BRANDS, payload: [] });
      dispatch({ type: ACTIONS.SET_PRODUCTS, payload: [] });
      dispatch({ type: ACTIONS.SET_CATEGORIES, payload: [] });
      dispatch({ type: ACTIONS.SET_LINES, payload: [] });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const [brands, categories, products, lines] = await Promise.all([
          fetchBrands().catch(() => null),
          fetchCategories().catch(() => null),
          fetchProducts().catch(() => null),
          fetchLines().catch(() => null),
        ]);

        if (!cancelled && Array.isArray(brands)) {
          const normalizedBrands = brands.map((brand) => ({
            id: brand?.id ?? null,
            name: brand?.name ?? '',
            description: brand?.description ?? '',
            logo: brand?.logo ?? '',
            userId: brand?.userId ?? brand?.user_id ?? null,
          }));
          dispatch({ type: ACTIONS.SET_BRANDS, payload: normalizedBrands });
        }

        if (!cancelled && Array.isArray(categories)) {
          const normalizedCategories = categories.map((category) => ({
            id: category?.id ?? null,
            name: category?.name ?? '',
            description: category?.description ?? '',
            slug: category?.slug ?? null,
            userId: category?.userId ?? category?.user_id ?? null,
          }));
          dispatch({ type: ACTIONS.SET_CATEGORIES, payload: normalizedCategories });
        }

        if (!cancelled && Array.isArray(lines)) {
          const normalizedLines = lines.map((line) => ({
            id: line?.id ?? null,
            name: line?.name ?? '',
            description: line?.description ?? '',
            brandId: line?.brand_id ?? line?.brandId ?? null,
            createdBy: line?.created_by ?? line?.createdBy ?? null,
          }));
          dispatch({ type: ACTIONS.SET_LINES, payload: normalizedLines });
        }

        if (!cancelled && Array.isArray(products)) {
          const normalizedProducts = products.map((product) => ({
            id: product?.id ?? null,
            name: product?.name ?? '',
            description: product?.description ?? '',
            category: product?.category ?? 'general',
            brandId: product?.brandId ?? product?.brand_id ?? '',
            lineId: product?.lineId ?? product?.line_id ?? '',
            price: Number(product?.price ?? 0),
            image: product?.image ?? '',
            stock_quantity: Number(product?.stockQuantity ?? product?.stock_quantity ?? 0),
            min_stock: Number(product?.minStock ?? product?.min_stock ?? 0),
            userId: product?.userId ?? product?.user_id ?? null,
          }));
          dispatch({ type: ACTIONS.SET_PRODUCTS, payload: normalizedProducts });
        }
      } catch (_error) {
        if (!cancelled) {
          dispatch({ type: ACTIONS.SET_BRANDS, payload: [] });
          dispatch({ type: ACTIONS.SET_PRODUCTS, payload: [] });
          dispatch({ type: ACTIONS.SET_CATEGORIES, payload: [] });
          dispatch({ type: ACTIONS.SET_LINES, payload: [] });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.user]);

  useEffect(() => {
    // Persistimos solo datos de catálogo; nunca la sesión
    const toPersist = { products: state.products, brands: state.brands, categories: state.categories, catalog: state.catalog };
    try {
      localStorage.setItem(PERSIST_KEY, JSON.stringify(toPersist));
    } catch (_e) {}
  }, [state.products, state.brands, state.categories, state.catalog]);

  const api = useMemo(() => ({ supabase, state, dispatch, ACTIONS }), [supabase, state]);

  const Provider = AppStateContext.Provider;
  return <Provider value={api}>{children}</Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState debe usarse dentro de AppStateProvider');
  return ctx;
}

export default AppStateContext;


