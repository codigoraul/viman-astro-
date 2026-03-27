# Optimización de WordPress para uso Headless

## ✅ Plugins que DEBES MANTENER

### Si usas WooCommerce:
- **WooCommerce** - Para gestionar productos
- **WooCommerce REST API** - Ya viene incluido

### Para campos personalizados:
- **Advanced Custom Fields (ACF)** - Si tienes datos extra en productos
- **ACF to REST API** - Para exponer campos ACF en la API

### Para SEO (solo metadatos):
- **Yoast SEO** o **Rank Math** - Solo para gestionar metadatos
  - Desactiva todas las opciones de frontend
  - Solo usa para título, descripción, Open Graph

## ❌ Plugins que PUEDES ELIMINAR

### Caché y Optimización (no necesarios):
- ❌ WP Super Cache
- ❌ W3 Total Cache
- ❌ WP Rocket
- ❌ Autoptimize
- ❌ Smush / Imagify / ShortPixel (optimización de imágenes)
- ❌ Lazy Load plugins

**Razón:** Astro maneja el caché y optimización. WordPress solo sirve JSON.

### Constructores de Páginas:
- ❌ Elementor
- ❌ Divi Builder
- ❌ WPBakery
- ❌ Beaver Builder
- ❌ Gutenberg blocks extras

**Razón:** No usas el frontend de WordPress.

### Formularios y Funcionalidad Frontend:
- ❌ Contact Form 7
- ❌ Gravity Forms
- ❌ WPForms
- ❌ Ninja Forms

**Razón:** Implementa formularios en Astro con servicios como Formspree o EmailJS.

### Sliders y Galerías:
- ❌ Revolution Slider
- ❌ MetaSlider
- ❌ NextGEN Gallery

**Razón:** Crea sliders en Astro con Swiper.js o similar.

### Seguridad Frontend:
- ❌ Wordfence (parte del frontend)
- ❌ iThemes Security (funciones de frontend)

**Mantén solo:** Limit Login Attempts, autenticación de dos factores

### Redes Sociales:
- ❌ Social sharing buttons
- ❌ Social feed plugins

**Razón:** Implementa en Astro.

## 🎨 Tema de WordPress

### Cambiar a tema ligero:

1. Ve a Apariencia → Temas
2. Activa **Twenty Twenty-Four** o **Twenty Twenty-Three**
3. Elimina temas pesados (Avada, Enfold, etc.)

**Razón:** El tema no se usa en el frontend. Solo necesitas uno ligero para el admin.

## ⚙️ Configuraciones Recomendadas

### 1. Enlaces Permanentes
```
Ajustes → Enlaces permanentes
Selecciona: "Nombre de la entrada" o "Estructura personalizada"
```

### 2. Desactivar comentarios (si no los usas)
```
Ajustes → Comentarios
Desmarcar: "Permitir comentarios"
```

### 3. Desactivar pingbacks/trackbacks
```
Ajustes → Comentarios
Desmarcar: "Permitir avisos de enlaces desde otros sitios"
```

### 4. Configurar medios
```
Ajustes → Medios
Define tamaños de imagen que usarás en Astro
```

## 🔧 Código para wp-config.php

Agrega estas optimizaciones en `wp-config.php`:

```php
// Desactivar revisiones de posts (reduce BD)
define('WP_POST_REVISIONS', 3);

// Desactivar auto-guardado
define('AUTOSAVE_INTERVAL', 300);

// Aumentar memoria si es necesario
define('WP_MEMORY_LIMIT', '256M');

// Habilitar CORS para API
define('ALLOW_CORS', true);
```

## 🌐 Habilitar CORS (si es necesario)

Si tienes problemas de CORS, agrega en `functions.php` del tema:

```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        return $value;
    });
}, 15);
```

## 📊 Resultado Esperado

### Antes de optimizar:
- 50+ plugins activos
- Tema pesado (20+ MB)
- Base de datos: 200+ MB
- Tiempo de carga admin: 3-5 segundos

### Después de optimizar:
- 5-10 plugins esenciales
- Tema ligero (2-3 MB)
- Base de datos: 50-100 MB
- Tiempo de carga admin: 1-2 segundos

## 🔍 Verificar que la API funciona

Prueba estos endpoints en tu navegador:

```
https://viman.cl/prueba/wp-json/wp/v2/products
https://viman.cl/prueba/wp-json/wp/v2/categories
https://viman.cl/prueba/wp-json/wp/v2/media
```

Si usas WooCommerce:
```
https://viman.cl/prueba/wp-json/wc/v3/products
```

## 💡 Tips Adicionales

1. **Backup antes de eliminar:** Haz backup de la BD antes de eliminar plugins
2. **Elimina uno por uno:** Desactiva y prueba la API después de cada plugin
3. **Limpia la BD:** Usa WP-Optimize para limpiar tablas huérfanas
4. **Actualiza regularmente:** Mantén WordPress y plugins actualizados
5. **Monitorea el tamaño:** Revisa el tamaño de la BD mensualmente

## 🚀 Próximos Pasos

1. Haz backup completo de WordPress
2. Desactiva plugins no esenciales uno por uno
3. Cambia a tema ligero
4. Prueba que la API siga funcionando
5. Elimina plugins desactivados
6. Limpia la base de datos
7. Verifica que Astro siga obteniendo datos correctamente
