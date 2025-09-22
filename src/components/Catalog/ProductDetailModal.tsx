import React from 'react';
import Window from '../Layout/Window';
import { Product } from '../../contexts/AppContext';

interface ProductDetailModalProps {
  product: Product;
  brandName: string;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  brandName, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl">
        <Window 
          title={`Detalles del Producto - ${product.name}`}
          onClose={onClose}
          width="w-full"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="bg-gray-100 rounded border border-gray-300 h-64 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="h-full w-full object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling!.textContent = '🖼️ Imagen no disponible';
                    }}
                  />
                ) : (
                  <span className="text-6xl text-gray-400">🖼️</span>
                )}
              </div>
              
              {/* Product Image Info */}
              <div className="text-center text-xs text-gray-500">
                Imagen del producto
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <h2 className="text-xl font-bold text-blue-800 mb-2">
                  {product.name}
                </h2>
              </div>

              {/* Price */}
              <div className="bg-green-50 p-3 rounded border-2 border-green-200">
                <p className="text-sm text-green-700 mb-1">Precio:</p>
                <p className="text-2xl font-bold text-green-800">
                  ${product.price.toLocaleString()}
                </p>
              </div>

              {/* Product Details */}
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded border border-gray-300">
                  <p className="text-sm font-bold text-gray-700 mb-1">📂 Categoría:</p>
                  <p className="text-gray-600">{product.category}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded border border-gray-300">
                  <p className="text-sm font-bold text-gray-700 mb-1">🏢 Marca:</p>
                  <p className="text-gray-600">{brandName}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded border border-gray-300">
                  <p className="text-sm font-bold text-gray-700 mb-1">📅 Fecha de creación:</p>
                  <p className="text-gray-600">
                    {new Date(product.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="xp-button w-full py-3 font-bold"
                >
                  ✅ Cerrar Detalles
                </button>
                
                <div className="text-center text-xs text-gray-500">
                  💡 Funcionalidad de compra disponible en versiones futuras
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              📄 Descripción del Producto
            </h3>
            <div className="bg-blue-50 p-4 rounded border-2 border-blue-200">
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Product ID for admin reference */}
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-gray-400">
              ID del producto: {product.id}
            </div>
          </div>
        </Window>
      </div>
    </div>
  );
};

export default ProductDetailModal;