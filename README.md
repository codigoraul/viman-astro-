# VIMAN - Sitio Astro con WordPress Headless

Este proyecto utiliza Astro como frontend y WordPress como CMS headless para gestionar productos.

## 🚀 Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y ajusta la URL de tu WordPress:

```bash
cp .env.example .env
```

El archivo `.env` debe contener:
```
WORDPRESS_API_URL=https://viman.cl/prueba/wp-json/wp/v2
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

El sitio estará disponible en `http://localhost:4321/muestra/`

### 4. Construir para producción

```bash
npm run build
```

Los archivos estáticos se generarán en la carpeta `dist/`

## 📁 Estructura del Proyecto

```
/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── ProductCard.astro
│   ├── layouts/          # Layouts de página
│   │   └── Layout.astro
│   ├── lib/              # Utilidades y servicios
│   │   └── wordpress.ts  # Cliente API de WordPress
│   └── pages/            # Páginas del sitio
│       ├── index.astro
│       ├── productos/
│       ├── producto/[slug].astro
│       └── categoria/[slug].astro
├── public/               # Archivos estáticos
└── astro.config.mjs      # Configuración de Astro
```

## 🔧 Configuración de WordPress (viman.cl/prueba)

### Plugins necesarios para WordPress Headless:

**MANTENER:**
- **WooCommerce** (si usas productos de WooCommerce)
- **Advanced Custom Fields (ACF)** (si tienes campos personalizados)
- **Yoast SEO** o **Rank Math** (solo para metadatos, no para frontend)

**PUEDES ELIMINAR (no necesarios para headless):**
- Plugins de caché (WP Super Cache, W3 Total Cache, etc.)
- Plugins de optimización de imágenes para frontend
- Plugins de formularios de contacto (usa alternativas en Astro)
- Temas pesados (usa un tema ligero como Twenty Twenty-Four)
- Plugins de construcción de páginas (Elementor, Divi, etc.)
- Plugins de sliders y galerías
- Plugins de SEO para frontend (solo necesitas los metadatos)

### Optimizaciones recomendadas en WordPress:

1. **Cambiar a un tema ligero:**
   - Usa "Twenty Twenty-Four" o similar
   - El tema no afecta tu sitio Astro

2. **Habilitar la API REST de WordPress:**
   - Ve a Ajustes → Enlaces permanentes
   - Selecciona cualquier opción excepto "Simple"
   - Guarda cambios

3. **Instalar plugin para productos (si no usas WooCommerce):**
   - Puedes usar Custom Post Types UI para crear tipo "productos"
   - O usar WooCommerce y acceder vía `/wp-json/wc/v3/products`

4. **Configurar CORS (si es necesario):**
   Agrega en `wp-config.php` o en un plugin:
   ```php
   header("Access-Control-Allow-Origin: *");
   ```

## 🛠️ Desarrollo

### Agregar nuevos productos

1. Ve a `viman.cl/prueba/wp-admin`
2. Agrega productos con:
   - Título
   - Descripción
   - Imagen destacada
   - Categorías
3. Los cambios aparecerán automáticamente en desarrollo
4. Para producción, ejecuta `npm run build` de nuevo

### Personalizar diseño

- Edita los componentes en `src/components/`
- Modifica estilos en `src/layouts/Layout.astro`
- Usa Tailwind CSS para estilos

## 📦 Despliegue

### Opción 1: Subir a viman.cl/muestra

1. Construye el proyecto:
   ```bash
   npm run build
   ```

2. Sube el contenido de `dist/` a tu servidor en la carpeta `/muestra/`

3. Asegúrate de que el archivo `.htaccess` permita las rutas:
   ```apache
   RewriteEngine On
   RewriteBase /muestra/
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^(.*)$ /muestra/$1 [L]
   ```

### Opción 2: Netlify / Vercel

1. Conecta tu repositorio Git
2. Configura:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base path: `/muestra`

## 🔄 Actualización de contenido

El sitio es **estático**, por lo que necesitas reconstruir cuando cambies contenido en WordPress:

1. Edita productos en WordPress
2. Ejecuta `npm run build`
3. Sube los archivos actualizados

**Alternativa:** Configura un webhook para reconstruir automáticamente cuando publiques en WordPress.

## 📝 Notas importantes

- La URL base del sitio es `/muestra/` (configurado en `astro.config.mjs`)
- WordPress en `viman.cl/prueba` funciona solo como API
- Todos los estilos y frontend están en Astro
- El sitio generado es 100% estático y muy rápido

## 🆘 Solución de problemas

### Error: No se cargan los productos

1. Verifica que WordPress REST API esté activa: `https://viman.cl/prueba/wp-json/wp/v2/products`
2. Revisa la URL en `.env`
3. Asegúrate de que los productos estén publicados

### Error: Rutas no funcionan

1. Verifica que `base: '/muestra'` esté en `astro.config.mjs`
2. Revisa la configuración del servidor web

## 📧 Soporte

Para más información sobre Astro: https://docs.astro.build
