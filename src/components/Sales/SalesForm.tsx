import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useApp } from '../../contexts/SupabaseAppContext';
import { supabase } from '../../integrations/supabase/client';
import Window from '../Layout/Window';

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  stock: number;
}

const SalesForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { profile } = useAuth();
  const { products, refreshData } = useApp();
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setSaleItems([...saleItems, {
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      stock: 0
    }]);
  };

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...saleItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].unitPrice = product.price;
        newItems[index].stock = product.stock_quantity || 0;
      }
    }
    
    setSaleItems(newItems);
  };

  const removeItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return saleItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || saleItems.length === 0) return;

    setLoading(true);
    try {
      // Validar stock antes de procesar
      for (const item of saleItems) {
        if (item.quantity > item.stock) {
          alert(`Stock insuficiente para ${item.productName}. Stock disponible: ${item.stock}`);
          setLoading(false);
          return;
        }
      }

      // Crear la venta
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          employee_id: profile.user_id,
          total_amount: getTotalAmount(),
          notes: notes || null
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Crear los items de venta
      const saleItemsData = saleItems.map(item => ({
        sale_id: sale.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.quantity * item.unitPrice
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsData);

      if (itemsError) throw itemsError;

      alert('Venta registrada exitosamente');
      refreshData();
      onClose();
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Window id="sales-form" icon="💵" title="Registrar Nueva Venta" width="100%">
        <form onSubmit={handleSubmit}>
          <fieldset style={{ border: '1px groove #c0c0c0', padding: '16px', marginBottom: '16px' }}>
            <legend style={{ fontWeight: 'bold' }}>Información de la Venta</legend>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                Vendedor:
              </label>
              <input
                type="text"
                value={profile?.name || ''}
                disabled
                style={{ 
                  width: '200px', 
                  padding: '4px',
                  fontSize: '11px',
                  backgroundColor: '#f0f0f0'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                Notas (opcional):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ 
                  width: '100%', 
                  minHeight: '60px',
                  padding: '4px',
                  fontSize: '11px'
                }}
                placeholder="Observaciones sobre la venta..."
              />
            </div>
          </fieldset>

          <fieldset style={{ border: '1px groove #c0c0c0', padding: '16px', marginBottom: '16px' }}>
            <legend style={{ fontWeight: 'bold' }}>Productos</legend>
            
            <div style={{ marginBottom: '16px' }}>
              <button
                type="button"
                onClick={addItem}
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                ➕ Agregar Producto
              </button>
            </div>

            {saleItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛒</div>
                <p>No hay productos agregados</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#e0e0e0' }}>
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px' }}>Producto</th>
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px' }}>Cantidad</th>
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px' }}>Stock</th>
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px' }}>Precio Unit.</th>
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px' }}>Subtotal</th>
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saleItems.map((item, index) => (
                      <tr key={index}>
                        <td style={{ border: '1px solid #c0c0c0', padding: '4px' }}>
                          <select
                            value={item.productId}
                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                            style={{ width: '100%', fontSize: '11px', padding: '2px' }}
                            required
                          >
                            <option value="">Seleccionar producto...</option>
                            {products.filter(p => (p.stock_quantity || 0) > 0).map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name} (Stock: {product.stock_quantity || 0})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ border: '1px solid #c0c0c0', padding: '4px' }}>
                          <input
                            type="number"
                            min="1"
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            style={{ width: '60px', fontSize: '11px', padding: '2px' }}
                            required
                          />
                        </td>
                        <td style={{ 
                          border: '1px solid #c0c0c0', 
                          padding: '4px', 
                          textAlign: 'center',
                          color: item.stock < 5 ? '#ff0000' : '#008000',
                          fontWeight: 'bold'
                        }}>
                          {item.stock}
                          {item.stock < 5 && item.stock > 0 && <span> ⚠️</span>}
                          {item.stock === 0 && <span> ❌</span>}
                        </td>
                        <td style={{ border: '1px solid #c0c0c0', padding: '4px' }}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            style={{ width: '80px', fontSize: '11px', padding: '2px' }}
                            required
                          />
                        </td>
                        <td style={{ 
                          border: '1px solid #c0c0c0', 
                          padding: '4px', 
                          textAlign: 'right',
                          fontWeight: 'bold'
                        }}>
                          ${(item.quantity * item.unitPrice).toLocaleString()}
                        </td>
                        <td style={{ border: '1px solid #c0c0c0', padding: '4px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            style={{ fontSize: '10px', padding: '2px 4px', color: '#ff0000' }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {saleItems.length > 0 && (
              <div style={{ 
                marginTop: '16px', 
                padding: '8px', 
                background: '#f0f0f0', 
                border: '1px solid #c0c0c0',
                textAlign: 'right'
              }}>
                <strong style={{ fontSize: '14px' }}>
                  Total: ${getTotalAmount().toLocaleString()}
                </strong>
              </div>
            )}
          </fieldset>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ fontSize: '11px', padding: '8px 16px' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || saleItems.length === 0}
              style={{ 
                fontSize: '11px', 
                padding: '8px 16px',
                backgroundColor: loading ? '#f0f0f0' : undefined
              }}
            >
              {loading ? 'Procesando...' : '💾 Registrar Venta'}
            </button>
          </div>
        </form>
      </Window>
    </div>
  );
};

export default SalesForm;