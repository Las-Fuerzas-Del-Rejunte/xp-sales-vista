import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import Window from '../Layout/Window';

interface SalesData {
  totalSales: number;
  totalAmount: number;
  salesByEmployee: { name: string; total: number; count: number }[];
  salesByProduct: { name: string; quantity: number; revenue: number }[];
  salesByBrand: { name: string; quantity: number; revenue: number }[];
  monthlySales: { month: string; amount: number; count: number }[];
  lowStockProducts: { name: string; stock: number; minStock: number }[];
}

const SalesDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [salesData, setSalesData] = useState<SalesData>({
    totalSales: 0,
    totalAmount: 0,
    salesByEmployee: [],
    salesByProduct: [],
    salesByBrand: [],
    monthlySales: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      // Total de ventas
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('total_amount, sale_date, profiles!sales_employee_id_fkey(name)');

      if (salesError) throw salesError;

      const totalSales = sales?.length || 0;
      const totalAmount = sales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;

      // Ventas por empleado
      const salesByEmployee = sales?.reduce((acc: any[], sale) => {
        const employeeName = sale.profiles?.name || 'Usuario Desconocido';
        const existing = acc.find(emp => emp.name === employeeName);
        if (existing) {
          existing.total += sale.total_amount;
          existing.count += 1;
        } else {
          acc.push({ name: employeeName, total: sale.total_amount, count: 1 });
        }
        return acc;
      }, []) || [];

      // Items de venta para análisis por producto
      const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          subtotal,
          products(name, brand_id, brands(name))
        `);

      if (itemsError) throw itemsError;

      // Ventas por producto
      const salesByProduct = saleItems?.reduce((acc: any[], item) => {
        const productName = item.products?.name || 'Producto Desconocido';
        const existing = acc.find(prod => prod.name === productName);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.subtotal;
        } else {
          acc.push({ name: productName, quantity: item.quantity, revenue: item.subtotal });
        }
        return acc;
      }, []) || [];

      // Ventas por marca
      const salesByBrand = saleItems?.reduce((acc: any[], item) => {
        const brandName = item.products?.brands?.name || 'Marca Desconocida';
        const existing = acc.find(brand => brand.name === brandName);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.subtotal;
        } else {
          acc.push({ name: brandName, quantity: item.quantity, revenue: item.subtotal });
        }
        return acc;
      }, []) || [];

      // Ventas mensuales (últimos 6 meses)
      const monthlySales = sales?.reduce((acc: any[], sale: any) => {
        const date = new Date(sale.sale_date || '');
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const existing = acc.find(month => month.month === monthKey);
        if (existing) {
          existing.amount += sale.total_amount;
          existing.count += 1;
        } else {
          acc.push({ month: monthKey, amount: sale.total_amount, count: 1 });
        }
        return acc;
      }, []) || [];

      // Productos con stock bajo
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('name, stock_quantity, min_stock')
        .filter('stock_quantity', 'lt', 'min_stock');

      if (productsError) throw productsError;

      const lowStockProducts = products?.map(product => ({
        name: product.name,
        stock: product.stock_quantity || 0,
        minStock: product.min_stock || 0
      })) || [];

      setSalesData({
        totalSales,
        totalAmount,
        salesByEmployee: salesByEmployee.sort((a, b) => b.total - a.total),
        salesByProduct: salesByProduct.sort((a, b) => b.revenue - a.revenue).slice(0, 10),
        salesByBrand: salesByBrand.sort((a, b) => b.revenue - a.revenue),
        monthlySales: monthlySales.sort((a, b) => a.month.localeCompare(b.month)),
        lowStockProducts: lowStockProducts.sort((a, b) => a.stock - b.stock)
      });

    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Window id="sales-dashboard-denied" icon="🚫" title="Acceso Denegado" width="100%">
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
            <h3>Acceso Restringido</h3>
            <p>Solo los administradores pueden ver el dashboard de ventas.</p>
          </div>
        </Window>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <Window id="sales-dashboard" icon="📊" title="Dashboard de Ventas - Panel Administrativo" width="100%">
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div>Cargando datos de ventas...</div>
            </div>
          ) : (
            <>
              {/* Resumen General */}
              <fieldset style={{ border: '2px groove #c0c0c0', padding: '16px', marginBottom: '16px' }}>
                <legend style={{ fontWeight: 'bold' }}>📊 Resumen General</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ 
                    background: '#f0f8ff', 
                    border: '1px solid #87ceeb', 
                    padding: '16px', 
                    textAlign: 'center',
                    borderRadius: '4px'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4682b4' }}>
                      {salesData.totalSales}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Ventas Totales</div>
                  </div>
                  <div style={{ 
                    background: '#f0fff0', 
                    border: '1px solid #90ee90', 
                    padding: '16px', 
                    textAlign: 'center',
                    borderRadius: '4px'
                  }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#228b22' }}>
                      ${salesData.totalAmount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Ingresos Totales</div>
                  </div>
                  <div style={{ 
                    background: salesData.lowStockProducts.length > 0 ? '#fff0f0' : '#f0fff0', 
                    border: `1px solid ${salesData.lowStockProducts.length > 0 ? '#ffb6c1' : '#90ee90'}`, 
                    padding: '16px', 
                    textAlign: 'center',
                    borderRadius: '4px'
                  }}>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: salesData.lowStockProducts.length > 0 ? '#dc143c' : '#228b22'
                    }}>
                      {salesData.lowStockProducts.length}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      Productos Stock Bajo
                      {salesData.lowStockProducts.length > 0 && ' ⚠️'}
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Alertas de Stock */}
              {salesData.lowStockProducts.length > 0 && (
                <fieldset style={{ 
                  border: '2px solid #ff0000', 
                  padding: '16px', 
                  marginBottom: '16px',
                  backgroundColor: '#fff0f0'
                }}>
                  <legend style={{ fontWeight: 'bold', color: '#ff0000' }}>⚠️ Alertas de Stock Bajo</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '8px' }}>
                    {salesData.lowStockProducts.map((product, index) => (
                      <div key={index} style={{ 
                        background: '#ffcccc', 
                        border: '1px solid #ff0000', 
                        padding: '8px',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                        <div>Stock: {product.stock} | Mínimo: {product.minStock}</div>
                      </div>
                    ))}
                  </div>
                </fieldset>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {/* Ventas por Empleado */}
                <fieldset style={{ border: '2px groove #c0c0c0', padding: '16px' }}>
                  <legend style={{ fontWeight: 'bold' }}>👥 Ventas por Empleado</legend>
                  {salesData.salesByEmployee.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {salesData.salesByEmployee.map((employee, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          padding: '8px',
                          borderBottom: '1px solid #e0e0e0',
                          fontSize: '11px'
                        }}>
                          <span>{employee.name}</span>
                          <span style={{ fontWeight: 'bold' }}>
                            ${employee.total.toLocaleString()} ({employee.count} ventas)
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#666', padding: '16px' }}>
                      No hay datos de ventas
                    </div>
                  )}
                </fieldset>

                {/* Top Productos */}
                <fieldset style={{ border: '2px groove #c0c0c0', padding: '16px' }}>
                  <legend style={{ fontWeight: 'bold' }}>🏆 Top Productos</legend>
                  {salesData.salesByProduct.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {salesData.salesByProduct.map((product, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          padding: '8px',
                          borderBottom: '1px solid #e0e0e0',
                          fontSize: '11px'
                        }}>
                          <span>#{index + 1} {product.name}</span>
                          <span style={{ fontWeight: 'bold' }}>
                            {product.quantity} u. - ${product.revenue.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#666', padding: '16px' }}>
                      No hay datos de productos
                    </div>
                  )}
                </fieldset>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Ventas por Marca */}
                <fieldset style={{ border: '2px groove #c0c0c0', padding: '16px' }}>
                  <legend style={{ fontWeight: 'bold' }}>🏷️ Ventas por Marca</legend>
                  {salesData.salesByBrand.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {salesData.salesByBrand.map((brand, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          padding: '8px',
                          borderBottom: '1px solid #e0e0e0',
                          fontSize: '11px'
                        }}>
                          <span>{brand.name}</span>
                          <span style={{ fontWeight: 'bold' }}>
                            {brand.quantity} u. - ${brand.revenue.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#666', padding: '16px' }}>
                      No hay datos de marcas
                    </div>
                  )}
                </fieldset>

                {/* Ventas Mensuales */}
                <fieldset style={{ border: '2px groove #c0c0c0', padding: '16px' }}>
                  <legend style={{ fontWeight: 'bold' }}>📈 Ventas Mensuales</legend>
                  {salesData.monthlySales.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {salesData.monthlySales.map((month, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          padding: '8px',
                          borderBottom: '1px solid #e0e0e0',
                          fontSize: '11px'
                        }}>
                          <span>{month.month}</span>
                          <span style={{ fontWeight: 'bold' }}>
                            ${month.amount.toLocaleString()} ({month.count} ventas)
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#666', padding: '16px' }}>
                      No hay datos mensuales
                    </div>
                  )}
                </fieldset>
              </div>
            </>
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
            Dashboard de Ventas | Última actualización: {new Date().toLocaleString()}
          </div>
        </div>
      </Window>
    </div>
  );
};

export default SalesDashboard;