import { supabase } from "../../lib/supabaseClient";
import type { ProductRow } from "./types";

export async function fetchProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,cost,stock,unit,is_active")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProductRow[];
}

export async function createProduct(input: {
  name: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
}): Promise<void> {
  const { error } = await supabase.from("products").insert([{
    name: input.name,
    price: input.price,
    cost: input.cost,
    stock: input.stock,
    unit: input.unit,
    is_active: true,
  }]);

  if (error) throw new Error(error.message);
}

export async function updateProduct(id: string, patch: Partial<{
  name: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
  is_active: boolean;
}>): Promise<void> {
  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

// Función para agregar comida típica salvadoreña al inventario
export async function addSalvadoranFood(): Promise<void> {
  const salvadoranFood = [
    // Pupusas
    { name: "Pupusas de Queso", price: 0.50, cost: 0.20, stock: 100, unit: "unidad" },
    { name: "Pupusas de Chicharrón", price: 0.60, cost: 0.25, stock: 80, unit: "unidad" },
    { name: "Pupusas Revueltas", price: 0.65, cost: 0.30, stock: 75, unit: "unidad" },
    { name: "Pupusas de Frijol con Queso", price: 0.55, cost: 0.22, stock: 90, unit: "unidad" },
    { name: "Pupusas de Loroco", price: 0.70, cost: 0.35, stock: 60, unit: "unidad" },
    
    // Sopa y Caldos
    { name: "Sopa de Pata", price: 8.50, cost: 4.00, stock: 20, unit: "porción" },
    { name: "Sopa de Res", price: 7.50, cost: 3.50, stock: 25, unit: "porción" },
    { name: "Caldo de Gallina India", price: 6.50, cost: 3.00, stock: 30, unit: "porción" },
    { name: "Sopa de Mondongo", price: 7.00, cost: 3.25, stock: 22, unit: "porción" },
    
    // Platos Típicos
    { name: "Plato Típico Salvadoreño", price: 12.00, cost: 6.00, stock: 15, unit: "plato" },
    { name: "Carnitas Asadas", price: 10.50, cost: 5.25, stock: 18, unit: "plato" },
    { name: "Pollo encebollado", price: 9.50, cost: 4.75, stock: 20, unit: "plato" },
    { name: "Carne Guisada", price: 8.00, cost: 4.00, stock: 25, unit: "plato" },
    { name: "Pescado Frito con Arroz", price: 11.00, cost: 5.50, stock: 12, unit: "plato" },
    
    // Acompañamientos
    { name: "Arroz Salvadoreño", price: 2.50, cost: 1.00, stock: 50, unit: "porción" },
    { name: "Frijoles Volteados", price: 2.00, cost: 0.80, stock: 50, unit: "porción" },
    { name: "Ensalada de Repollo", price: 1.50, cost: 0.60, stock: 60, unit: "porción" },
    { name: "Plátanos Fritos", price: 3.00, cost: 1.20, stock: 40, unit: "porción" },
    { name: "Yuca Frita", price: 3.50, cost: 1.40, stock: 35, unit: "porción" },
    { name: "Tamal Pisque", price: 2.50, cost: 1.00, stock: 30, unit: "unidad" },
    
    // Antojitos y Postres
    { name: "Pasteles de Carne", price: 1.00, cost: 0.40, stock: 40, unit: "unidad" },
    { name: "Empanadas de Plátano", price: 1.50, cost: 0.60, stock: 35, unit: "unidad" },
    { name: "Nuégados", price: 2.00, cost: 0.80, stock: 25, unit: "porción" },
    { name: "Arroz con Leche", price: 2.50, cost: 1.00, stock: 20, unit: "porción" },
    { name: "Tres Leches Salvadoreño", price: 4.00, cost: 1.60, stock: 15, unit: "porción" },
    
    // Bebidas Típicas
    { name: "Horchata Salvadoreña", price: 2.00, cost: 0.80, stock: 40, unit: "vaso" },
    { name: "Ensalada de Fruta", price: 2.50, cost: 1.00, stock: 30, unit: "vaso" },
    { name: "Maranón con Leche", price: 2.50, cost: 1.00, stock: 25, unit: "vaso" },
    { name: "Chilate", price: 3.00, cost: 1.20, stock: 20, unit: "vaso" },
    { name: "Tiste de Maíz", price: 2.00, cost: 0.80, stock: 25, unit: "vaso" },
    { name: "Agua de Cebada", price: 1.50, cost: 0.60, stock: 30, unit: "vaso" },
    
    // Desayunos Típicos
    { name: "Desayuno Típico Completo", price: 8.00, cost: 4.00, stock: 20, unit: "plato" },
    { name: "Casamiento con Huevo", price: 5.50, cost: 2.75, stock: 25, unit: "plato" },
    { name: "Tamales de Elote", price: 1.50, cost: 0.60, stock: 30, unit: "unidad" },
    { name: "Atol de Elote", price: 1.50, cost: 0.60, stock: 35, unit: "vaso" },
    { name: "Atol de Piña", price: 1.50, cost: 0.60, stock: 30, unit: "vaso" },
  ];

  for (const food of salvadoranFood) {
    try {
      await createProduct(food);
      console.log(`✅ Agregado: ${food.name}`);
    } catch (error) {
      console.error(`❌ Error agregando ${food.name}:`, error);
    }
  }
}