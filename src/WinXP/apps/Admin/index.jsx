import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useAppState } from 'state/AppStateContext';
// FontAwesome removed due to compatibility issues - using Unicode icons instead
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
import edit from 'assets/windowsIcons/edit.png';
import refresh from 'assets/windowsIcons/refresh.png';

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', marginBottom: 8 }}>
      <div style={{ width: 130 }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Admin({ defaultTab = 'products', showLauncher = false, openCatalog }) {
  const { state, dispatch, ACTIONS, supabase } = useAppState();
  const [tab, setTab] = useState(defaultTab);
  // Derivar rol de distintas fuentes y no bloquear mientras user no está hidratado
  const userRole = state.user && (state.user.role || (state.user.user_metadata && state.user.user_metadata.role));
  const roleStr = (userRole ? String(userRole) : '').toLowerCase();
  const emailStr = state.user && state.user.email ? String(state.user.email).toLowerCase() : '';
  const isEmployee = (emailStr === 'nacho_g88@hotmail.com') || (!!roleStr && ['empleado','employee'].some(r => roleStr.includes(r)));
  // Regla simplificada y prioritaria: cualquier usuario distinto al empleado tiene acceso
  const isAdmin = !!emailStr && !isEmployee;
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [sales, setSales] = useState([]);
  const [salesRefreshToken, setSalesRefreshToken] = useState(0);
  const [editingSale, setEditingSale] = useState(null);
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerEmail, setEditCustomerEmail] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTotal, setEditTotal] = useState('');

  // Modal de confirmación estilo Windows XP
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: 'C:\\', message: '', onConfirm: null });
  function openConfirm(message, onConfirm, title = 'C:\\') {
    setConfirmDialog({ open: true, title, message, onConfirm });
  }
  function closeConfirm() {
    setConfirmDialog({ open: false, title: 'C\\', message: '', onConfirm: null });
  }
  // Escuchar eventos globales para refrescar ventas
  React.useEffect(() => {
    function onRefresh() { setSalesRefreshToken(x => x + 1); }
    window.addEventListener('sales:refresh', onRefresh);
    return () => window.removeEventListener('sales:refresh', onRefresh);
  }, []);

  // Cargar ventas reales desde Supabase
  const loadSalesFromSupabase = React.useCallback(async () => {
    try {
      if (!supabase || !supabase.from || !state.user || !state.user.id) return;
      const { data, error } = await supabase
        .from('sales')
        .select('id, employee_id, total_amount, sale_date, notes')
        .eq('employee_id', state.user.id)
        .order('sale_date', { ascending: false })
        .limit(200);
      if (error) { console.error('❌ Error al cargar ventas:', error); return; }
      const mapped = (data || []).map(row => {
        let paymentMethod = '';
        let customerName = '';
        let customerEmail = '';
        try {
          const n = row.notes && typeof row.notes === 'string' ? JSON.parse(row.notes) : row.notes;
          if (n) {
            paymentMethod = n.paymentMethod || '';
            if (n.customerData) {
              customerName = n.customerData.name || '';
              customerEmail = n.customerData.email || '';
            }
          }
        } catch (_e) {}
        return {
          id: row.id,
          customerName,
          customerEmail,
          total: Number(row.total_amount || 0),
          paymentMethod,
          date: row.sale_date ? new Date(row.sale_date) : new Date(),
          seller: state.user && state.user.email ? state.user.email : ''
        };
      });
      setSales(mapped);
    } catch (e) {
      console.error('❌ Error inesperado cargando ventas:', e);
    }
  }, [supabase, state.user]);

  // Recargar cuando se abre la pestaña Ventas o cuando haya refresh
  React.useEffect(() => {
    if (tab === 'sales') loadSalesFromSupabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, salesRefreshToken]);

  async function onDeleteSale(id) {
    // eslint-disable-next-line no-alert
    if (!window.confirm('¿Eliminar esta venta? Esta acción no se puede deshacer.')) return;
    try {
      if (supabase && supabase.from) {
        await supabase.from('sale_items').delete().eq('sale_id', id); // por si no hay ON DELETE CASCADE
        await supabase.from('sales').delete().eq('id', id);
      }
      setEditingSale(null);
      setSalesRefreshToken(x => x + 1);
    } catch (e) {
      console.error('❌ Error eliminando venta:', e);
    }
  }

  function startEditSale(sale) {
    setEditingSale(sale);
    setEditPaymentMethod(sale.paymentMethod || '');
    setEditCustomerName(sale.customerName || '');
    setEditCustomerEmail(sale.customerEmail || '');
    setEditDate(sale.date ? new Date(sale.date).toISOString().slice(0,16) : '');
    setEditTotal(String(sale.total || 0));
  }

  async function saveEditSale() {
    if (!editingSale) return;
    try {
      const newNotes = { paymentMethod: editPaymentMethod, customerData: { name: editCustomerName, email: editCustomerEmail } };
      const payload = {
        total_amount: Number(editTotal || 0),
        sale_date: editDate ? new Date(editDate).toISOString() : new Date().toISOString(),
        notes: JSON.stringify(newNotes)
      };
      if (supabase && supabase.from) {
        await supabase.from('sales').update(payload).eq('id', editingSale.id);
      }
      setEditingSale(null);
      setSalesRefreshToken(x => x + 1);
    } catch (e) {
      console.error('❌ Error actualizando venta:', e);
    }
  }

  // Responsive: detectar ventana angosta para apilar columnas
  const [isNarrow, setIsNarrow] = useState(false);
  React.useEffect(() => {
    function handleResize() {
      try {
        setIsNarrow(window.innerWidth <= 980);
      } catch (_e) {}
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  // Control de visibilidad del formulario de nuevo producto
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  
  // Control de visibilidad del formulario de nueva marca
  const [showNewBrandForm, setShowNewBrandForm] = useState(false);

  // Productos
  const [pId, setPId] = useState('');
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCategory, setPCategory] = useState('general');
  const [pBrandId, setPBrandId] = useState('');
  const [pPrice, setPPrice] = useState('0');
  const [pImage, setPImage] = useState('');
  const [pStock, setPStock] = useState('0');
  const [pMinStock, setPMinStock] = useState('0');
  const [pPreview, setPPreview] = useState('');
  const [pOriginal, setPOriginal] = useState(null);

  // Calcular automáticamente el stock mínimo como 30% del stock
  React.useEffect(() => {
    const s = Number(pStock || 0);
    const autoMin = Math.floor(s * 0.3);
    setPMinStock(String(autoMin));
  }, [pStock]);

  // Marcas
  const [bId, setBId] = useState('');
  const [bName, setBName] = useState('');
  const [bDesc, setBDesc] = useState('');
  const [bLogo, setBLogo] = useState('');
  const [bOriginal, setBOriginal] = useState(null);

  const canSaveProduct = useMemo(() => {
    const price = Number(pPrice);
    if (!pName || !pBrandId || Number.isNaN(price) || price < 0) return false;
    return true;
  }, [pName, pBrandId, pPrice]);

  const isProductDirty = useMemo(() => {
    if (!pOriginal && !pId) return !!(pName || pDesc || pImage || Number(pPrice) > 0 || (pBrandId && pBrandId !== ''));
    if (!pOriginal) return true;
    return (
      pName !== pOriginal.name ||
      pDesc !== pOriginal.description ||
      pCategory !== pOriginal.category ||
      pBrandId !== pOriginal.brandId ||
      Number(pPrice) !== Number(pOriginal.price) ||
      pImage !== pOriginal.image ||
      Number(pStock) !== Number(pOriginal.stock)
    );
  }, [pOriginal, pId, pName, pDesc, pCategory, pBrandId, pPrice, pImage, pStock]);

  const canSubmitProduct = canSaveProduct && isProductDirty;

  // Filtros para productos
  const filteredProducts = useMemo(() => {
    let filtered = state.products;
    
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }
    
    if (filterBrand !== 'all') {
      filtered = filtered.filter(p => p.brandId === filterBrand);
    }
    
    if (priceRange.min !== '') {
      filtered = filtered.filter(p => p.price >= Number(priceRange.min));
    }
    
    if (priceRange.max !== '') {
      filtered = filtered.filter(p => p.price <= Number(priceRange.max));
    }
    
    return filtered;
  }, [state.products, searchQuery, filterCategory, filterBrand, priceRange]);

  // Filtros para marcas
  const filteredBrands = useMemo(() => {
    let filtered = state.brands;
    
    if (searchQuery) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [state.brands, searchQuery]);

  function clearProductForm() {
    setPId(''); setPName(''); setPDesc(''); setPCategory('general'); setPBrandId(''); setPPrice('0'); setPImage(''); setPPreview('');
    setShowNewProductForm(false);
    setPOriginal(null);
  }
  
  function showNewProduct() {
    clearProductForm();
    setShowNewProductForm(true);
  }
  
  function showNewBrand() {
    clearBrandForm();
    setShowNewBrandForm(true);
  }
  
  function clearBrandForm() {
    setBId(''); setBName(''); setBDesc(''); setBLogo('');
    setShowNewBrandForm(false);
    setBOriginal(null);
  }

  function clearFilters() {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterBrand('all');
    setPriceRange({ min: '', max: '' });
  }

  function handleSearch() {
    // La búsqueda se maneja automáticamente con el estado searchQuery
    // Esta función puede ser llamada desde el botón "Buscar" de la barra
  }

  function loadProduct(id) {
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    setPId(p.id);
    setPName(p.name || '');
    setPDesc(p.description || '');
    setPCategory(p.category || 'general');
    setPBrandId(p.brandId || '');
    setPPrice(String(p.price || 0));
    setPImage(p.image || '');
    // valores opcionales si los tienes en memoria
    setPStock(String(p.stock_quantity || 0));
    setPMinStock(String(p.min_stock || 0));
    setPPreview(p.image || '');
    setShowNewProductForm(false);
    setPOriginal({
      name: p.name || '',
      description: p.description || '',
      category: p.category || 'general',
      brandId: p.brandId || '',
      price: Number(p.price || 0),
      image: p.image || '',
      stock: Number(p.stock_quantity || 0)
    });
  }
  async function saveProduct() {
    if (!canSaveProduct) return;
    const payload = { id: pId || undefined, name: pName, description: pDesc, category: pCategory, brand_id: pBrandId, price: Number(pPrice), image: pImage, stock_quantity: Number(pStock || 0), min_stock: Math.floor(Number(pStock || 0) * 0.3) };
    try {
      if (supabase && supabase.from) {
        const table = supabase.from('products');
        if (pId) await table.update(payload).eq('id', pId);
        else {
          const { data, error } = await table.insert(payload).select();
          if (!error && Array.isArray(data) && data[0] && data[0].id) payload.id = data[0].id;
        }
      }
    } catch (_e) {}
    dispatch({ type: ACTIONS.UPSERT_PRODUCT, payload: { id: payload.id, name: pName, description: pDesc, category: pCategory, brandId: pBrandId, price: Number(pPrice), image: pImage, stock_quantity: Number(pStock || 0), min_stock: Math.floor(Number(pStock || 0) * 0.3) } });
    clearProductForm();
    setShowNewProductForm(false);
    setLastUpdate(new Date());
  }
  async function deleteProduct(id) {
    openConfirm('¿Eliminar producto?', async () => {
      try { if (supabase && supabase.from) await supabase.from('products').delete().eq('id', id); } catch (_e) {}
      dispatch({ type: ACTIONS.DELETE_PRODUCT, payload: id }); setLastUpdate(new Date());
    });
  }

  function loadBrand(id) {
    const b = state.brands.find(x => x.id === id);
    if (!b) return;
    setBId(b.id);
    setBName(b.name || '');
    setBDesc(b.description || '');
    setBLogo(b.logo || '');
    setBOriginal({ name: b.name || '', description: b.description || '', logo: b.logo || '' });
  }
  async function saveBrand() {
    if (!bName) return;
    const payload = { id: bId || undefined, name: bName, description: bDesc, logo: bLogo };
    try {
      if (supabase && supabase.from) {
        const table = supabase.from('brands');
        if (bId) await table.update(payload).eq('id', bId);
        else {
          const { data, error } = await table.insert(payload).select();
          if (!error && Array.isArray(data) && data[0] && data[0].id) payload.id = data[0].id;
        }
      }
    } catch (_e) {}
    dispatch({ type: ACTIONS.UPSERT_BRAND, payload: { id: payload.id, name: bName, description: bDesc, logo: bLogo } });
    clearBrandForm();
    setLastUpdate(new Date());
  }

  const isBrandDirty = useMemo(() => {
    if (!bId) return !!(bName || bDesc || bLogo);
    if (!bOriginal) return true;
    return bName !== bOriginal.name || bDesc !== bOriginal.description || bLogo !== bOriginal.logo;
  }, [bId, bOriginal, bName, bDesc, bLogo]);
  async function deleteBrand(id) {
    const hasProducts = state.products.some(p => p.brandId === id);
    if (hasProducts) return; // impedimos eliminación si hay productos asociados
    openConfirm('¿Eliminar marca?', async () => {
      try { if (supabase && supabase.from) await supabase.from('brands').delete().eq('id', id); } catch (_e) {}
      dispatch({ type: ACTIONS.DELETE_BRAND, payload: id }); setLastUpdate(new Date());
    });
  }

  if (!state.user) {
    return <div style={{ padding: 12 }}>Cargando sesión…</div>;
  }
  if (!isAdmin) {
    // Debug ligero para ver qué llega del backend (quitar en producción)
    console.log('user->', state.user);
    if (isEmployee) {
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
          </section>
          <section className="com__address_bar">
            <div className="com__address_bar__title">Dirección</div>
            <div className="com__address_bar__content">
              <img src={computer} alt="ie" className="com__address_bar__content__img" />
              <div className="com__address_bar__content__text">Panel de Administración</div>
              <img src={dropdown} alt="dropdown" className="com__address_bar__content__img" />
            </div>
            <div className="com__address_bar__go">
              <img className="com__address_bar__go__img" src={go} alt="go" />
              <span className="com__address_bar__go__text">Ir</span>
            </div>
          </section>
          <div className="com__content">
            <div className="com__content__inner">
              <div className="com__content__right">
                <div className="com__content__right__card">
                  <div className="com__content__right__card__header">Acceso Restringido</div>
                  <div className="com__content__right__card__content" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '400px',
                    textAlign: 'center',
                    padding: '40px 20px'
                  }}>
                    {/* Icono principal con animación sutil */}
                    <div style={{
                      fontSize: '64px',
                      marginBottom: '20px',
                      animation: 'pulse 2s infinite',
                      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                    }}>
                      🔒
                    </div>
                    
                    {/* Título principal */}
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#cc0000',
                      marginBottom: '12px',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                      fontFamily: 'Tahoma, Arial, sans-serif'
                    }}>
                      Acceso Denegado
                    </div>
                    
                    {/* Mensaje principal */}
                    <div style={{
                      fontSize: '14px',
                      color: '#333',
                      marginBottom: '20px',
                      maxWidth: '400px',
                      lineHeight: '1.4',
                      fontFamily: 'Tahoma, Arial, sans-serif'
                    }}>
                      Los empleados no tienen acceso al panel de administración.
                    </div>
                    
                    {/* Panel de información estilo Windows XP */}
                    <div style={{
                      background: 'linear-gradient(to bottom, #f0f0f0 0%, #e0e0e0 100%)',
                      border: '2px outset #f0f0f0',
                      borderRadius: '6px',
                      padding: '16px',
                      marginBottom: '20px',
                      boxShadow: 'inset 0 1px 0 #fff, 0 2px 4px rgba(0,0,0,0.1)',
                      maxWidth: '350px',
                      width: '100%'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          fontSize: '20px',
                          marginRight: '8px'
                        }}>ℹ️</div>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#0c327d'
                        }}>Información del Sistema</div>
                      </div>
                      
                      <div style={{
                        fontSize: '11px',
                        color: '#333',
                        lineHeight: '1.3'
                      }}>
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Usuario:</strong> {state.user?.email || 'No identificado'}
                        </div>
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Rol:</strong> Empleado
                        </div>
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Permisos:</strong> Solo acceso al catálogo de ventas
                        </div>
                        <div>
                          <strong>Estado:</strong> <span style={{ color: '#cc0000' }}>Restringido</span>
                        </div>
                      </div>
                    </div>
                    
                    
                    {/* Mensaje de ayuda */}
                    <div style={{
                      marginTop: '20px',
                      fontSize: '10px',
                      color: '#666',
                      fontStyle: 'italic',
                      maxWidth: '300px'
                    }}>
                      Si necesitas acceso administrativo, contacta al administrador del sistema.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Barra de estado */}
          <div style={{ 
            marginTop: 8, 
            background: '#e8e4cf', 
            border: '1px solid #b8b4a2', 
            padding: '0px 8px', 
            fontSize: 11 
          }}>
            Estado: Acceso restringido | Usuario: {state.user?.email || 'No identificado'} | Rol: Empleado
          </div>
          
          {/* CSS para animación */}
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
          `}</style>
        </Div>
      );
    }
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
        </section>
        <section className="com__address_bar">
          <div className="com__address_bar__title">Dirección</div>
          <div className="com__address_bar__content">
            <img src={computer} alt="ie" className="com__address_bar__content__img" />
            <div className="com__address_bar__content__text">Panel de Administración</div>
            <img src={dropdown} alt="dropdown" className="com__address_bar__content__img" />
          </div>
          <div className="com__address_bar__go">
            <img className="com__address_bar__go__img" src={go} alt="go" />
            <span className="com__address_bar__go__text">Ir</span>
          </div>
        </section>
        <div className="com__content">
          <div className="com__content__inner">
            <div className="com__content__right">
              <div className="com__content__right__card">
                <div className="com__content__right__card__header">Acceso Requerido</div>
                <div className="com__content__right__card__content" style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  minHeight: '400px',
                  textAlign: 'center',
                  padding: '40px 20px'
                }}>
                  {/* Icono principal con animación sutil */}
                  <div style={{
                    fontSize: '64px',
                    marginBottom: '20px',
                    animation: 'bounce 2s infinite',
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    🔑
                  </div>
                  
                  {/* Título principal */}
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#ff6b35',
                    marginBottom: '12px',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    fontFamily: 'Tahoma, Arial, sans-serif'
                  }}>
                    Autenticación Requerida
                  </div>
                  
                  {/* Mensaje principal */}
                  <div style={{
                    fontSize: '14px',
                    color: '#333',
                    marginBottom: '20px',
                    maxWidth: '400px',
                    lineHeight: '1.4',
                    fontFamily: 'Tahoma, Arial, sans-serif'
                  }}>
                    Inicia sesión como Administrador para acceder al panel de administración.
                  </div>
                  
                  {/* Panel de información estilo Windows XP */}
                  <div style={{
                    background: 'linear-gradient(to bottom, #f0f0f0 0%, #e0e0e0 100%)',
                    border: '2px outset #f0f0f0',
                    borderRadius: '6px',
                    padding: '16px',
                    marginBottom: '20px',
                    boxShadow: 'inset 0 1px 0 #fff, 0 2px 4px rgba(0,0,0,0.1)',
                    maxWidth: '350px',
                    width: '100%'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        fontSize: '20px',
                        marginRight: '8px'
                      }}>⚠️</div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#0c327d'
                      }}>Información de Acceso</div>
                    </div>
                    
                    <div style={{
                      fontSize: '11px',
                      color: '#333',
                      lineHeight: '1.3'
                    }}>
                      <div style={{ marginBottom: '6px' }}>
                        <strong>Estado:</strong> <span style={{ color: '#ff6b35' }}>No autenticado</span>
                      </div>
                      <div style={{ marginBottom: '6px' }}>
                        <strong>Acceso requerido:</strong> Administrador
                      </div>
                      <div style={{ marginBottom: '6px' }}>
                        <strong>Permisos necesarios:</strong> Panel de administración completo
                      </div>
                      <div>
                        <strong>Acción:</strong> Iniciar sesión con credenciales de administrador
                      </div>
                    </div>
                  </div>
                  
                  
                  {/* Mensaje de ayuda */}
                  <div style={{
                    marginTop: '20px',
                    fontSize: '10px',
                    color: '#666',
                    fontStyle: 'italic',
                    maxWidth: '300px'
                  }}>
                    Contacta al administrador del sistema si necesitas acceso.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Barra de estado */}
        <div style={{ 
          marginTop: 8, 
          background: '#e8e4cf', 
          border: '1px solid #b8b4a2', 
          padding: '0px 8px', 
          fontSize: 11 
        }}>
          Estado: No autenticado | Acceso requerido: Administrador | Panel: Restringido
        </div>
        
        {/* CSS para animación */}
        <style>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
        `}</style>
      </Div>
    );
  }

  const totalProducts = state.products.length;
  const totalBrands = state.brands.length;

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
        <div className="com__function_bar__button" onClick={handleSearch}>
          <img className="com__function_bar__icon--normalize" src={search} alt="" />
          <span className="com__function_bar__text">Buscar</span>
        </div>
        <div className="com__function_bar__button">
          <img className="com__function_bar__icon--normalize" src={folderOpen} alt="" />
          <span className="com__function_bar__text">Carpetas</span>
        </div>
        <div className={`com__function_bar__button ${tab === 'products' ? 'com__function_bar__button--active' : ''}`} onClick={() => setTab('products')}>
          <img className="com__function_bar__icon--normalize" src={folderOpen} alt="" />
          <span className="com__function_bar__text">Productos</span>
        </div>
        <div className={`com__function_bar__button ${tab === 'brands' ? 'com__function_bar__button--active' : ''}`} onClick={() => setTab('brands')}>
          <img className="com__function_bar__icon--normalize" src={folderOpen} alt="" />
          <span className="com__function_bar__text">Marcas</span>
        </div>
        <div className={`com__function_bar__button ${tab === 'sales' ? 'com__function_bar__button--active' : ''}`} onClick={() => setTab('sales')}>
          <img className="com__function_bar__icon--normalize" src={folderOpen} alt="" />
          <span className="com__function_bar__text">Ventas</span>
        </div>
      </section>
      <section className="com__address_bar">
        <div className="com__address_bar__title">Dirección</div>
        <div className="com__address_bar__content">
          <img src={computer} alt="ie" className="com__address_bar__content__img" />
          <div className="com__address_bar__content__text">Administrador</div>
          <img src={dropdown} alt="dropdown" className="com__address_bar__content__img" />
        </div>
        <div className="com__address_bar__go">
          <img className="com__address_bar__go__img" src={go} alt="go" />
          <span className="com__address_bar__go__text">Ir</span>
        </div>
      </section>
      {/* Contenido */}
      <div className="com__content">
        <div className="com__content__inner">
          <div className="com__content__left">
            <div className="com__content__left__card">
              <div className="com__content__left__card__header">
                <div className="com__content__left__card__header__text">Herramientas</div>
                <img src={pullup} alt="" className="com__content__left__card__header__img" />
              </div>
              <div className="com__content__left__card__content">
                {/* Acciones de creación */}
                {tab === 'products' && (
                  <div className="com__content__left__card__row">
                    <button style={btn()} onClick={showNewProductForm ? clearProductForm : showNewProduct}>
                      <img src={edit} alt="" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                      {showNewProductForm ? 'Ocultar formulario' : 'Nuevo producto'}
                    </button>
                  </div>
                )}

    {/* Confirm dialog estilo Windows XP */}
    {confirmDialog.open && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
        <div style={{ width: 380, background: '#f0f0f0', border: '2px outset #f0f0f0', boxShadow: '2px 2px 6px rgba(0,0,0,0.35)' }}>
          <div style={{ background: 'linear-gradient(to bottom, #316ac5 0%, #1e4a8c 100%)', color: '#fff', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e4a8c' }}>
            <span style={{ fontWeight: 'bold', fontSize: 12 }}>{confirmDialog.title}</span>
            <button onClick={closeConfirm} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ padding: 14, background: '#fff', border: '1px inset #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 28, color: '#cc0000' }}>❌</div>
              <div style={{ fontSize: 12, color: '#000' }}>{confirmDialog.message}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14 }}>
              <button onClick={async () => { try { if (typeof confirmDialog.onConfirm === 'function') await confirmDialog.onConfirm(); } finally { closeConfirm(); } }}
                style={{ padding: '6px 16px', background: 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)', border: '1px outset #f0f0f0', fontWeight: 'bold', cursor: 'pointer' }}>Aceptar</button>
              <button onClick={closeConfirm} style={{ padding: '6px 16px', background: 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)', border: '1px outset #f0f0f0', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    )}
                {tab === 'brands' && (
                  <div className="com__content__left__card__row">
                    <button style={btn()} onClick={showNewBrandForm ? clearBrandForm : showNewBrand}>
                      <img src={edit} alt="" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                      {showNewBrandForm ? 'Ocultar formulario' : 'Nueva marca'}
                    </button>
                  </div>
                )}
                
                {/* Separador visual */}
                <div style={{ height: '1px', background: '#bdb8a6', margin: '8px 0' }}></div>
                
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
                      placeholder="Escriba para buscar..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0px 8px', 
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

                {/* Filtros para productos */}
                {tab === 'products' && (
                  <>
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
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          style={{ 
                            width: '100%', 
                            padding: '0px 8px', 
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
                          value={filterBrand}
                          onChange={(e) => setFilterBrand(e.target.value)}
                          style={{ 
                            width: '100%', 
                            padding: '0px 8px', 
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
                    
                    <div className="com__content__left__card__row">
                      <div style={{ 
                        background: 'linear-gradient(135deg, #f8fff0 0%, #e8ffe0 100%)',
                        border: '1px solid #a8ffa8',
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
                        }}>Rango de Precios</label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '10px', color: '#666', marginBottom: '2px', display: 'block' }}>Mín.</label>
                            <input 
                              type="number" 
                              placeholder="0" 
                              value={priceRange.min}
                              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                              style={{ 
                                width: '100%', 
                                padding: '4px 6px', 
                                fontSize: '11px', 
                                border: '1px solid #7aa2e8',
                                borderRadius: '3px',
                                background: '#fff',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                                outline: 'none'
                              }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '10px', color: '#666', marginBottom: '2px', display: 'block' }}>Máx.</label>
                            <input 
                              type="number" 
                              placeholder="∞" 
                              value={priceRange.max}
                              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                              style={{ 
                                width: '100%', 
                                padding: '4px 6px', 
                                fontSize: '11px', 
                                border: '1px solid #7aa2e8',
                                borderRadius: '3px',
                                background: '#fff',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                                outline: 'none'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Separador visual */}
                <div style={{ height: '1px', background: '#bdb8a6', margin: '8px 0' }}></div>

                {/* Botón limpiar filtros */}
                <div className="com__content__left__card__row">
                  <button 
                    onClick={clearFilters}
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
                      outline: 'none'
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
                    <img src={refresh} alt="" style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                    Limpiar filtros
                  </button>
                </div>
                
                {/* Contador */}
                <div className="com__content__left__card__row" style={{ color: '#0c327d', marginTop: '8px', fontSize: '10px' }}>
                  Total: {tab === 'products' ? `${filteredProducts.length} de ${totalProducts} productos` : `${filteredBrands.length} de ${totalBrands} marcas`}
                </div>
              </div>
            </div>
          </div>
          <div className="com__content__right">
            <div className="com__content__right__card">
              <div className="com__content__right__card__header">{tab === 'products' ? 'Catálogo de Productos' : 'Catálogo de Marcas'}</div>
              <div className="com__content__right__card__content" style={{ width: '100%' }}>
                {/* contenido existente del panel */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

      {showLauncher && (
        <div style={{
          background: 'linear-gradient(#e6f0ff,#cfe0ff)',
          border: '1px solid #7aa2e8',
          padding: 10,
          marginBottom: 10,
        }}>
          <strong>Accesos rápidos</strong>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => setTab('products')} style={{ marginRight: 6 }}>Productos</button>
            <button onClick={() => setTab('brands')} style={{ marginRight: 6 }}>Marcas</button>
            <button onClick={() => openCatalog && openCatalog()}>Ver catálogo</button>
        </div>
      </div>
      )}

      {tab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: (pId || showNewProductForm) && !isNarrow ? '2fr 1fr' : '1fr', gap: 12, flex: 1 }}>
          <div style={{ overflow: 'auto' }}>
            <div style={groupHeader()}>Productos</div>
            <div style={groupBody()}>
            <div style={{ display: 'grid', gridTemplateColumns: (pId || showNewProductForm) && !isNarrow ? 'repeat(auto-fill,minmax(240px,1fr))' : 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
              {filteredProducts.map(p => (
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
                      background: 'linear-gradient(to bottom, #5a8ddb 0%, #316ac5 100%)',
                      color: 'white',
                      padding: '3px 8px',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      border: '1px solid #1e4a8c',
                      borderRadius: '3px',
                      boxShadow: 'inset 0 1px 0 #7ba3e0, 0 1px 2px rgba(0,0,0,0.2)',
                      textShadow: '0 1px 1px rgba(0,0,0,0.3)'
                    }}>
                      {p.category === 'general' ? 'ELECTRÓNICOS' : (p.category || 'GENERAL').toUpperCase()}
                    </div>
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
                        <span style={{ 
                          marginRight: '4px', 
                          fontSize: '12px',
                          color: '#ffa500',
                          textShadow: '0 1px 1px rgba(0,0,0,0.1)'
                        }}>🏷️</span>
                        <span style={{ fontWeight: '500' }}>{(function(){ const fb=state.brands.find(b=>b.id===p.brandId); return (fb && fb.name) || 'Sin marca'; })()}</span>
                      </div>
                      {(typeof p.stock_quantity === 'number') && (
                        <div style={{ fontSize: 10, color: '#666', textAlign: 'center' }}>
                          Disponible: {p.stock_quantity}{typeof p.min_stock === 'number' ? ` (mínimo ${p.min_stock})` : ''}
                        </div>
                      )}
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
                        onClick={() => loadProduct(p.id)}
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
                        <span style={{ fontSize: '10px' }}>✏️</span>
                        Editar
                      </button>
                      <button 
                        onClick={() => deleteProduct(p.id)}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          background: 'linear-gradient(to bottom, #ff6b6b 0%, #ff5252 100%)',
                          border: '1px outset #ff5252',
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
                          boxShadow: 'inset 0 1px 0 #ff8a80, 0 1px 2px rgba(0,0,0,0.2)',
                          textShadow: '0 1px 1px rgba(0,0,0,0.3)'
                        }}
                        onMouseDown={(e) => {
                          e.target.style.background = 'linear-gradient(to bottom, #ff5252 0%, #ff6b6b 100%)';
                          e.target.style.boxShadow = 'inset 0 1px 0 #ff8a80, 0 1px 1px rgba(0,0,0,0.2)';
                        }}
                        onMouseUp={(e) => {
                          e.target.style.background = 'linear-gradient(to bottom, #ff6b6b 0%, #ff5252 100%)';
                          e.target.style.boxShadow = 'inset 0 1px 0 #ff8a80, 0 1px 2px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(to bottom, #ff6b6b 0%, #ff5252 100%)';
                          e.target.style.boxShadow = 'inset 0 1px 0 #ff8a80, 0 1px 2px rgba(0,0,0,0.2)';
                        }}
                      >
                        <span style={{ fontSize: '10px' }}>🗑️</span>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
          {(pId || showNewProductForm) && (
          <div style={{ overflow: 'auto' }}>
              <div style={groupHeader()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{pId ? 'Editar producto' : 'Nuevo producto'}</span>
                  <button 
                    onClick={() => { setPId(''); setShowNewProductForm(false); }}
                    style={{ padding: '4px 8px', background: 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)', border: '1px solid #999', fontSize: 11, cursor: 'pointer' }}
                  >Ocultar</button>
                </div>
              </div>
            <div style={{ ...groupBody(), maxWidth: isNarrow ? '100%' : 'unset' }}>
                {/* Sección de información básica */}
                <div style={{ 
                  background: '#f0f0f0',
                  border: '1px solid #999',
                  padding: '8px',
                  marginBottom: '8px',
                  boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                }}>
                  <div style={{ 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    color: '#000', 
                    marginBottom: '6px'
                  }}>Información básica</div>
                  <Field label="Nombre del producto">
                    <input 
                      value={pName} 
                      onChange={e => setPName(e.target.value)}
                      placeholder="Ingrese el nombre del producto..."
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        border: '1px solid #999',
                        fontSize: '11px',
                        background: '#fff',
                        fontFamily: 'Tahoma, Arial, sans-serif',
                        boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                      }}
                      onFocus={(e) => e.target.style.border = '1px solid #4a90e2'}
                      onBlur={(e) => e.target.style.border = '1px solid #999'}
                    />
                  </Field>
                  <Field label="Descripción">
                    <textarea 
                      value={pDesc} 
                      onChange={e => setPDesc(e.target.value)}
                      placeholder="Descripción del producto..."
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        border: '1px solid #999',
                        fontSize: '11px',
                        background: '#fff',
                        fontFamily: 'Tahoma, Arial, sans-serif',
                        resize: 'vertical',
                        boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                      }}
                      onFocus={(e) => e.target.style.border = '1px solid #4a90e2'}
                      onBlur={(e) => e.target.style.border = '1px solid #999'}
                    />
                  </Field>
                </div>

                {/* Sección de categorización */}
                <div style={{ 
                  background: '#f0f0f0',
                  border: '1px solid #999',
                  padding: '8px',
                  marginBottom: '8px',
                  boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                }}>
                  <div style={{ 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    color: '#000', 
                    marginBottom: '6px'
                  }}>Categorización</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '8px' }}>
            <Field label="Categoría">
                      <select 
                        value={pCategory} 
                        onChange={e => setPCategory(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '4px 6px',
                          border: '1px solid #999',
                          fontSize: '11px',
                          background: '#fff',
                          fontFamily: 'Tahoma, Arial, sans-serif',
                          cursor: 'pointer',
                          boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                        }}
                        onFocus={(e) => e.target.style.border = '1px solid #4a90e2'}
                        onBlur={(e) => e.target.style.border = '1px solid #999'}
                      >
                <option value="general">General</option>
                <option value="otros">Otros</option>
              </select>
            </Field>
            <Field label="Marca">
                      <select 
                        value={pBrandId} 
                        onChange={e => setPBrandId(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '4px 6px',
                          border: '1px solid #999',
                          fontSize: '11px',
                          background: '#fff',
                          fontFamily: 'Tahoma, Arial, sans-serif',
                          cursor: 'pointer',
                          boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                        }}
                        onFocus={(e) => e.target.style.border = '1px solid #4a90e2'}
                        onBlur={(e) => e.target.style.border = '1px solid #999'}
                      >
                        <option value="">Seleccione una marca</option>
                {state.brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>
                  </div>
                </div>

                {/* Sección de precio */}
                <div style={{ 
                  background: '#f0f0f0',
                  border: '1px solid #999',
                  padding: '8px',
                  marginBottom: '8px',
                  boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                }}>
                  <div style={{ 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    color: '#000', 
                    marginBottom: '6px'
                  }}>Precio</div>
                  <Field label="Precio ($)">
                    <input 
                      type="number" 
                      min="0" 
                      step="0.01"
                      value={pPrice} 
                      onChange={e => setPPrice(e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        border: '1px solid #999',
                        fontSize: '11px',
                        background: '#fff',
                        fontFamily: 'Tahoma, Arial, sans-serif',
                        boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                      }}
                      onFocus={(e) => e.target.style.border = '1px solid #4a90e2'}
                      onBlur={(e) => e.target.style.border = '1px solid #999'}
                    />
                  </Field>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginTop: 8 }}>
                    <Field label="Stock">
                      <input 
                        type="number" 
                        min="0" 
                        step="1"
                        value={pStock} 
                        onChange={e => setPStock(e.target.value)}
                        placeholder="0"
                        style={{
                          width: '100%',
                          padding: '4px 6px',
                          border: '1px solid #999',
                          fontSize: '11px',
                          background: '#fff',
                          fontFamily: 'Tahoma, Arial, sans-serif',
                          boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                        }}
                        onFocus={(e) => e.target.style.border = '1px solid #4a90e2'}
                        onBlur={(e) => e.target.style.border = '1px solid #999'}
                      />
                    </Field>
                  </div>
                </div>

                {/* Sección de imagen */}
                <div style={{ 
                  background: '#f0f0f0',
                  border: '1px solid #999',
                  padding: '8px',
                  marginBottom: '8px',
                  boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                }}>
                  <div style={{ 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    color: '#000', 
                    marginBottom: '6px'
                  }}>Imagen del producto</div>
                  <Field label="URL de la imagen">
                    <input 
                      value={pImage} 
                      onChange={e => { setPImage(e.target.value); setPPreview(e.target.value); }}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        border: '1px solid #999',
                        fontSize: '11px',
                        background: '#fff',
                        fontFamily: 'Tahoma, Arial, sans-serif',
                        boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                      }}
                      onFocus={(e) => e.target.style.border = '1px solid #4a90e2'}
                      onBlur={(e) => e.target.style.border = '1px solid #999'}
                    />
                  </Field>
            {pPreview && (
                    <div style={{ 
                      marginTop: '6px',
                      textAlign: 'center',
                      background: '#fff',
                      border: '1px solid #999',
                      padding: '6px',
                      boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                    }}>
                      <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>Vista previa:</div>
                      <img 
                        alt="Vista previa" 
                        src={pPreview} 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '120px'
                        }} 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{ 
                        display: 'none', 
                        color: '#999', 
                        fontSize: '11px',
                        padding: '16px'
                      }}>
                        No se pudo cargar la imagen
                      </div>
              </div>
            )}
                </div>

                {/* Botones de acción */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: isNarrow ? '1fr' : 'repeat(2, 1fr)',
                  gap: '8px',
                  justifyContent: 'center',
                  justifyItems: 'center',
                  width: '100%',
                  boxSizing: 'border-box',
                  marginTop: '12px'
                }}>
                  <button 
                    style={{
                      padding: '6px 12px',
                      background: canSubmitProduct ? 'linear-gradient(to bottom, #4CAF50 0%, #45a049 100%)' : 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)',
                      border: canSubmitProduct ? '1px solid #2e7d32' : '1px solid #999',
                      color: canSubmitProduct ? '#fff' : '#000',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: canSubmitProduct ? 'pointer' : 'not-allowed',
                      opacity: canSubmitProduct ? 1 : 0.6,
                      fontFamily: 'Tahoma, Arial, sans-serif',
                      boxShadow: canSubmitProduct ? 'inset 0 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.1)' : 'inset 0 1px 0 #fff, 0 1px 0 #999',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    disabled={!canSubmitProduct} 
                    onClick={saveProduct}
                    onMouseDown={(e) => {
                      if (canSubmitProduct) {
                        e.target.style.background = 'linear-gradient(to bottom, #45a049 0%, #3d8b40 100%)';
                        e.target.style.boxShadow = 'inset 0 1px 0 #2e7d32, 0 1px 2px rgba(0,0,0,0.1)';
                      }
                    }}
                    onMouseUp={(e) => {
                      if (canSubmitProduct) {
                        e.target.style.background = 'linear-gradient(to bottom, #4CAF50 0%, #45a049 100%)';
                        e.target.style.boxShadow = 'inset 0 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canSubmitProduct) {
                        e.target.style.background = 'linear-gradient(to bottom, #4CAF50 0%, #45a049 100%)';
                        e.target.style.boxShadow = 'inset 0 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.1)';
                      }
                    }}
                  >
                    <span>💾</span>
                    {pId ? 'Guardar cambios' : 'Crear producto'}
                  </button>
                  <button 
                    style={{
                      padding: '6px 12px',
                      background: 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)',
                      border: '1px solid #999',
                      color: '#000',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontFamily: 'Tahoma, Arial, sans-serif',
                      boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onClick={clearProductForm}
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
                    <span>🗑️</span>
                    Limpiar
                  </button>
                  
            </div>
            </div>
          </div>
          )}
        </div>
      )}

      {tab === 'brands' && (
        <div style={{ display: 'grid', gridTemplateColumns: (bId || showNewBrandForm) ? '2fr 1fr' : '1fr', gap: 12, flex: 1 }}>
          <div style={{ overflow: 'auto' }}>
            <div style={groupHeader()}>Marcas</div>
            <div style={groupBody()}>
            <div style={{ display: 'grid', gridTemplateColumns: (bId || showNewBrandForm) ? 'repeat(auto-fill,minmax(240px,1fr))' : 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
              {filteredBrands.map(b => (
                <div key={b.id} style={{ 
                  border: '1px solid #b0c4ff', 
                  background: '#fff', 
                  boxShadow: 'inset 0 0 0 1px #dde6ff',
                  fontFamily: 'Tahoma, Arial, sans-serif'
                }}>
                  {/* Imagen del logo */}
                  <div style={{ 
                    height: 140, 
                    background: '#f4f4f4', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    borderBottom: '1px solid #ccd6ff',
                    position: 'relative'
                  }}>
                    {b.logo ? (
                      <img 
                        alt={b.name} 
                        src={b.logo} 
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
                        <span style={{ fontSize: '24px', marginBottom: '4px' }}>🏢</span>
                        <span>Sin logo</span>
                  </div>
                    )}
                    {/* Badge de tipo de marca */}
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'linear-gradient(to bottom, #5a8ddb 0%, #316ac5 100%)',
                      color: 'white',
                      padding: '3px 8px',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      border: '1px solid #1e4a8c',
                      borderRadius: '3px',
                      boxShadow: 'inset 0 1px 0 #7ba3e0, 0 1px 2px rgba(0,0,0,0.2)',
                      textShadow: '0 1px 1px rgba(0,0,0,0.3)'
                    }}>
                      MARCA
                    </div>
                  </div>
                  
                  {/* Contenido de la tarjeta */}
                  <div style={{ padding: '8px' }}>
                    {/* Nombre de la marca */}
                    <div style={{ 
                      fontWeight: 'bold', 
                      textAlign: 'center',
                      fontSize: '13px',
                      color: '#000',
                      marginBottom: '6px'
                    }}>
                      {b.name}
                    </div>
                    
                    {/* Descripción de la marca */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ 
                        fontSize: 11, 
                        color: '#333', 
                        marginBottom: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ 
                          marginRight: '4px', 
                          fontSize: '12px',
                          color: '#ffa500',
                          textShadow: '0 1px 1px rgba(0,0,0,0.1)'
                        }}>📝</span>
                        <span style={{ fontWeight: '500' }}>{b.description || 'Sin descripción'}</span>
                      </div>
                    </div>
                    
                    {/* Botones de acción estilo Windows XP */}
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => loadBrand(b.id)}
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
                        <span style={{ fontSize: '10px' }}>✏️</span>
                        Editar
                      </button>
                      <button 
                        disabled={state.products.some(p => p.brandId === b.id)}
                        onClick={() => deleteBrand(b.id)}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          background: state.products.some(p => p.brandId === b.id) 
                            ? 'linear-gradient(to bottom, #e0e0e0 0%, #d0d0d0 100%)'
                            : 'linear-gradient(to bottom, #ff6b6b 0%, #ff5252 100%)',
                          border: state.products.some(p => p.brandId === b.id) 
                            ? '1px outset #d0d0d0'
                            : '1px outset #ff5252',
                          borderRadius: '3px',
                          color: state.products.some(p => p.brandId === b.id) ? '#999' : '#fff',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: state.products.some(p => p.brandId === b.id) ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          fontFamily: 'Tahoma, Arial, sans-serif',
                          boxShadow: state.products.some(p => p.brandId === b.id) 
                            ? 'inset 0 1px 0 #e0e0e0, 0 1px 2px rgba(0,0,0,0.1)'
                            : 'inset 0 1px 0 #ff8a80, 0 1px 2px rgba(0,0,0,0.2)',
                          textShadow: state.products.some(p => p.brandId === b.id) 
                            ? '0 1px 0 rgba(255,255,255,0.5)'
                            : '0 1px 1px rgba(0,0,0,0.3)'
                        }}
                        onMouseDown={(e) => {
                          if (!state.products.some(p => p.brandId === b.id)) {
                            e.target.style.background = 'linear-gradient(to bottom, #ff5252 0%, #ff6b6b 100%)';
                            e.target.style.boxShadow = 'inset 0 1px 0 #ff8a80, 0 1px 1px rgba(0,0,0,0.2)';
                          }
                        }}
                        onMouseUp={(e) => {
                          if (!state.products.some(p => p.brandId === b.id)) {
                            e.target.style.background = 'linear-gradient(to bottom, #ff6b6b 0%, #ff5252 100%)';
                            e.target.style.boxShadow = 'inset 0 1px 0 #ff8a80, 0 1px 2px rgba(0,0,0,0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!state.products.some(p => p.brandId === b.id)) {
                            e.target.style.background = 'linear-gradient(to bottom, #ff6b6b 0%, #ff5252 100%)';
                            e.target.style.boxShadow = 'inset 0 1px 0 #ff8a80, 0 1px 2px rgba(0,0,0,0.2)';
                          }
                        }}
                      >
                        <span style={{ fontSize: '10px' }}>🗑️</span>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
          {(bId || showNewBrandForm) && (
          <div style={{ overflow: 'auto' }}>
            <div style={groupHeader()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{bId ? 'Editar' : 'Nueva'} marca</span>
                <button 
                  onClick={() => { setBId(''); setShowNewBrandForm(false); }}
                  style={{ padding: '4px 8px', background: 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)', border: '1px solid #999', fontSize: 11, cursor: 'pointer' }}
                >Ocultar</button>
              </div>
            </div>
            <div style={groupBody()}>
            {/* Sección principal de la marca (estética Windows XP) */}
            <div style={{ 
              background: '#f0f0f0', 
              border: '1px solid #999', 
              padding: 8, 
              marginBottom: 8,
              boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
            }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 'bold', 
                color: '#000',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>🏢 Datos de la marca</div>
              <Field label="Nombre">
                <input 
                  value={bName} 
                  onChange={e => setBName(e.target.value)}
                  placeholder="Ingrese el nombre de la marca..."
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    border: '1px solid #999',
                    fontSize: '11px',
                    background: '#fff',
                    fontFamily: 'Tahoma, Arial, sans-serif',
                    boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                  }}
                  onFocus={(e) => e.target.style.border = '1px solid #4a90e2'}
                  onBlur={(e) => e.target.style.border = '1px solid #999'}
                />
              </Field>
              <Field label="Descripción">
                <textarea 
                  value={bDesc} 
                  onChange={e => setBDesc(e.target.value)}
                  placeholder="Breve descripción..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    border: '1px solid #999',
                    fontSize: '11px',
                    background: '#fff',
                    fontFamily: 'Tahoma, Arial, sans-serif',
                    resize: 'vertical',
                    boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                  }}
                  onFocus={(e) => e.target.style.border = '1px solid #4a90e2'}
                  onBlur={(e) => e.target.style.border = '1px solid #999'}
                />
              </Field>
              <Field label="Logo URL">
                <input 
                  value={bLogo} 
                  onChange={e => setBLogo(e.target.value)}
                  placeholder="https://ejemplo.com/logo.png"
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    border: '1px solid #999',
                    fontSize: '11px',
                    background: '#fff',
                    fontFamily: 'Tahoma, Arial, sans-serif',
                    boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
                  }}
                  onFocus={(e) => e.target.style.border = '1px solid #4a90e2'}
                  onBlur={(e) => e.target.style.border = '1px solid #999'}
                />
              </Field>
            </div>

            {/* Vista previa del logo */}
            {bLogo && (
              <div style={{ 
                marginBottom: 8,
                textAlign: 'center',
                background: '#fff',
                border: '1px solid #999',
                padding: 6,
                boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999'
              }}>
                <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>Vista previa:</div>
                <img alt="logo" src={bLogo} style={{ maxWidth: 140, height: 'auto' }} />
              </div>
            )}

            {/* Acciones */}
            <div style={{ display: 'grid', gridTemplateColumns: isNarrow ? '1fr' : 'repeat(2, 1fr)', gap: 8, justifyItems: 'center', width: '100%', boxSizing: 'border-box' }}>
              <button 
                style={{
                  padding: '6px 12px',
                  background: isBrandDirty ? 'linear-gradient(to bottom, #4CAF50 0%, #45a049 100%)' : 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)',
                  border: isBrandDirty ? '1px solid #2e7d32' : '1px solid #999',
                  color: isBrandDirty ? '#fff' : '#000',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: isBrandDirty ? 'pointer' : 'not-allowed',
                  opacity: isBrandDirty ? 1 : 0.6,
                  fontFamily: 'Tahoma, Arial, sans-serif',
                  boxShadow: isBrandDirty ? 'inset 0 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.1)' : 'inset 0 1px 0 #fff, 0 1px 0 #999'
                }} 
                disabled={!isBrandDirty}
                onClick={saveBrand}
                onMouseDown={(e) => {
                  if (isBrandDirty) {
                    e.target.style.background = 'linear-gradient(to bottom, #45a049 0%, #3d8b40 100%)';
                    e.target.style.boxShadow = 'inset 0 1px 0 #2e7d32, 0 1px 2px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseUp={(e) => {
                  if (isBrandDirty) {
                    e.target.style.background = 'linear-gradient(to bottom, #4CAF50 0%, #45a049 100%)';
                    e.target.style.boxShadow = 'inset 0 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isBrandDirty) {
                    e.target.style.background = 'linear-gradient(to bottom, #4CAF50 0%, #45a049 100%)';
                    e.target.style.boxShadow = 'inset 0 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.1)';
                  }
                }}
              >
                <span>💾</span>
                {bId ? 'Guardar cambios' : 'Crear marca'}
              </button>
              <button 
                style={{
                  padding: '6px 12px',
                  background: 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)',
                  border: '1px solid #999',
                  color: '#000',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'Tahoma, Arial, sans-serif',
                  boxShadow: 'inset 0 1px 0 #fff, 0 1px 0 #999',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onClick={clearBrandForm}
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
                <span>🗑️</span>
                Limpiar
              </button>
            </div>
            </div>
          </div>
          )}
        </div>
      )}

      {tab === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div style={groupHeader()}>Registro de Ventas</div>
          <div style={groupBody()}>
            <div style={{
              display: 'flex',
              justifyContent: isNarrow ? 'flex-end' : 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Total de ventas: {sales.length}
              </div>
            {/* Botón eliminado: las ventas ahora se cargan automáticamente */}
            <button 
              onClick={() => setSalesRefreshToken(x => x + 1)}
              style={{
                padding: '6px 12px',
                background: 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)',
                border: '1px solid #999',
                borderRadius: '3px',
                color: '#000',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'Tahoma, Arial, sans-serif',
                marginLeft: 8
              }}
            >
              🔁 Actualizar
            </button>
            </div>

            {sales.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666',
                background: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                <div>No hay ventas registradas</div>
                <div style={{ marginTop: '8px', fontSize: '12px' }}>
                  Haz clic en "Cargar Ventas" para ver el historial
                </div>
              </div>
            ) : (
              <div style={{ 
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                {/* Header de la tabla */}
                <div style={{
                  background: 'linear-gradient(to bottom, #f0f0f0 0%, #e0e0e0 100%)',
                  borderBottom: '1px solid #999',
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 120px 100px 120px 160px',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  <div>#</div>
                  <div>Cliente</div>
                  <div>Total</div>
                  <div>Pago</div>
                  <div>Fecha</div>
                  <div>Acciones</div>
                </div>

                {/* Filas de la tabla */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {sales.map((sale, index) => (
                    <div key={sale.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr 120px 100px 120px 160px',
                      gap: '8px',
                      padding: '8px 12px',
                      borderBottom: index < sales.length - 1 ? '1px solid #eee' : 'none',
                      fontSize: '11px',
                      alignItems: 'center',
                      background: index % 2 === 0 ? '#fff' : '#f9f9f9'
                    }}>
                    <div style={{ fontWeight: 'bold', color: '#316ac5' }}>#{index + 1}</div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{sale.customerName}</div>
                        <div style={{ fontSize: '10px', color: '#666' }}>{sale.customerEmail}</div>
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#008000' }}>
                        ${sale.total.toFixed(2)}
                      </div>
                      <div style={{ 
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        textAlign: 'center',
                        background: sale.paymentMethod === 'efectivo' ? '#e8f5e8' : 
                                   sale.paymentMethod === 'tarjeta' ? '#e8f0ff' : '#fff3cd',
                        color: sale.paymentMethod === 'efectivo' ? '#2e7d32' : 
                               sale.paymentMethod === 'tarjeta' ? '#1565c0' : '#856404'
                      }}>
                        {sale.paymentMethod === 'efectivo' ? '💵 Efectivo' :
                         sale.paymentMethod === 'tarjeta' ? '💳 Tarjeta' :
                         sale.paymentMethod === 'transferencia' ? '🏦 Transferencia' :
                         sale.paymentMethod === 'paypal' ? '🅿️ PayPal' : sale.paymentMethod}
                      </div>
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        {sale.date.toLocaleDateString()}
                      </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={btn()} onClick={() => startEditSale(sale)}>Editar</button>
                      <button style={btn()} onClick={() => onDeleteSale(sale.id)}>Eliminar</button>
                    </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen de ventas */}
            {sales.length > 0 && (
              <div style={{
                marginTop: '16px',
                background: '#f0f0f0',
                border: '1px solid #999',
                borderRadius: '4px',
                padding: '12px'
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: '#333'
                }}>
                  📈 Resumen de Ventas
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '11px' }}>
                  <div>
                    <div style={{ color: '#666' }}>Total de Ventas:</div>
                    <div style={{ fontWeight: 'bold', color: '#316ac5' }}>{sales.length}</div>
                  </div>
                  <div>
                    <div style={{ color: '#666' }}>Ingresos Totales:</div>
                    <div style={{ fontWeight: 'bold', color: '#008000' }}>
                      ${sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666' }}>Promedio por Venta:</div>
                    <div style={{ fontWeight: 'bold', color: '#ff6b35' }}>
                      ${(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        {/* Modal de edición de venta */}
        {editingSale && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ width: 420, background: '#fff', border: '1px solid #999', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              <div style={{ background: 'linear-gradient(#e6f0ff,#cfe0ff)', borderBottom: '1px solid #7aa2e8', padding: 8, fontWeight: 'bold' }}>Editar venta</div>
              <div style={{ padding: 12 }}>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, marginBottom: 4 }}>Cliente</div>
                  <input value={editCustomerName} onChange={e => setEditCustomerName(e.target.value)} style={{ width: '100%', border: '1px solid #999', padding: '4px 6px', fontSize: 11 }} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, marginBottom: 4 }}>Email</div>
                  <input value={editCustomerEmail} onChange={e => setEditCustomerEmail(e.target.value)} style={{ width: '100%', border: '1px solid #999', padding: '4px 6px', fontSize: 11 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, marginBottom: 4 }}>Pago</div>
                    <select value={editPaymentMethod} onChange={e => setEditPaymentMethod(e.target.value)} style={{ width: '100%', border: '1px solid #999', padding: '4px 6px', fontSize: 11 }}>
                      <option value="">—</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, marginBottom: 4 }}>Total</div>
                    <input type="number" min="0" step="0.01" value={editTotal} onChange={e => setEditTotal(e.target.value)} style={{ width: '100%', border: '1px solid #999', padding: '4px 6px', fontSize: 11 }} />
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, marginBottom: 4 }}>Fecha</div>
                  <input type="datetime-local" value={editDate} onChange={e => setEditDate(e.target.value)} style={{ width: '100%', border: '1px solid #999', padding: '4px 6px', fontSize: 11 }} />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button style={btn()} onClick={() => setEditingSale(null)}>Cancelar</button>
                  <button style={btn()} onClick={saveEditSale}>Guardar</button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      )}
      {/* cierre contenedor columna */}
      </div>
      {/* cierre content wrapper */}
      </div>
      {/* cierre right card */}
      </div>
      {/* cierre right column */}
      </div>
      {/* cierre inner */}
      </div>
      {/* cierre content */}
      </div>

      {/* Barra de estado */}
      <div style={{ marginTop: 8, background: '#e8e4cf', border: '1px solid #b8b4a2', padding: '0px 8px', fontSize: 11 }}>
        Estado: Sistema operativo | Productos: {totalProducts} | Última actualización: {lastUpdate.toLocaleString()}
      </div>
    </Div>
  );
}

// Estilos reutilizables inspirados en XP
function btn() {
  return {
    background: 'linear-gradient(#fefefe,#e7e7e7)',
    border: '1px solid #7aa2e8',
    padding: '4px 8px',
    cursor: 'pointer',
  };
}
function groupHeader() {
  return {
    background: '#efe9d7',
    border: '1px solid #bdb8a6',
    padding: '4px 8px',
    fontWeight: 'bold',
  };
}
function groupBody() {
  return {
    border: '1px solid #bdb8a6',
    borderTop: 'none',
    padding: 8,
    background: '#fff',
    marginBottom: 8,
  };
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
  .com__function_bar__button--active { border:1px solid rgb(185,185,185); background:#dedede; box-shadow: inset 0 -1px 1px rgba(255,255,255,0.7); color: rgba(0,0,0,0.7); }
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
  .com__content__right { height:100%; overflow:auto; background:#fff; flex:1; }
  .com__content__right__card__header { width:300px; font-weight:700; padding: 2px 0 3px 12px; position:relative; }
  .com__content__right__card__header:after { content:''; display:block; background: linear-gradient(to right, #70bfff 0, #fff 100%); position:absolute; bottom:0; left:-12px; height:1px; width:100%; }
  .com__content__right__card__content { display:flex; align-items:flex-start; padding:15px 15px 0; flex-wrap:wrap; }
`;

export default Admin;


