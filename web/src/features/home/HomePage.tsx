import { useEffect, useState } from "react";
import { Button } from "../../shared/ui/Button";
import { fetchProducts } from "../products/productsApi";
import type { ProductRow } from "../products/types";

export function HomePage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const prods = await fetchProducts();
        setProducts(prods.filter(p => p.is_active));
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Categorizar productos para mostrarlos en secciones
  const categories = {
    platosPrincipales: products.filter(p => 
      p.name.toLowerCase().includes('carne') || 
      p.name.toLowerCase().includes('pollo') || 
      p.name.toLowerCase().includes('pescado') ||
      p.name.toLowerCase().includes('filete') ||
      p.name.toLowerCase().includes('hamburguesa') ||
      p.name.toLowerCase().includes('plato típico') ||
      p.name.toLowerCase().includes('carnitas') ||
      p.name.toLowerCase().includes('pollo encebollado') ||
      p.name.toLowerCase().includes('carne guisada') ||
      p.name.toLowerCase().includes('desayuno típico') ||
      p.name.toLowerCase().includes('casamiento')
    ).slice(0, 6),
    pupusas: products.filter(p => 
      p.name.toLowerCase().includes('pupusa')
    ).slice(0, 6),
    sopas: products.filter(p => 
      p.name.toLowerCase().includes('sopa') || 
      p.name.toLowerCase().includes('caldo')
    ).slice(0, 4),
    entradas: products.filter(p => 
      p.name.toLowerCase().includes('ensalada') || 
      p.name.toLowerCase().includes('entrada') ||
      p.name.toLowerCase().includes('tamal')
    ).slice(0, 4),
    acompanamientos: products.filter(p => 
      p.name.toLowerCase().includes('arroz') || 
      p.name.toLowerCase().includes('frijol') ||
      p.name.toLowerCase().includes('plátano') ||
      p.name.toLowerCase().includes('yuca') ||
      p.name.toLowerCase().includes('repollo')
    ).slice(0, 6),
    antojitos: products.filter(p => 
      p.name.toLowerCase().includes('pastel') || 
      p.name.toLowerCase().includes('empanada') ||
      p.name.toLowerCase().includes('tortilla') ||
      p.name.toLowerCase().includes('atol')
    ).slice(0, 4),
    postres: products.filter(p => 
      p.name.toLowerCase().includes('tres leches') || 
      p.name.toLowerCase().includes('arroz con leche') ||
      p.name.toLowerCase().includes('nuégado') ||
      p.name.toLowerCase().includes('flan')
    ).slice(0, 4),
    bebidas: products.filter(p => 
      p.name.toLowerCase().includes('bebida') || 
      p.name.toLowerCase().includes('jugo') ||
      p.name.toLowerCase().includes('refresco') ||
      p.name.toLowerCase().includes('cerveza') ||
      p.name.toLowerCase().includes('vino') ||
      p.name.toLowerCase().includes('horchata') ||
      p.name.toLowerCase().includes('ensalada de fruta') ||
      p.name.toLowerCase().includes('maranón') ||
      p.name.toLowerCase().includes('chilate') ||
      p.name.toLowerCase().includes('tiste') ||
      p.name.toLowerCase().includes('cebada')
    ).slice(0, 6),
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900">
          Bienvenido a <span className="text-orange-600">Restaurante POS</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Descubre nuestros deliciosos platos preparados con ingredientes frescos de nuestro inventario
        </p>
        <div className="flex justify-center gap-4">
          <Button className="bg-orange-600 hover:bg-orange-700">
            Ver Menú Completo
          </Button>
          <Button variant="ghost" className="border-gray-300">
            Reservar Mesa
          </Button>
        </div>
      </div>

      {/* Pupusas */}
      {categories.pupusas.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">🫓 Pupusas</h2>
            <p className="text-gray-600 mt-2">El platillo más emblemático de El Salvador</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.pupusas.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="h-48 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-2">🫓</div>
                    <div className="text-xl font-bold truncate px-2">{product.name}</div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-gray-600">
                    Pupusas recién hechas con los mejores ingredientes
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-2xl font-bold text-orange-600">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      Ordenar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sopas y Caldos */}
      {categories.sopas.length > 0 && (
        <div className="bg-red-50 rounded-3xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">🍲 Sopas y Caldos</h2>
            <p className="text-gray-600 mt-2">Tradiciones calientes y reconfortantes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.sopas.map((product) => (
              <div key={product.id} className="bg-white rounded-xl p-4 text-center border border-gray-200">
                <div className="text-4xl mb-2">�</div>
                <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                <p className="text-red-600 font-bold">${Number(product.price).toFixed(2)}</p>
                <Button className="mt-2 bg-red-600 hover:bg-red-700 text-sm">
                  Ordenar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platos Principales */}
      {categories.platosPrincipales.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">🍽️ Platos Típicos</h2>
            <p className="text-gray-600 mt-2">Nuestras especialidades salvadoreñas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.platosPrincipales.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-2">🍛</div>
                    <div className="text-xl font-bold truncate px-2">{product.name}</div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-gray-600">
                    Plato preparado con recetas tradicionales salvadoreñas
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-2xl font-bold text-green-600">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Ordenar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acompañamientos */}
      {categories.acompanamientos.length > 0 && (
        <div className="bg-yellow-50 rounded-3xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">🍚 Acompañamientos</h2>
            <p className="text-gray-600 mt-2">Los complementos perfectos para tu plato</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.acompanamientos.map((product) => (
              <div key={product.id} className="bg-white rounded-xl p-4 text-center border border-gray-200">
                <div className="text-4xl mb-2">🥗</div>
                <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                <p className="text-yellow-600 font-bold">${Number(product.price).toFixed(2)}</p>
                <Button className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-sm">
                  Agregar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Antojitos y Postres */}
      {(categories.antojitos.length > 0 || categories.postres.length > 0) && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">🧁 Antojitos y Postres</h2>
            <p className="text-gray-600 mt-2">Dulces tradiciones y antojitos salvadoreños</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...categories.antojitos, ...categories.postres].map((product) => (
              <div key={product.id} className="bg-white rounded-xl p-4 text-center border border-gray-200">
                <div className="text-4xl mb-2">
                  {product.name.toLowerCase().includes('pastel') || product.name.toLowerCase().includes('empanada') ? '🥟' : '🍰'}
                </div>
                <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                <p className="text-pink-600 font-bold">${Number(product.price).toFixed(2)}</p>
                <Button className="mt-2 bg-pink-600 hover:bg-pink-700 text-sm">
                  Ordenar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bebidas Típicas */}
      {categories.bebidas.length > 0 && (
        <div className="bg-blue-50 rounded-3xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">🥤 Bebidas Típicas</h2>
            <p className="text-gray-600 mt-2">Refrescantes bebidas tradicionales salvadoreñas</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.bebidas.map((product) => (
              <div key={product.id} className="bg-white rounded-xl p-3 text-center border border-gray-200">
                <div className="text-3xl mb-1">�</div>
                <h5 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h5>
                <p className="text-blue-600 font-bold text-sm">${Number(product.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando menú del restaurante...</p>
        </div>
      )}

      {/* Sin productos */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No hay productos disponibles en el inventario.</p>
          <Button className="mt-4">
            Agregar Productos
          </Button>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">¿Listo para disfrutar?</h2>
        <p className="text-xl mb-6 opacity-90">
          Visítanos o haz tu pedido online para llevar
        </p>
        <div className="flex justify-center gap-4">
          <Button className="bg-white text-orange-600 hover:bg-gray-100">
            Ver Menú Completo
          </Button>
          <Button variant="ghost" className="border-white text-white hover:bg-white/20">
            Contactar
          </Button>
        </div>
      </div>
    </div>
  );
}