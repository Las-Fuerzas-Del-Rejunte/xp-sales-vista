import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import Window from '../Layout/Window';
import SalesForm from './SalesForm';

interface Sale {
  id: string;
  employee_id: string;
  total_amount: number;
  sale_date: string;
  notes: string | null;
  employee_name: string;
}

interface SaleItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_name: string;
}

const SalesList: React.FC = () => {
  const { profile } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, [profile]);

  const fetchSales = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          profiles!sales_employee_id_fkey(name)
        `)
        .order('sale_date', { ascending: false });

      if (error) throw error;
      
      const salesWithEmployee = data?.map(sale => ({
        ...sale,
        employee_name: sale.profiles?.name || 'Usuario Desconocido'
      })) || [];
      
      setSales(salesWithEmployee);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaleItems = async (saleId: string) => {
    try {
      const { data, error } = await supabase
        .from('sale_items')
        .select(`
          *,
          products(name)
        `)
        .eq('sale_id', saleId);

      if (error) throw error;
      
      const itemsWithProductName = data?.map(item => ({
        ...item,
        product_name: item.products?.name || 'Producto Desconocido'
      })) || [];
      
      setSaleItems(itemsWithProductName);
    } catch (error) {
      console.error('Error fetching sale items:', error);
    }
  };

  const viewSaleDetails = (saleId: string) => {
    setSelectedSale(selectedSale === saleId ? null : saleId);
    if (selectedSale !== saleId) {
      fetchSaleItems(saleId);
    }
  };

  if (showForm) {
    return <SalesForm onClose={() => { setShowForm(false); fetchSales(); }} />;
  }

  const isAdmin = profile?.role === 'admin';
  const canCreateSales = profile?.role === 'empleado' || isAdmin;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Window id="sales" icon="💰" title="Gestión de Ventas" width="100%">
        <div>
          {/* Toolbar */}
          <fieldset style={{ border: '1px groove #c0c0c0', padding: '8px', marginBottom: '16px' }}>
            <legend style={{ fontSize: '10px', color: '#666' }}>Herramientas</legend>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => window.history.back()}
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                🏠 Volver
              </button>
              {canCreateSales && (
                <button
                  onClick={() => setShowForm(true)}
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  ➕ Nueva Venta
                </button>
              )}
              <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#666' }}>
                Total ventas: {sales.length}
              </div>
            </div>
          </fieldset>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div>Cargando ventas...</div>
            </div>
          ) : sales.length === 0 ? (
            <fieldset style={{ border: '2px groove #c0c0c0', padding: '32px', textAlign: 'center' }}>
              <legend style={{ fontWeight: 'bold' }}>Estado de Ventas</legend>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#666', margin: '0 0 8px 0' }}>
                No hay ventas registradas
              </h3>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 16px 0' }}>
                {canCreateSales ? 'Comience registrando su primera venta' : 'Las ventas aparecerán aquí cuando los empleados las registren'}
              </p>
              {canCreateSales && (
                <button
                  onClick={() => setShowForm(true)}
                  style={{ fontSize: '11px', padding: '8px 16px' }}
                >
                  ➕ Registrar Primera Venta
                </button>
              )}
            </fieldset>
          ) : (
            <fieldset style={{ border: '2px groove #c0c0c0', padding: '16px' }}>
              <legend style={{ fontWeight: 'bold' }}>Historial de Ventas</legend>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#e0e0e0' }}>
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px', textAlign: 'left' }}>Fecha</th>
                      {isAdmin && (
                        <th style={{ border: '1px solid #c0c0c0', padding: '8px', textAlign: 'left' }}>Vendedor</th>
                      )}
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px', textAlign: 'right' }}>Total</th>
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px', textAlign: 'left' }}>Notas</th>
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <React.Fragment key={sale.id}>
                        <tr style={{ borderBottom: '1px solid #c0c0c0' }}>
                          <td style={{ border: '1px solid #c0c0c0', padding: '8px' }}>
                            {new Date(sale.sale_date).toLocaleString()}
                          </td>
                          {isAdmin && (
                            <td style={{ border: '1px solid #c0c0c0', padding: '8px' }}>
                              {sale.employee_name}
                            </td>
                          )}
                          <td style={{ 
                            border: '1px solid #c0c0c0', 
                            padding: '8px', 
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: '#008000'
                          }}>
                            ${sale.total_amount.toLocaleString()}
                          </td>
                          <td style={{ border: '1px solid #c0c0c0', padding: '8px' }}>
                            {sale.notes || '-'}
                          </td>
                          <td style={{ border: '1px solid #c0c0c0', padding: '8px', textAlign: 'center' }}>
                            <button
                              onClick={() => viewSaleDetails(sale.id)}
                              style={{ fontSize: '10px', padding: '2px 6px' }}
                            >
                              {selectedSale === sale.id ? '📋 Ocultar' : '👁️ Ver Detalle'}
                            </button>
                          </td>
                        </tr>
                        {selectedSale === sale.id && (
                          <tr>
                            <td 
                              colSpan={isAdmin ? 5 : 4} 
                              style={{ 
                                border: '1px solid #c0c0c0', 
                                padding: '16px',
                                backgroundColor: '#f8f8f8'
                              }}
                            >
                              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                                Detalle de la Venta #{sale.id.slice(0, 8)}
                              </div>
                              {saleItems.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                                  <thead>
                                    <tr style={{ background: '#e0e0e0' }}>
                                      <th style={{ border: '1px solid #c0c0c0', padding: '4px' }}>Producto</th>
                                      <th style={{ border: '1px solid #c0c0c0', padding: '4px' }}>Cantidad</th>
                                      <th style={{ border: '1px solid #c0c0c0', padding: '4px' }}>Precio Unit.</th>
                                      <th style={{ border: '1px solid #c0c0c0', padding: '4px' }}>Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {saleItems.map((item) => (
                                      <tr key={item.id}>
                                        <td style={{ border: '1px solid #c0c0c0', padding: '4px' }}>
                                          {item.product_name}
                                        </td>
                                        <td style={{ border: '1px solid #c0c0c0', padding: '4px', textAlign: 'center' }}>
                                          {item.quantity}
                                        </td>
                                        <td style={{ border: '1px solid #c0c0c0', padding: '4px', textAlign: 'right' }}>
                                          ${item.unit_price.toLocaleString()}
                                        </td>
                                        <td style={{ border: '1px solid #c0c0c0', padding: '4px', textAlign: 'right' }}>
                                          ${item.subtotal.toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <div>Cargando items...</div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </fieldset>
          )}

          {/* Status Bar */}
          <div style={{ 
            background: '#e0e0e0', 
            border: '1px inset #c0c0c0', 
            padding: '4px 8px', 
            fontSize: '10px', 
            color: '#666',
            marginTop: '16px'
          }}>
            Estado: Sistema operativo | Ventas: {sales.length} | Total: ${sales.reduce((sum, sale) => sum + sale.total_amount, 0).toLocaleString()} | Última actualización: {new Date().toLocaleString()}
          </div>
        </div>
      </Window>
    </div>
  );
};

export default SalesList;