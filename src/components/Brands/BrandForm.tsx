import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/SupabaseAppContext';
import Window from '../Layout/Window';
import { Brand } from '../../contexts/SupabaseAppContext';

interface BrandFormProps {
  brand?: Brand | null;
  onClose: () => void;
}

const BrandForm: React.FC<BrandFormProps> = ({ brand, onClose }) => {
  const { addBrand, updateBrand, brands } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        description: brand.description,
        logo: brand.logo
      });
    }
  }, [brand]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    } else {
      // Check for unique name (excluding current brand if editing)
      const existingBrand = brands.find(b => 
        b.name.toLowerCase() === formData.name.trim().toLowerCase() && 
        (!brand || b.id !== brand.id)
      );
      if (existingBrand) {
        newErrors.name = 'Ya existe una marca con este nombre';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
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
      const brandData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        logo: formData.logo.trim() || '🏢'
      };

      if (brand) {
        updateBrand(brand.id, brandData);
      } else {
        addBrand(brandData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving brand:', error);
    } finally {
      setLoading(false);
    }
  };

  const emojiOptions = [
    '🏢', '🏭', '🏪', '🏬', '🏛️', '🏗️', 
    '🔧', '⚙️', '🛠️', '🔩', '🔨', '⚡',
    '💼', '🎯', '📱', '💻', '🖥️', '⌚',
    '🚗', '🏠', '👕', '👟', '📚', '🎮',
    '💊', '🧴', '🍔', '☕', '🎵', '🎨'
  ];

  return (
    <div className="space-y-4">
      <Window 
        title={brand ? 'Editar Marca' : 'Nueva Marca'}
        onClose={onClose}
        width="w-full max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold mb-2" htmlFor="name">
              🏷️ Nombre de la Marca: *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`xp-input w-full ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Ej: TechCorp S.A."
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
              placeholder="Describe la marca y su especialidad..."
              disabled={loading}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-bold mb-2" htmlFor="logo">
              🎨 Logo (Emoji o URL de imagen):
            </label>
            <input
              id="logo"
              name="logo"
              type="text"
              value={formData.logo}
              onChange={handleChange}
              className="xp-input w-full"
              placeholder="🏢 o https://ejemplo.com/logo.png"
              disabled={loading}
            />
            
            {/* Emoji Selector */}
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-2">Seleccione un emoji predefinido:</p>
              <div className="grid grid-cols-12 gap-1 max-h-24 overflow-y-auto bg-gray-50 p-2 rounded border">
                {emojiOptions.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logo: emoji }))}
                    className={`text-xl p-1 rounded hover:bg-gray-200 ${
                      formData.logo === emoji ? 'bg-blue-200' : ''
                    }`}
                    title={`Usar ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Preview */}
            {formData.logo && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Vista previa:</p>
                <div className="bg-gray-100 border border-gray-300 rounded w-16 h-16 flex items-center justify-center">
                  {formData.logo.startsWith('http') ? (
                    <img 
                      src={formData.logo} 
                      alt="Vista previa del logo"
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling!.textContent = '❌';
                      }}
                    />
                  ) : (
                    <span className="text-2xl">{formData.logo}</span>
                  )}
                  <span className="text-red-500 text-xs hidden">❌</span>
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
              {loading ? '⏳ Guardando...' : (brand ? '✅ Actualizar Marca' : '✅ Crear Marca')}
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

export default BrandForm;