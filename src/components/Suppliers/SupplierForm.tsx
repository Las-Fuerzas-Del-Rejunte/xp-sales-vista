import React, { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import Window from '../Layout/Window';

interface Supplier {
  id?: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
}

interface SupplierFormProps {
  supplier?: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Supplier>({
    name: supplier?.name || '',
    contact_person: supplier?.contact_person || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (supplier?.id) {
        // Actualizar proveedor existente
        const { error } = await supabase
          .from('suppliers')
          .update(formData)
          .eq('id', supplier.id);
        
        if (error) throw error;
      } else {
        // Crear nuevo proveedor
        const { error } = await supabase
          .from('suppliers')
          .insert([formData]);
        
        if (error) throw error;
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Error al guardar el proveedor');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Supplier, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Window id="supplier-form" icon="🚚" title={supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'} width="100%">
        <form onSubmit={handleSubmit}>
          <fieldset style={{ border: '1px groove #c0c0c0', padding: '16px', marginBottom: '16px' }}>
            <legend style={{ fontWeight: 'bold' }}>Información del Proveedor</legend>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                Nombre de la Empresa: *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '4px',
                  fontSize: '11px'
                }}
                placeholder="Ej: Distribuidora ABC S.A."
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                Persona de Contacto:
              </label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '4px',
                  fontSize: '11px'
                }}
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                  Email:
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '4px',
                    fontSize: '11px'
                  }}
                  placeholder="contacto@empresa.com"
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                  Teléfono:
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '4px',
                    fontSize: '11px'
                  }}
                  placeholder="Ej: +54 11 1234-5678"
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                Dirección:
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                style={{ 
                  width: '100%', 
                  minHeight: '60px',
                  padding: '4px',
                  fontSize: '11px'
                }}
                placeholder="Dirección completa del proveedor"
              />
            </div>
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
              disabled={loading}
              style={{ 
                fontSize: '11px', 
                padding: '8px 16px',
                backgroundColor: loading ? '#f0f0f0' : undefined
              }}
            >
              {loading ? 'Guardando...' : '💾 Guardar'}
            </button>
          </div>
        </form>
      </Window>
    </div>
  );
};

export default SupplierForm;