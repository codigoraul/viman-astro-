const WORDPRESS_API_URL = import.meta.env.WORDPRESS_API_URL || 'http://localhost:10084/wp-json/wp/v2';

// ============================================================
// CACHÉ EN MEMORIA - Evita llamadas repetidas al servidor
// Los datos se cachean por 5 minutos (300s) en modo dev
// ============================================================
const CACHE_TTL = 5 * 60 * 1000;
const _cache = new Map<string, { data: any; timestamp: number }>();

function getCached<T>(key: string): T | null {
  const entry = _cache.get(key);
  if (entry && (Date.now() - entry.timestamp) < CACHE_TTL) {
    return entry.data as T;
  }
  _cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  _cache.set(key, { data, timestamp: Date.now() });
}

// ============================================================
// INTERFACES - Estructura de datos desde WP Local + ACF
// ============================================================

export interface WPProduct {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  // Campos ACF expuestos por el plugin viman-productos
  descripcion_corta: string;
  especificaciones: string;
  galeria: Array<{
    ID: number;
    url: string;
    alt: string;
    title: string;
    sizes: {
      thumbnail: string;
      medium: string;
      large: string;
      full: string;
    };
  }> | null;
  ficha_tecnica: {
    ID: number;
    url: string;
    title: string;
    filename: string;
  } | null;
  modelo: string;
  capacidad: string;
  material: string;
  destacado: boolean;
  orden: number;
  // Campos computados por el plugin
  imagen_url: {
    full: string | null;
    medium: string | null;
  } | null;
  categorias: Array<{
    id: number;
    name: string;
    slug: string;
    parent: number;
  }>;
  // Compatibilidad con código existente
  name?: string;
  images?: Array<{ id: number; src: string; alt: string }>;
  short_description?: string;
  price?: string;
  _embedded?: any;
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent: number;
  fallbackProductSlugs?: string[];
}

export interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
  };
}

// ============================================================
// FETCH GENÉRICO
// ============================================================

async function fetchAPI<T = any>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${WORDPRESS_API_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching from WordPress:', error);
    throw error;
  }
}

// ============================================================
// PRODUCTOS
// ============================================================

