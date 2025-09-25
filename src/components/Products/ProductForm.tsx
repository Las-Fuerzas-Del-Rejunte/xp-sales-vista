import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/SupabaseAppContext';
import Window from '../Layout/Window';
import { Product } from '../../contexts/SupabaseAppContext';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const { addProduct, updateProduct, brands } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    image: '',
    brandId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price.toString(),
        image: product.image,
        brandId: product.brand_id
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.category.trim()) newErrors.category = 'La categoría es requerida';
    if (!formData.brandId) newErrors.brandId = 'La marca es requerida';

    const price = parseFloat(formData.price);
    if (!formData.price.trim()) {
      newErrors.price = 'El precio es requerido';
    } else if (isNaN(price) || price < 0) {
      newErrors.price = 'El precio debe ser un número válido mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        image: formData.image.trim(),
        brand_id: formData.brandId
      };

      if (product) {
        updateProduct(product.id, productData);
      } else {
        addProduct(productData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Electrónicos', 'Ropa y Accesorios', 'Hogar y Jardín', 'Deportes',
    'Libros', 'Juguetes', 'Salud y Belleza', 'Automóviles', 'Otros'
  ];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Window 
        title={product ? 'Editar Producto' : 'Nuevo Producto'}
        onClose={onClose}
        width="100%"
      >
        <div>
          {Object.keys(errors).length > 0 && (
            <div className="error-box" style={{ marginBottom: '16px' }}>
              ⚠️ Por favor corrija los errores en el formulario
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <fieldset style={{ border: '2px groove #c0c0c0', padding: '16px', marginBottom: '16px' }}>
              <legend style={{ fontWeight: 'bold' }}>Información del Producto</legend>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>
                  📝 Nombre del Producto: *
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '4px', 
                    fontSize: '11px',
                    border: errors.name ? '2px solid red' : undefined 
                  }}
                  placeholder="Ej: Smartphone XYZ"
                  disabled={loading}
                />
                {errors.name && <div style={{ color: 'red', fontSize: '10px' }}>{errors.name}</div>}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>
                  📄 Descripción: *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    height: '60px', 
                    padding: '4px', 
                    fontSize: '11px', 
                    resize: 'none',
                    border: errors.description ? '2px solid red' : undefined 
                  }}
                  placeholder="Describe las características del producto..."
                  disabled={loading}
                />
                {errors.description && <div style={{ color: 'red', fontSize: '10px' }}>{errors.description}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>
                    🏷️ Categoría: *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    style={{ 
                      width: '100%', 
                      padding: '4px', 
                      fontSize: '11px',
                      border: errors.category ? '2px solid red' : undefined 
                    }}
                    disabled={loading}
                  >
                    <option value="">Seleccione una categoría</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <div style={{ color: 'red', fontSize: '10px' }}>{errors.category}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>
                    🏢 Marca: *
                  </label>
                  <select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleChange}
                    style={{ 
                      width: '100%', 
                      padding: '4px', 
                      fontSize: '11px',
                      border: errors.brandId ? '2px solid red' : undefined 
                    }}
                    disabled={loading}
                  >
                    <option value="">Seleccione una marca</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                  {errors.brandId && <div style={{ color: 'red', fontSize: '10px' }}>{errors.brandId}</div>}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>
                  💰 Precio: *
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '4px', 
                    fontSize: '11px',
                    border: errors.price ? '2px solid red' : undefined 
                  }}
                  placeholder="0.00"
                  disabled={loading}
                />
                {errors.price && <div style={{ color: 'red', fontSize: '10px' }}>{errors.price}</div>}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>
                  🖼️ URL de Imagen (opcional):
                </label>
                <input
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  disabled={loading}
                />
                {formData.image && (
                  <fieldset style={{ border: '1px groove #c0c0c0', padding: '8px', marginTop: '8px' }}>
                    <legend style={{ fontSize: '10px' }}>Vista previa</legend>
                    <div style={{ 
                      background: '#f0f0f0', 
                      border: '1px inset #c0c0c0', 
                      width: '80px', 
                      height: '80px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      <img 
                        src={formData.image} 
                        alt="Vista previa"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling!.textContent = '❌';
                        }}
                      />
                      <span style={{ color: 'red', fontSize: '10px', display: 'none' }}>❌</span>
                    </div>
                  </fieldset>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, padding: '8px', fontSize: '11px', fontWeight: 'bold' }}
                >
                  {loading ? '⏳ Guardando...' : (product ? '✅ Actualizar Producto' : '✅ Crear Producto')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  style={{ flex: 1, padding: '8px', fontSize: '11px' }}
                >
                  ❌ Cancelar
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      </Window>
    </div>
  );
};

export default ProductForm;