import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAppState } from 'state/AppStateContext';
import search from 'assets/windowsIcons/299(32x32).png';
import folderOpen from 'assets/windowsIcons/337(32x32).png';
import go from 'assets/windowsIcons/290.png';
import computer from 'assets/windowsIcons/676(16x16).png';
import dropdown from 'assets/windowsIcons/dropdown.png';
import pullup from 'assets/windowsIcons/pullup.png';
import windows from 'assets/windowsIcons/windows.png';
import { WindowDropDowns } from 'components';
import mcDropDownData from 'WinXP/apps/MyComputer/dropDownData';
import back from 'assets/windowsIcons/back.png';
import forward from 'assets/windowsIcons/forward.png';
import up from 'assets/windowsIcons/up.png';

function Catalog() {
  const { state, dispatch, ACTIONS, supabase } = useAppState();
  const [detailId, setDetailId] = useState(null);
  const [query, setQuery] = useState(state.catalog.query || '');
  const [brandId, setBrandId] = useState(state.catalog.brandId || 'all');
  const [category, setCategory] = useState(state.catalog.category || 'all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Estados para el sistema de ventas
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cartWarnings, setCartWarnings] = useState({}); // { productId: 'sin_stock' | 'bajo_minimo' }
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saleData, setSaleData] = useState(null);
  
  // Detectar si el usuario es administrador/vendedor
  const userRole = state.user && (state.user.role || (state.user.user_metadata && state.user.user_metadata.role));
  const roleStr = (userRole ? String(userRole) : '').toLowerCase();
  const emailStr = state.user && state.user.email ? String(state.user.email).toLowerCase() : '';
  const isEmployee = (emailStr === 'nacho_g88@hotmail.com') || (!!roleStr && ['empleado','employee'].some(r => roleStr.includes(r)));
  const isAdmin = !!emailStr && !isEmployee;
  
  useEffect(() => {
    // si hay filtros guardados restrictivos, reseteamos para mostrar resultados
    if (state.catalog.brandId && state.catalog.brandId !== 'all') setBrandId('all');
    if (state.catalog.category && state.catalog.category !== 'all') setCategory('all');
    if (state.catalog.query) setQuery('');
    
    // Actualizar datos automáticamente al cargar el catálogo
    refreshFromSupabase();
    
    // Configurar actualización automática cada 30 segundos
    const interval = setInterval(() => {
      refreshFromSupabase();
    }, 30000);
    
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const products = useMemo(() => {
    let list = state.products;
    if (query) list = list.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    if (brandId !== 'all') list = list.filter(p => p.brandId === brandId);
    if (category !== 'all') list = list.filter(p => (p.category || 'general') === category);
    return list;
  }, [state.products, query, brandId, category]);

  function saveFilters() {
    dispatch({ type: ACTIONS.SET_CATALOG_FILTERS, payload: { query, brandId, category } });
  }
  async function refreshFromSupabase() {
    if (isRefreshing) return; // Evitar múltiples actualizaciones simultáneas
    
    setIsRefreshing(true);
    try {
      if (supabase && supabase.from) {
        console.log('🔄 Iniciando actualización del catálogo...');
        console.log('Usuario actual:', state.user);
        console.log('¿Conexión a Supabase activa?:', !!supabase);
        console.log('URL de Supabase:', process.env.REACT_APP_SUPABASE_URL);
        console.log('¿Tiene clave anónima?:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);
        
        // Prueba de conexión directa
        try {
          const { data: testData, error: testError } = await supabase
            .from('brands')
            .select('count')
            .limit(1);
          console.log('🧪 Prueba de conexión directa:', { testData, testError });
        } catch (testErr) {
          console.log('❌ Error en prueba de conexión:', testErr);
        }
        
        // Actualizar marcas - SOLUCIÓN TEMPORAL: deshabilitar RLS
        console.log('🔑 Usuario identificado como administrador, intentando consulta sin RLS...');
        
        // Intentar múltiples métodos para obtener todas las marcas
        let brands = null;
        let brandsError = null;
        
        try {
          // Método 1: Consulta normal
          const result1 = await supabase.from('brands').select('*');
          brands = result1.data;
          brandsError = result1.error;
          
          if (brandsError || !brands || brands.length === 0) {
            console.log('⚠️ Consulta normal falló, intentando con RPC...');
            
            // Método 2: Intentar RPC
            try {
              const result2 = await supabase.rpc('get_all_brands_admin');
              if (result2.data) {
                brands = result2.data;
                brandsError = null;
              }
            } catch (rpcError) {
              console.log('⚠️ RPC no disponible:', rpcError);
            }
            
            // Método 3: Consulta directa con SQL (si es posible)
            if (!brands || brands.length === 0) {
              console.log('⚠️ Intentando consulta SQL directa...');
              try {
                const { data: sqlResult } = await supabase
                  .from('brands')
                  .select('*')
                  .limit(100); // Limitar para evitar problemas
                brands = sqlResult;
                brandsError = null;
              } catch (sqlError) {
                console.log('❌ Error en consulta SQL:', sqlError);
              }
            }
          }
        } catch (error) {
          console.log('❌ Error general en consulta de marcas:', error);
          brandsError = error;
        }
          
        console.log('📊 Resultado consulta marcas:', { 
          brands: brands, 
          error: brandsError,
          count: brands ? brands.length : 0
        });
        
        if (!brandsError && Array.isArray(brands)) {
          const mappedBrands = brands.map(x => ({ 
            id: x.id, 
            name: x.name, 
            description: x.description || '', 
            logo: x.logo || '',
            user_id: x.user_id // Incluir user_id para debugging
          }));
          dispatch({ type: ACTIONS.SET_BRANDS, payload: mappedBrands });
          console.log('✅ Marcas mapeadas correctamente:', mappedBrands);
        } else if (brandsError) {
          console.error('❌ Error al obtener marcas:', brandsError);
        }
        
        // Actualizar productos - SOLUCIÓN TEMPORAL: múltiples métodos
        console.log('🔑 Intentando obtener todos los productos...');
        
        let products = null;
        let productsError = null;
        
        try {
          // Método 1: Consulta normal
          const result1 = await supabase.from('products').select('*');
          products = result1.data;
          productsError = result1.error;
          
          if (productsError || !products || products.length === 0) {
            console.log('⚠️ Consulta normal de productos falló, intentando alternativas...');
            
            // Método 2: Intentar RPC
            try {
              const result2 = await supabase.rpc('get_all_products_admin');
              if (result2.data) {
                products = result2.data;
                productsError = null;
              }
            } catch (rpcError) {
              console.log('⚠️ RPC de productos no disponible:', rpcError);
            }
            
            // Método 3: Consulta directa con SQL
            if (!products || products.length === 0) {
              console.log('⚠️ Intentando consulta SQL directa de productos...');
              try {
                const { data: sqlResult } = await supabase
                  .from('products')
                  .select('*')
                  .limit(100);
                products = sqlResult;
                productsError = null;
              } catch (sqlError) {
                console.log('❌ Error en consulta SQL de productos:', sqlError);
              }
            }
          }
        } catch (error) {
          console.log('❌ Error general en consulta de productos:', error);
          productsError = error;
        }
          
        console.log('📦 Resultado consulta productos:', { 
          products: products, 
          error: productsError,
          count: products ? products.length : 0
        });
        
        if (!productsError && Array.isArray(products)) {
          const mappedProducts = products.map(x => ({ 
            id: x.id, 
            name: x.name, 
            description: x.description || '', 
            category: x.category || 'general', 
            brandId: x.brand_id, // Usar brand_id de Supabase
            price: Number(x.price || 0), 
            image: x.image || '',
            stock_quantity: Number(x.stock_quantity || 0),
            min_stock: Number(x.min_stock || 0),
            user_id: x.user_id // Incluir user_id para debugging
          }));
          dispatch({ type: ACTIONS.SET_PRODUCTS, payload: mappedProducts });
          console.log('✅ Productos mapeados correctamente:', mappedProducts);
        } else if (productsError) {
          console.error('❌ Error al obtener productos:', productsError);
        }
        
        setLastUpdate(new Date());
        console.log('✅ Catálogo actualizado desde Supabase:', { 
          brands: (brands && brands.length) || 0, 
          products: (products && products.length) || 0 
        });
      }
    } catch (error) {
      console.error('❌ Error al actualizar catálogo:', error);
    } finally {
      setIsRefreshing(false);
    }
  }

  const brandName = id => {
    const found = state.brands.find(b => b.id === id);
    return (found && found.name) || '—';
  };

  // Funciones para el carrito de compras
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
    setCartWarnings({});
    setShowCart(false);
    setShowCheckout(false);
  };

  // Verificar stock del carrito al abrirlo o cambiar cantidades
  useEffect(() => {
    (async () => {
      try {
        if (!supabase || !supabase.from || cart.length === 0) { setCartWarnings({}); return; }
        const ids = cart.map(i => i.id);
        const { data, error } = await supabase.from('products').select('id, stock_quantity, min_stock').in('id', ids);
        if (error) return;
        const m = new Map(); data.forEach(r => m.set(r.id, r));
        const warnings = {};
        for (const it of cart) {
          const row = m.get(it.id);
          const current = row ? Number(row.stock_quantity || 0) : 0;
          const minStock = row ? Number(row.min_stock || 0) : 0;
          const remaining = current - Number(it.quantity || 1);
          if (Number(it.quantity || 1) > current) warnings[it.id] = 'sin_stock';
          else if (remaining < minStock) warnings[it.id] = 'bajo_minimo';
        }
        setCartWarnings(warnings);
      } catch (_e) {}
    })();
  }, [cart, supabase]);

  const processSale = async () => {
    if (cart.length === 0) return;
    
    try {
      // 0) Validación de stock y min_stock
      if (supabase && supabase.from && cart.length > 0) {
        const productIds = cart.map(i => i.id);
        const { data: stockRows, error: stockError } = await supabase
          .from('products')
          .select('id, stock_quantity, min_stock, name')
          .in('id', productIds);
        if (stockError) throw stockError;

        const stockById = new Map();
        (stockRows || []).forEach(r => stockById.set(r.id, r));

        for (const item of cart) {
          const row = stockById.get(item.id);
          if (!row) {
            alert(`No se pudo validar stock para el producto ${item.name}.`);
            return;
          }
          const current = Number(row.stock_quantity || 0);
          const minStock = Number(row.min_stock || 0);
          const remaining = current - Number(item.quantity || 1);
          if (Number(item.quantity || 1) > current) {
            alert(`Stock insuficiente para ${item.name}. Disponible: ${current}`);
            return;
          }
          if (remaining < minStock) {
            alert(`No se puede realizar la venta de ${item.name}. El stock quedaría por debajo del mínimo (${minStock}).`);
            return;
          }
        }
      }

      // 1) Insertar venta en Supabase
      const totalAmount = getCartTotal();
      const notes = { paymentMethod, customerData };
      let insertedSale = null;

      if (supabase && supabase.from) {
        // Generar id de venta en cliente para evitar SELECT y cumplir con policies
        const saleId = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const payload = {
          id: saleId,
          employee_id: (state.user && state.user.id) ? state.user.id : null,
          total_amount: Number(totalAmount),
          sale_date: new Date().toISOString(),
          notes: JSON.stringify(notes)
        };
        const { error } = await supabase.from('sales').insert(payload, { returning: 'minimal' });
        if (error) throw error;
        insertedSale = { id: saleId, sale_date: payload.sale_date };

        // 2) Insertar ítems de la venta
        const itemsPayload = cart.map(item => ({
          sale_id: insertedSale.id,
          product_id: item.id,
          quantity: Number(item.quantity || 1),
          unit_price: Number(item.price || 0),
          subtotal: Number((item.price || 0) * (item.quantity || 1))
        }));
        const { error: itemsError } = await supabase.from('sale_items').insert(itemsPayload, { returning: 'minimal' });
        if (itemsError) throw itemsError;

        // 3) Descontar stock por cada ítem
        // Se realiza actualización por producto para mantener claridad
        const { data: stockRows2 } = await supabase
          .from('products')
          .select('id, stock_quantity')
          .in('id', cart.map(i => i.id));
        const stockMap2 = new Map();
        (stockRows2 || []).forEach(r => stockMap2.set(r.id, Number(r.stock_quantity || 0)));

        for (const item of cart) {
          const current = stockMap2.has(item.id) ? stockMap2.get(item.id) : 0;
          const newStock = current - Number(item.quantity || 1);
          await supabase.from('products').update({ stock_quantity: newStock }).eq('id', item.id);
        }
      }

      // 3) Preparar datos para el modal usando el ID real
      const sale = {
        id: insertedSale ? insertedSale.id : Date.now(),
        items: cart,
        total: totalAmount,
        paymentMethod,
        customerData,
        date: insertedSale && insertedSale.sale_date ? new Date(insertedSale.sale_date) : new Date(),
        seller: (state.user && state.user.email) || 'Usuario'
      };

      setSaleData(sale);
      setShowSuccessModal(true);
      setShowCheckout(false);

      // Notificar al panel de Admin para refrescar ventas, si está abierto
      try {
        if (dispatch && ACTIONS && ACTIONS.EMIT_EVENT) {
          dispatch({ type: ACTIONS.EMIT_EVENT, payload: { name: 'sales:refresh' } });
        }
        // Fallback: emitir evento del navegador que Admin puede escuchar
        window.dispatchEvent(new CustomEvent('sales:refresh'));
      } catch (_e) {}
      
    } catch (error) {
      console.error('Error procesando venta:', error);
      alert('Error al procesar la venta en la base de datos');
    }
  };

  return (
    <Div>
      <section className="com__toolbar">
        <div className="com__options">
          <WindowDropDowns items={mcDropDownData} onClickItem={() => {}} />
        </div>
        <img className="com__windows-logo" src={windows} alt="windows" />
      </section>
      <section className="com__function_bar">
        <div className="com__function_bar__button--disable">
          <img className="com__function_bar__icon" src={back} alt="" />
          <span className="com__function_bar__text">Atrás</span>
          <div className="com__function_bar__arrow" />
        </div>
        <div className="com__function_bar__button--disable">
          <img className="com__function_bar__icon" src={forward} alt="" />
          <div className="com__function_bar__arrow" />
        </div>
        <div className="com__function_bar__button">
          <img className="com__function_bar__icon--normalize" src={up} alt="" />
        </div>
        <div className="com__function_bar__separate" />
        <div className="com__function_bar__button">
          <img className="com__function_bar__icon--normalize" src={search} alt="" />
          <span className="com__function_bar__text">Buscar</span>
        </div>
        <div className="com__function_bar__button">
          <img className="com__function_bar__icon--normalize" src={folderOpen} alt="" />
          <span className="com__function_bar__text">Carpetas</span>
        </div>
        <div className="com__function_bar__button" onClick={() => setShowCart(!showCart)}>
          <span className="com__function_bar__text">🛒 Carrito ({cart.length})</span>
        </div>
      </section>
      <section className="com__address_bar">
        <div className="com__address_bar__title">Dirección</div>
        <div className="com__address_bar__content">
          <img src={computer} alt="ie" className="com__address_bar__content__img" />
          <div className="com__address_bar__content__text">Catálogo</div>
          <img src={dropdown} alt="dropdown" className="com__address_bar__content__img" />
        </div>
        <div className="com__address_bar__go">
          <img className="com__address_bar__go__img" src={go} alt="go" />
          <span className="com__address_bar__go__text">Ir</span>
        </div>
      </section>
      <div className="com__content">
        <div className="com__content__inner">
          <div className="com__content__left">
            <div className="com__content__left__card">
              <div className="com__content__left__card__header">
                <div className="com__content__left__card__header__text">Filtros</div>
                <img src={pullup} alt="" className="com__content__left__card__header__img" />
              </div>
              <div className="com__content__left__card__content">
                {/* Buscador */}
                <div className="com__content__left__card__row">
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%)',
                    border: '1px solid #b0c4ff',
                    borderRadius: '6px',
                    padding: '8px',
                    marginBottom: '8px',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    <label style={{ 
                      fontSize: '11px', 
                      color: '#0c327d', 
                      marginBottom: '4px', 
                      display: 'block',
                      fontWeight: 'bold',
                      textShadow: '0 1px 1px rgba(255,255,255,0.8)'
                    }}>
                      <img src={search} alt="" style={{ width: '14px', height: '14px', marginRight: '6px', verticalAlign: 'middle' }} />
                      Buscar productos
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ej: iPhone" 
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '6px 8px', 
                        fontSize: '12px', 
                        border: '1px solid #7aa2e8',
                        borderRadius: '4px',
                        background: '#fff',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#4a90e2'}
                      onBlur={(e) => e.target.style.borderColor = '#7aa2e8'}
                    />
                </div>
                </div>

                {/* Filtro de Marca */}
                <div className="com__content__left__card__row">
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f0f8ff 0%, #e0f0ff 100%)',
                    border: '1px solid #a8c8ff',
                    borderRadius: '6px',
                    padding: '8px',
                    marginBottom: '8px',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    <label style={{ 
                      fontSize: '11px', 
                      color: '#0c327d', 
                      marginBottom: '4px', 
                      display: 'block',
                      fontWeight: 'bold',
                      textShadow: '0 1px 1px rgba(255,255,255,0.8)'
                    }}>Marca</label>
                    <select 
                      value={brandId}
                      onChange={e => setBrandId(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '6px 8px', 
                        fontSize: '12px', 
                        border: '1px solid #7aa2e8',
                        borderRadius: '4px',
                        background: '#fff',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                    <option value="all">Todas las marcas</option>
                      {state.brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                  </select>
                </div>
                </div>
                
                {/* Filtro de Categoría */}
                <div className="com__content__left__card__row">
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f0f8ff 0%, #e0f0ff 100%)',
                    border: '1px solid #a8c8ff',
                    borderRadius: '6px',
                    padding: '8px',
                    marginBottom: '8px',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    <label style={{ 
                      fontSize: '11px', 
                      color: '#0c327d', 
                      marginBottom: '4px', 
                      display: 'block',
                      fontWeight: 'bold',
                      textShadow: '0 1px 1px rgba(255,255,255,0.8)'
                    }}>Categoría</label>
                    <select 
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '6px 8px', 
                        fontSize: '12px', 
                        border: '1px solid #7aa2e8',
                        borderRadius: '4px',
                        background: '#fff',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                    <option value="all">Todas las categorías</option>
                    <option value="general">General</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
                </div>

                {/* Separador visual */}
                <div style={{ height: '1px', background: '#bdb8a6', margin: '8px 0' }}></div>

                {/* Botones de acción */}
                <div className="com__content__left__card__row">
                  <button 
                    onClick={() => { setQuery(''); setBrandId('all'); setCategory('all'); }}
                    style={{ 
                      width: '100%',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)',
                      border: '1px solid #d32f2f',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                      textShadow: '0 1px 1px rgba(0,0,0,0.3)',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      marginBottom: '6px'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #ff5252 0%, #f44336 100%)';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)';
                    }}
                    onMouseDown={(e) => {
                      e.target.style.transform = 'translateY(1px)';
                      e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)';
                    }}
                    onMouseUp={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
                    }}
                  >
                    🗑️ Limpiar
                  </button>
                </div>

              </div>
            </div>
          </div>
          <div className="com__content__right">
            <div className="com__content__right__card">
              <div className="com__content__right__card__header">
                Productos
              </div>
              <div className="com__content__right__card__content">
                {!detailId && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12, width: '100%' }}>
                    {products.length === 0 && (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '20px', 
                        color: '#666',
                        backgroundColor: '#f9f9f9',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}>
                        <div>No hay productos que coincidan con los filtros.</div>
                        <div style={{ marginTop: '8px', fontSize: '12px' }}>
                          {state.products.length === 0 
                            ? 'No hay productos en la base de datos. Usa "Actualizar" para sincronizar.' 
                            : 'Prueba cambiar los filtros o usar "Actualizar" para obtener los últimos datos.'
                          }
                        </div>
                      </div>
                    )}
                    {products.map(p => (
                      <div key={p.id} style={{ 
                        border: '1px solid #b0c4ff', 
                        background: '#fff', 
                        boxShadow: 'inset 0 0 0 1px #dde6ff',
                        fontFamily: 'Tahoma, Arial, sans-serif'
                      }}>
                        {/* Imagen del producto */}
                        <div style={{ 
                          height: 140, 
                          background: '#f4f4f4', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          borderBottom: '1px solid #ccd6ff',
                          position: 'relative'
                        }}>
                          {p.image ? (
                            <img 
                              alt={p.name} 
                              src={p.image} 
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '100%'
                              }} 
                            />
                          ) : (
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              color: '#888',
                              fontSize: '12px'
                            }}>
                              <span style={{ fontSize: '24px', marginBottom: '4px' }}>🖼️</span>
                              <span>Sin imagen</span>
                        </div>
                          )}
                          {/* Badge de categoría estilo Windows XP */}
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: '#316ac5',
                            color: 'white',
                            padding: '2px 6px',
                            fontSize: '9px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            border: '1px solid #1e4a8c',
                            boxShadow: 'inset 0 1px 0 #5a8ddb'
                          }}>
                            {p.category || 'General'}
                          </div>
                          {/* Badge de stock bajo */}
                          {typeof p.stock_quantity === 'number' && typeof p.min_stock === 'number' && p.stock_quantity <= p.min_stock && (
                            <div style={{
                              position: 'absolute',
                              bottom: '4px',
                              right: '4px',
                              background: '#ff9800',
                              color: '#000',
                              padding: '2px 6px',
                              fontSize: '9px',
                              fontWeight: 'bold',
                              border: '1px solid #e07b00',
                              boxShadow: 'inset 0 1px 0 #ffd08a'
                            }}>
                              Bajo stock
                            </div>
                          )}
                        </div>
                        
                        {/* Contenido de la tarjeta */}
                        <div style={{ padding: '8px' }}>
                          {/* Nombre del producto */}
                          <div style={{ 
                            fontWeight: 'bold', 
                            textAlign: 'center',
                            fontSize: '13px',
                            color: '#000',
                            marginBottom: '6px'
                          }}>
                            {p.name}
                          </div>
                          
                          {/* Información del producto */}
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ 
                              fontSize: 11, 
                              color: '#333', 
                              marginBottom: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <span style={{ marginRight: '4px', fontSize: '10px' }}>🏷️</span>
                              <span>{brandName(p.brandId)}</span>
                            </div>
                          </div>
                          
                          {/* Precio */}
                          <div style={{ 
                            color: '#008000', 
                            fontWeight: 'bold', 
                            marginBottom: '8px',
                            textAlign: 'center',
                            fontSize: '14px'
                          }}>
                            ${p.price}
                          </div>
                          
                          {/* Botones de acción estilo Windows XP */}
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button 
                              onClick={() => setDetailId(p.id)}
                              style={{
                                flex: 1,
                                padding: '6px 10px',
                                background: 'linear-gradient(to bottom, #f8f8f8 0%, #e0e0e0 100%)',
                                border: '1px outset #f0f0f0',
                                borderRadius: '3px',
                                color: '#000',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                fontFamily: 'Tahoma, Arial, sans-serif',
                                boxShadow: 'inset 0 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.1)',
                                textShadow: '0 1px 0 rgba(255,255,255,0.8)'
                              }}
                              onMouseDown={(e) => {
                                e.target.style.background = 'linear-gradient(to bottom, #d0d0d0 0%, #f0f0f0 100%)';
                                e.target.style.boxShadow = 'inset 0 1px 0 #999, 0 1px 0 #fff';
                              }}
                              onMouseUp={(e) => {
                                e.target.style.background = 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)';
                                e.target.style.boxShadow = 'inset 0 1px 0 #fff, 0 1px 0 #999';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)';
                                e.target.style.boxShadow = 'inset 0 1px 0 #fff, 0 1px 0 #999';
                              }}
                            >
                              <span style={{ fontSize: '10px' }}>👁️</span>
                              Ver
                            </button>
                            <button 
                              onClick={() => addToCart(p)}
                              style={{
                                padding: '6px 12px',
                                background: 'linear-gradient(to bottom, #4CAF50 0%, #45a049 100%)',
                                border: '1px solid #2e7d32',
                                borderRadius: '3px',
                                color: '#fff',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                fontFamily: 'Tahoma, Arial, sans-serif',
                                boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999',
                                transition: 'all 0.1s ease'
                              }}
                              onMouseDown={(e) => {
                                e.target.style.background = 'linear-gradient(to bottom, #45a049 0%, #3d8b40 100%)';
                                e.target.style.boxShadow = 'inset 0 1px 0 #999, 0 1px 0 #fff';
                              }}
                              onMouseUp={(e) => {
                                e.target.style.background = 'linear-gradient(to bottom, #4CAF50 0%, #45a049 100%)';
                                e.target.style.boxShadow = 'inset 0 1px 0 #fff, 0 1px 0 #999';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'linear-gradient(to bottom, #4CAF50 0%, #45a049 100%)';
                                e.target.style.boxShadow = 'inset 0 1px 0 #fff, 0 1px 0 #999';
                              }}
                            >
                              <span style={{ fontSize: '10px' }}>🛒</span>
                              Agregar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {detailId && (
                  <div style={{ width: '100%' }}>
                    <button 
                      onClick={() => setDetailId(null)}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)',
                        border: '1px solid #999',
                        borderRadius: '3px',
                        color: '#000',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: 'Tahoma, Arial, sans-serif',
                        boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999',
                        marginBottom: '16px'
                      }}
                      onMouseDown={(e) => {
                        e.target.style.background = 'linear-gradient(to bottom, #d0d0d0 0%, #f0f0f0 100%)';
                        e.target.style.boxShadow = 'inset 0 1px 0 #999, 0 1px 0 #fff';
                      }}
                      onMouseUp={(e) => {
                        e.target.style.background = 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)';
                        e.target.style.boxShadow = 'inset 0 1px 0 #fff, 0 1px 0 #999';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)';
                        e.target.style.boxShadow = 'inset 0 1px 0 #fff, 0 1px 0 #999';
                      }}
                    >
                      <span>←</span>
                      Volver
                    </button>
                    {(() => {
                      const p = state.products.find(x => x.id === detailId);
                      if (!p) return <div>Producto no encontrado</div>;
                      return (
                        <div style={{ 
                          marginTop: 12, 
                          display: 'grid', 
                          gridTemplateColumns: '280px 1fr', 
                          gap: 16,
                          background: '#fff',
                          border: '1px solid #b0c4ff',
                          borderRadius: '6px',
                          padding: '16px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          <div>
                            {p.image ? (
                              <img 
                                alt={p.name} 
                                src={p.image} 
                                style={{ 
                                  width: '100%', 
                                  height: 'auto',
                                  borderRadius: '4px',
                                  border: '1px solid #ddd'
                                }} 
                              />
                            ) : (
                              <div style={{ 
                                width: '100%', 
                                height: 200, 
                                background: '#f4f4f4', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                color: '#888',
                                fontSize: '14px'
                              }}>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
                                  <div>Sin imagen</div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
                            <h3 style={{ 
                              marginTop: 0, 
                              color: '#000',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              marginBottom: '12px'
                            }}>
                              {p.name}
                            </h3>
                            
                            <div style={{ 
                              background: '#f0f0f0',
                              border: '1px solid #999',
                              padding: '12px',
                              borderRadius: '4px',
                              marginBottom: '12px',
                              boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                            }}>
                              <div style={{ 
                                fontSize: '12px', 
                                fontWeight: 'bold', 
                                color: '#000', 
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <span>ℹ️</span>
                                Información del producto
                              </div>
                              
                              <div style={{ marginBottom: '6px' }}>
                                <strong>Marca:</strong> {brandName(p.brandId)}
                              </div>
                              <div style={{ marginBottom: '6px' }}>
                                <strong>Categoría:</strong> {p.category || 'general'}
                              </div>
                              <div style={{ 
                                marginBottom: '6px',
                                color: '#008000',
                                fontWeight: 'bold',
                                fontSize: '16px'
                              }}>
                                <strong>Precio:</strong> ${p.price}
                              </div>
                              <div style={{ fontSize: '12px', color: '#333' }}>
                                <strong>Disponible:</strong> {typeof p.stock_quantity === 'number' ? p.stock_quantity : '—'}
                                {typeof p.min_stock === 'number' ? ` (mínimo ${p.min_stock})` : ''}
                              </div>
                            </div>
                            
                            {p.description && (
                              <div style={{ 
                                background: '#f0f0f0',
                                border: '1px solid #999',
                                padding: '12px',
                                borderRadius: '4px',
                                boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                              }}>
                                <div style={{ 
                                  fontSize: '12px', 
                                  fontWeight: 'bold', 
                                  color: '#000', 
                                  marginBottom: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <span>📝</span>
                                  Descripción
                                </div>
                                <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                  {p.description}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carrito de compras */}
      {showCart && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          maxHeight: '500px',
          background: '#fff',
          border: '2px solid #316ac5',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          fontFamily: 'Tahoma, Arial, sans-serif'
        }}>
          {/* Header del carrito */}
          <div style={{
            background: 'linear-gradient(to right, #316ac5 0%, #4a7bc8 100%)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '6px 6px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>🛒 Carrito de Compras</h3>
            <button 
              onClick={() => setShowCart(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Contenido del carrito */}
          <div style={{ padding: '16px', maxHeight: '350px', overflowY: 'auto' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛒</div>
                <div>El carrito está vacío</div>
              </div>
            ) : (
              <>
                {/* Lista de productos */}
                {cart.map(item => {
                  const warn = cartWarnings[item.id];
                  return (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    border: warn ? '1px solid #d32f2f' : '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    background: warn ? '#fff3f3' : '#f9f9f9'
                  }}>
                    <div style={{ width: '60px', height: '60px', marginRight: '12px' }}>
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          color: '#999'
                        }}>
                          🖼️
                        </div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                        {brandName(item.brandId)} • ${item.price}
                      </div>
                      {warn && (
                        <div style={{ fontSize: '11px', color: '#b71c1c', marginBottom: '4px' }}>
                          {warn === 'sin_stock' ? 'Cantidad supera el stock disponible.' : 'La venta dejaría el stock por debajo del mínimo.'}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            background: '#ff6b6b',
                            border: '1px solid #d32f2f',
                            borderRadius: '3px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          -
                        </button>
                        <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            background: '#4CAF50',
                            border: '1px solid #2e7d32',
                            borderRadius: '3px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          +
                        </button>
                        <span style={{ marginLeft: '8px', fontWeight: 'bold', color: '#008000' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: '#ff6b6b',
                        border: '1px solid #d32f2f',
                        borderRadius: '3px',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '6px 12px',
                        fontSize: '11px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                )})}

                {/* Total */}
                <div style={{
                  borderTop: '2px solid #ddd',
                  paddingTop: '12px',
                  marginTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Total:</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#008000' }}>
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>

                {/* Botones de acción */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button 
                    onClick={clearCart}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'linear-gradient(to bottom, #ff6b6b 0%, #ff5252 100%)',
                      border: '1px solid #d32f2f',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Limpiar Carrito
                  </button>
                  <button 
                    onClick={() => setShowCheckout(Object.keys(cartWarnings).length === 0)}
                    style={{
                      flex: 2,
                      padding: '10px',
                      background: Object.keys(cartWarnings).length === 0 
                        ? 'linear-gradient(to bottom, #4CAF50 0%, #45a049 100%)' 
                        : 'linear-gradient(to bottom, #ccc 0%, #bbb 100%)',
                      border: '1px solid #2e7d32',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: Object.keys(cartWarnings).length === 0 ? 'pointer' : 'not-allowed',
                      opacity: Object.keys(cartWarnings).length === 0 ? 1 : 0.6
                    }}
                  >
                    💳 Proceder al Pago
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de checkout */}
      {showCheckout && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          background: '#fff',
          border: '2px solid #316ac5',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1001,
          fontFamily: 'Tahoma, Arial, sans-serif'
        }}>
          {/* Header del checkout */}
          <div style={{
            background: 'linear-gradient(to right, #316ac5 0%, #4a7bc8 100%)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '6px 6px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>💳 Finalizar Compra</h3>
            <button 
              onClick={() => setShowCheckout(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Contenido del checkout */}
          <div style={{ padding: '16px' }}>
            {/* Datos del cliente */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#333' }}>Datos del Cliente</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="text"
                  placeholder="Nombre completo"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                  style={{
                    padding: '8px',
                    border: '1px solid #999',
                    borderRadius: '3px',
                    fontSize: '12px',
                    fontFamily: 'Tahoma, Arial, sans-serif'
                  }}
                />
                <input 
                  type="email"
                  placeholder="Email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                  style={{
                    padding: '8px',
                    border: '1px solid #999',
                    borderRadius: '3px',
                    fontSize: '12px',
                    fontFamily: 'Tahoma, Arial, sans-serif'
                  }}
                />
                <input 
                  type="tel"
                  placeholder="Teléfono"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                  style={{
                    padding: '8px',
                    border: '1px solid #999',
                    borderRadius: '3px',
                    fontSize: '12px',
                    fontFamily: 'Tahoma, Arial, sans-serif'
                  }}
                />
              </div>
            </div>

            {/* Método de pago */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#333' }}>Método de Pago</h4>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #999',
                  borderRadius: '3px',
                  fontSize: '12px',
                  fontFamily: 'Tahoma, Arial, sans-serif'
                }}
              >
                <option value="">Seleccionar método de pago</option>
                <option value="efectivo">💵 Efectivo</option>
                <option value="tarjeta">💳 Tarjeta de Crédito/Débito</option>
                <option value="transferencia">🏦 Transferencia Bancaria</option>
                <option value="paypal">🅿️ PayPal</option>
              </select>
            </div>

            {/* Resumen de la compra */}
            <div style={{ 
              background: '#f0f0f0',
              border: '1px solid #999',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#333' }}>Resumen de la Compra</h4>
              {cart.map(item => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  marginBottom: '4px'
                }}>
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ 
                borderTop: '1px solid #999',
                paddingTop: '8px',
                marginTop: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 'bold'
              }}>
                <span>Total:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setShowCheckout(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)',
                  border: '1px solid #999',
                  borderRadius: '4px',
                  color: '#000',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ← Volver
              </button>
              <button 
                onClick={processSale}
                disabled={!paymentMethod || !customerData.name}
                style={{
                  flex: 2,
                  padding: '10px',
                  background: paymentMethod && customerData.name 
                    ? 'linear-gradient(to bottom, #4CAF50 0%, #45a049 100%)'
                    : 'linear-gradient(to bottom, #ccc 0%, #bbb 100%)',
                  border: '1px solid #2e7d32',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: paymentMethod && customerData.name ? 'pointer' : 'not-allowed',
                  opacity: paymentMethod && customerData.name ? 1 : 0.6
                }}
              >
                ✅ Confirmar Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de venta exitosa */}
      {showSuccessModal && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          background: '#f0f0f0',
          border: '2px outset #f0f0f0',
          borderRadius: '0',
          boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          zIndex: 1002,
          fontFamily: 'Tahoma, Arial, sans-serif'
        }}>
          {/* Header del modal estilo Windows XP */}
          <div style={{
            background: 'linear-gradient(to bottom, #316ac5 0%, #1e4a8c 100%)',
            color: 'white',
            padding: '8px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #1e4a8c'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>✅</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Venta Exitosa</span>
            </div>
            <button 
              onClick={() => {
                setShowSuccessModal(false);
                clearCart();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '2px'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              ✕
            </button>
          </div>

          {/* Contenido del modal */}
          <div style={{ padding: '16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#008000', marginBottom: '4px' }}>
                ¡Venta Procesada Exitosamente!
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                La venta ha sido registrada correctamente
              </div>
            </div>

            {saleData && (
              <div style={{
                background: '#fff',
                border: '1px inset #f0f0f0',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '11px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                  📋 Detalles de la Venta
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>ID de Venta:</strong> #{saleData.id}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Cliente:</strong> {saleData.customerData.name}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Método de Pago:</strong> {saleData.paymentMethod}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Productos:</strong> {saleData.items.length} artículo(s)
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Total:</strong> <span style={{ color: '#008000', fontWeight: 'bold' }}>${saleData.total.toFixed(2)}</span>
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Fecha:</strong> {saleData.date.toLocaleString()}
                </div>
                <div>
                  <strong>Vendedor:</strong> {saleData.seller}
                </div>
              </div>
            )}

            {/* Lista de productos vendidos */}
            {saleData && saleData.items.length > 0 && (
              <div style={{
                background: '#fff',
                border: '1px inset #f0f0f0',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '11px',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                  🛍️ Productos Vendidos
                </div>
                {saleData.items.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '2px',
                    padding: '2px 0'
                  }}>
                    <span>{item.name} x{item.quantity}</span>
                    <span style={{ color: '#008000' }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  clearCart();
                }}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)',
                  border: '1px outset #f0f0f0',
                  borderRadius: '0',
                  color: '#000',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'Tahoma, Arial, sans-serif'
                }}
                onMouseDown={(e) => {
                  e.target.style.background = 'linear-gradient(to bottom, #d0d0d0 0%, #f0f0f0 100%)';
                  e.target.style.border = '1px inset #f0f0f0';
                }}
                onMouseUp={(e) => {
                  e.target.style.background = 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)';
                  e.target.style.border = '1px outset #f0f0f0';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)';
                  e.target.style.border = '1px outset #f0f0f0';
                }}
              >
                ✅ Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de estado */}
      <div style={{ marginTop: 8, background: '#e8e4cf', border: '1px solid #b8b4a2', padding: '6px 8px', fontSize: 11 }}>
        Estado: Sistema operativo | Productos: {state.products.length} | Última actualización: {lastUpdate.toLocaleString()}
      </div>
    </Div>
  );
}

const Div = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  background: linear-gradient(to right, #edede5 0%, #ede8cd 100%);
  .com__toolbar { position: relative; display:flex; align-items:center; line-height:100%; height: 24px; border-bottom: 1px solid rgba(255,255,255,0.7); flex-shrink:0; }
  .com__options { height:23px; border-bottom:1px solid rgba(0,0,0,0.1); border-right:1px solid rgba(0,0,0,0.1); padding:1px 0 1px 2px; border-left:0; flex:1; }
  .com__windows-logo { height:100%; border-left:1px solid white; border-bottom:1px solid rgba(0,0,0,0.1); }
  .com__function_bar { height: 36px; display: flex; align-items: center; font-size: 11px; padding: 1px 3px 0; border-bottom: 1px solid rgba(0,0,0,0.1); }
  .com__function_bar__button { display:flex; align-items:center; height:100%; border: 1px solid rgba(0,0,0,0); border-radius:3px; }
  .com__function_bar__button:hover { border:1px solid rgba(0,0,0,0.1); box-shadow: inset 0 -1px 1px rgba(0,0,0,0.1); }
  .com__function_bar__button:hover:active { border:1px solid rgb(185,185,185); background:#dedede; box-shadow: inset 0 -1px 1px rgba(255,255,255,0.7); color: rgba(255,255,255,0.7); }
  .com__function_bar__icon--normalize { height:22px; width:22px; margin: 0 4px 0 1px; }
  .com__function_bar__text { margin-right: 4px; }
  .com__function_bar__icon { height:30px; width:30px; }
  .com__function_bar__button--disable { filter: grayscale(1); opacity:0.7; display:flex; height:100%; align-items:center; border:1px solid rgba(0,0,0,0); }
  .com__function_bar__separate { height:90%; width:1px; background-color: rgba(0,0,0,0.2); margin: 0 2px; }
  .com__function_bar__arrow { height:100%; display:flex; align-items:center; margin: 0 4px; }
  .com__function_bar__arrow:before { content:''; display:block; border-width:3px 3px 0; border-color:#000 transparent; border-style: solid; }
  .com__address_bar { flex-shrink:0; border-top:1px solid rgba(255,255,255,0.7); height:20px; font-size:11px; display:flex; align-items:center; padding:0 2px; box-shadow: inset 0 -2px 3px -1px #b0b0b0; }
  .com__address_bar__title { color: rgba(0,0,0,0.5); padding:5px; }
  .com__address_bar__content { border: rgba(122,122,255,0.6) 1px solid; height:100%; display:flex; flex:1; align-items:center; background:#fff; position:relative; }
  .com__address_bar__content__img { width:14px; height:14px; }
  .com__address_bar__content__img:last-child { width:15px; height:15px; right:1px; position:absolute; }
  .com__address_bar__content__text { white-space:nowrap; position:absolute; left:16px; right:17px; }
  .com__address_bar__go { display:flex; align-items:center; padding:0 18px 0 5px; height:100%; }
  .com__address_bar__go__img { height:95%; border:1px solid rgba(255,255,255,0.2); margin-right:3px; }
  .com__content { flex:1; border:1px solid rgba(0,0,0,0.4); border-top-width:0; background:#f1f1f1; overflow:auto; font-size:11px; position:relative; }
  .com__content__inner { display:flex; height:100%; overflow:auto; }
  .com__content__left { width:180px; height:100%; background: linear-gradient(to bottom, #748aff 0%, #4057d3 100%); overflow:auto; padding:10px; }
  .com__content__left__card { border-top-left-radius:3px; border-top-right-radius:3px; width:100%; overflow:hidden; }
  .com__content__left__card:not(:last-child) { margin-bottom:12px; }
  .com__content__left__card__header { display:flex; align-items:center; height:23px; padding-left:11px; padding-right:2px; cursor:pointer; background: linear-gradient(to right, rgb(240,240,255) 0, rgb(240,240,255) 30%, rgb(168,188,255) 100%); }
  .com__content__left__card__header__text { font-weight:700; color:#0c327d; flex:1; }
  .com__content__left__card__header__img { width:18px; height:18px; filter: drop-shadow(1px 1px 3px rgba(0,0,0,0.3)); }
  .com__content__left__card__content { padding:5px 10px; background: linear-gradient(to right, rgb(180,200,251) 0%, rgb(164,185,251) 50%, rgb(180,200,251) 100%); background-color: rgba(198,211,255,0.87); }
  .com__content__left__card__row { display:flex; margin-bottom:4px; }
  .btn { background: linear-gradient(#fefefe,#e7e7e7); border: 1px solid #7aa2e8; padding: 3px 8px; cursor: pointer; }
  .label { font-size: 10px; color: #0c327d; margin-bottom: 2px; }
  .input { width: 100%; }
  .com__content__right { height:100%; overflow:auto; background:#fff; flex:1; }
  .com__content__right__card__header { width:300px; font-weight:700; padding: 2px 0 3px 12px; position:relative; }
  .com__content__right__card__header:after { content:''; display:block; background: linear-gradient(to right, #70bfff 0, #fff 100%); position:absolute; bottom:0; left:-12px; height:1px; width:100%; }
  .com__content__right__card__content { display:flex; align-items:flex-start; padding:15px 15px 0; flex-wrap:wrap; }
`;

export default Catalog;


