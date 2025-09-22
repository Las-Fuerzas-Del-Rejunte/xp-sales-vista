import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import Window from '../Layout/Window';
import { Product } from '../../contexts/AppContext';

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
        brandId: product.brandId
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    if (!formData.brandId) {
      newErrors.brandId = 'La marca es requerida';
    }

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
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        image: formData.image.trim(),
        brandId: formData.brandId
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
    'Electrónicos',
    'Ropa y Accesorios',
    'Hogar y Jardín',
    'Deportes',
    'Libros',
    'Juguetes',
    'Salud y Belleza',
    'Automóviles',
    'Otros'
  ];

  return (
    <div className="space-y-4">
      <Window 
        title={product ? 'Editar Producto' : 'Nuevo Producto'}
        onClose={onClose}
        width="w-full max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold mb-2" htmlFor="name">
              📝 Nombre del Producto: *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`xp-input w-full ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Ej: Smartphone XYZ"
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold mb-2" htmlFor="description">
              📄 Descripción: *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`xp-input w-full h-24 resize-none ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Describe las características del producto..."
              disabled={loading}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Category and Brand Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="category">
                🏷️ Categoría: *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`xp-input w-full ${errors.category ? 'border-red-500' : ''}`}
                disabled={loading}
              >
                <option value="">Seleccione una categoría</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="brandId">
                🏢 Marca: *
              </label>
              <select
                id="brandId"
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                className={`xp-input w-full ${errors.brandId ? 'border-red-500' : ''}`}
                disabled={loading}
              >
                <option value="">Seleccione una marca</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              {errors.brandId && <p className="text-red-500 text-xs mt-1">{errors.brandId}</p>}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold mb-2" htmlFor="price">
              💰 Precio: *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className={`xp-input w-full ${errors.price ? 'border-red-500' : ''}`}
              placeholder="0.00"
              disabled={loading}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-bold mb-2" htmlFor="image">
              🖼️ URL de Imagen (opcional):
            </label>
            <input
              id="image"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleChange}
              className="xp-input w-full"
              placeholder="https://ejemplo.com/imagen.jpg"
              disabled={loading}
            />
            {formData.image && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Vista previa:</p>
                <div className="bg-gray-100 border border-gray-300 rounded h-32 w-32 flex items-center justify-center">
                  <img 
                    src={formData.image} 
                    alt="Vista previa"
                    className="h-full w-full object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling!.textContent = '❌ Error al cargar imagen';
                    }}
                  />
                  <span className="text-gray-400 text-xs hidden">❌ Error al cargar imagen</span>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="xp-button flex-1 py-3 font-bold"
            >
              {loading ? '⏳ Guardando...' : (product ? '✅ Actualizar Producto' : '✅ Crear Producto')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="xp-button flex-1 py-3"
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </Window>
    </div>
  );
};

export default ProductForm;