/** Limpia HTML del excerpt de WooCommerce (h1, links PDF, botones) */
function cleanExcerpt(html: string): string {
  if (!html) return '';
  return html
    .replace(/<h1[^>]*>.*?<\/h1>/gi, '')
    .replace(/<a[^>]*download[^>]*>.*?<\/a>/gi, '')
    .replace(/<a[^>]*href[^>]*\.pdf[^>]*>.*?<\/a>/gi, '')
    .replace(/<a[^>]*style[^>]*>.*?<\/a>/gi, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/** Normaliza un producto WP+ACF para compatibilidad con templates existentes */
function normalizeProduct(p: any): WPProduct {
  // Prioridad para descripción: ACF > excerpt limpio
  const descCorta = p.descripcion_corta || cleanExcerpt(p.excerpt?.rendered || '');
  const embeddedFeatured = p._embedded?.['wp:featuredmedia']?.[0];
  const embeddedTerms = Array.isArray(p._embedded?.['wp:term'])
    ? p._embedded['wp:term'].reduce((acc: any[], terms: any[]) => acc.concat(terms || []), [])
    : [];
  const categoriaTerms = embeddedTerms.filter((term: any) => term?.taxonomy === 'categoria_producto');
  const categorias = Array.isArray(p.categorias) && p.categorias.length
    ? p.categorias
    : categoriaTerms.map((term: any) => ({
        id: term.id,
        name: term.name,
        slug: term.slug,
        parent: term.parent ?? 0,
      }));
  const embeddedFull = embeddedFeatured?.source_url
    || embeddedFeatured?.media_details?.sizes?.large?.source_url
    || null;
  const embeddedMedium = embeddedFeatured?.media_details?.sizes?.medium?.source_url || embeddedFull;
  const featuredFull = p.imagen_url?.full || embeddedFull;
  const featuredMedium = p.imagen_url?.medium || embeddedMedium;

  return {
    ...p,
    // Campos de compatibilidad
    name: p.title?.rendered || '',
    short_description: descCorta,
    descripcion_corta: descCorta,
    categorias,
    imagen_url: {
      full: featuredFull,
      medium: featuredMedium,
    },
    images: p.galeria
      ? p.galeria.map((img: any) => ({
          id: img.ID,
          src: img.url || img.sizes?.full || '',
          alt: img.alt || img.title || '',
        }))
      : featuredFull
        ? [{ id: p.featured_media || embeddedFeatured?.id || 0, src: featuredFull, alt: p.title?.rendered || '' }]
        : [],
  };
}

export async function getProducts(perPage: number = 100): Promise<WPProduct[]> {
  const cacheKey = `products_${perPage}`;
  const cached = getCached<WPProduct[]>(cacheKey);
  if (cached) {
    console.log(`⚡ Cache hit: ${cached.length} productos`);
    return cached;
  }

  try {
    const data = await fetchAPI<any[]>('/productos', {
      per_page: perPage.toString(),
      orderby: 'date',
      order: 'desc',
      _embed: 'true',
    });
    const products = data.map(normalizeProduct);
    console.log(`✅ ${products.length} productos cargados desde WP Local`);
    setCache(cacheKey, products);
    return products;
  } catch (error) {
    console.error('Error cargando productos:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<WPProduct | null> {
  const cacheKey = `product_${slug}`;
  const cached = getCached<WPProduct>(cacheKey);
  if (cached) {
    console.log(`⚡ Cache hit: producto ${slug}`);
    return cached;
  }

  try {
    const data = await fetchAPI<any[]>('/productos', { slug, _embed: 'true' });
    if (data.length > 0) {
      const product = normalizeProduct(data[0]);
      console.log(`✅ Producto encontrado: ${product.name}`);
      setCache(cacheKey, product);
      return product;
    }
  } catch (error) {
    console.error('Error obteniendo producto por slug:', error);
  }
  return null;
}

export async function getProductsByCategory(categoryId: number): Promise<WPProduct[]> {
  if (!categoryId || categoryId < 0) {
    return [];
  }

  const cacheKey = `products_cat_${categoryId}`;
  const cached = getCached<WPProduct[]>(cacheKey);
  if (cached) {
    console.log(`⚡ Cache hit: ${cached.length} productos (cat ${categoryId})`);
    return cached;
  }

  try {
    const data = await fetchAPI<any[]>('/productos', {
      'categoria_producto': categoryId.toString(),
      per_page: '100',
      _embed: 'true',
    });
    const products = data.map(normalizeProduct);
    setCache(cacheKey, products);
    return products;
  } catch (error) {
    console.error('Error con productos por categoría:', error);
    return [];
  }
}

// ============================================================
// CATEGORÍAS
// ============================================================

const REQUIRED_CATEGORY_SLUGS = [
  {
    slug: 'camiones-combustible',
    name: 'Camiones Combustible',
    description: 'Camiones abastecedores y tanques móviles certificados para operaciones industriales y aeroportuarias.',
    fallbackProductSlugs: [],
  },
  {
    slug: 'estanque-combustible-subterraneo',
    name: 'Estanque Combustible Subterráneo',
    description: 'Estanques subterráneos de combustibles con protocolos de inspección, control de fugas y doble contención.',
    fallbackProductSlugs: ['estanque-combustible-subterraneo'],
  },
  {
    slug: 'estanque-combustible-superficie',
    name: 'Estanque Combustible Superficie',
    description: 'Soluciones en superficie para almacenamiento seguro de combustibles en faenas y plantas industriales.',
    fallbackProductSlugs: ['estanque-combustible-superficie'],
  },
];

export async function getCategories(): Promise<WPCategory[]> {
  const cached = getCached<WPCategory[]>('categories');
  if (cached) {
    console.log(`⚡ Cache hit: ${cached.length} categorías`);
    return cached;
  }

  try {
    const data = await fetchAPI<WPCategory[]>('/categorias-producto', {
      per_page: '100',
    });
    const categories: WPCategory[] = data.map((cat) => ({ ...cat }));

    for (let index = 0; index < REQUIRED_CATEGORY_SLUGS.length; index++) {
      const required = REQUIRED_CATEGORY_SLUGS[index];
      const existing = categories.find((cat) => cat.slug === required.slug);
      if (existing) {
        existing.description = existing.description || required.description;
        existing.fallbackProductSlugs = required.fallbackProductSlugs;
        continue;
      }

      if (!existing) {
        const fallbackCategory = await getCategoryBySlug(required.slug);
        if (fallbackCategory) {
          categories.push({
            ...fallbackCategory,
            fallbackProductSlugs: required.fallbackProductSlugs,
            description: fallbackCategory.description || required.description,
          });
        } else {
          categories.push({
            id: -(index + 1),
            name: required.name,
            slug: required.slug,
            description: required.description,
            count: 0,
            parent: 0,
            fallbackProductSlugs: required.fallbackProductSlugs,
          });
        }
      }
    }

    console.log(`✅ ${categories.length} categorías cargadas`);
    setCache('categories', categories);
    return categories;
  } catch (error) {
    console.error('Error cargando categorías:', error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
  const cacheKey = `category_${slug}`;
  const cached = getCached<WPCategory>(cacheKey);
  if (cached) {
    console.log(`⚡ Cache hit: categoría ${slug}`);
    return cached;
  }

  try {
    const data = await fetchAPI<WPCategory[]>('/categorias-producto', { slug });
    if (data.length > 0) {
      setCache(cacheKey, data[0]);
      return data[0];
    }
  } catch (error) {
    console.error('Error obteniendo categoría por slug:', error);
  }
  return null;
}

/** Obtener categorías padre (parent = 0) */
export async function getParentCategories(): Promise<WPCategory[]> {
  const categories = await getCategories();
  return categories.filter(c => c.parent === 0);
}

/** Obtener subcategorías de una categoría padre */
export async function getChildCategories(parentId: number): Promise<WPCategory[]> {
  const categories = await getCategories();
  return categories.filter(c => c.parent === parentId);
}

// ============================================================
// MEDIA
// ============================================================

export async function getMedia(mediaId: number): Promise<WPMedia | null> {
  try {
    return await fetchAPI<WPMedia>(`/media/${mediaId}`);
  } catch {
    return null;
  }
}

// ============================================================
// POSTS (blog)
// ============================================================

export async function getPosts(perPage: number = 10): Promise<any[]> {
  return fetchAPI('/posts', {
    per_page: perPage.toString(),
    _embed: 'true',
  });
}
