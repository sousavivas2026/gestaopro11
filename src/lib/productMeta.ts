export interface CostItemMeta { description: string; cost: number }

interface ProductMeta {
  components_text?: string;
  cost_items?: CostItemMeta[];
}

const META_KEY = 'product_meta_map';

function readMap(): Record<string, ProductMeta> {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, ProductMeta>) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(map));
  } catch {}
}

export function getProductMeta(id?: string): ProductMeta | undefined {
  if (!id) return undefined;
  const map = readMap();
  return map[id];
}

export function saveProductMeta(id: string, meta: ProductMeta) {
  if (!id) return;
  const map = readMap();
  map[id] = { ...(map[id] || {}), ...meta };
  writeMap(map);
}

export function parseCostItems(value: any): CostItemMeta[] {
  try {
    if (Array.isArray(value)) return value as CostItemMeta[];
    if (typeof value === 'string') return JSON.parse(value) as CostItemMeta[];
  } catch {}
  return [];
}
