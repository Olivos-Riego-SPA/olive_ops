# Sistema de Diseño: Precisión Industrial Moderna

> **Implementación:** Los tokens están definidos en [`app/globals.css`](app/globals.css) dentro del bloque `@theme` de Tailwind v4. Las fuentes (Space Grotesk y Manrope) se cargan desde Google Fonts en [`app/layout.tsx`](app/layout.tsx).


## 1. Visión General

### El Norte Creativo: "El Comando del Agrónomo Digital"

Este sistema de diseño se aleja del cliché de "granja verde y amigable". En su lugar, adopta la personalidad de un centro de comando de alta gama y misión crítica. Trata los datos agrícolas con la misma seriedad que la telemetría aeroespacial o las interfaces de trading de alta frecuencia.

La estética está definida por la **Precisión Industrial Moderna**: una fusión de utilidad robusta y sofisticación digital. Rompemos el aspecto de "template genérico" a través de asimetría intencional, escalas tipográficas ultra-amplias y un modelo de profundidad de "vidrio en capas". No solo mostramos datos; construimos un entorno de toma de decisiones de alto impacto donde cada píxel se siente *ingenierizado*, no simplemente "puesto".

---

## 2. Colores y Filosofía de Superficies

La paleta está enraizada en la profundidad de la tierra y la vibración técnica de los sensores modernos.

### La Paleta

| Token | Hex | Uso |
|---|---|---|
| **Primary (Petróleo Profundo)** | `#95d0e0` (Light) / `#004d5b` (Container) | Ancla visual. Mecánico, profundo, autoritario. |
| **Secondary (Lima Eléctrico)** | `#c3f400` | Exclusivo para "Activo", "Óptimo" y "Seguro". Debe sentirse como un LED en un panel oscuro. |
| **Tertiary (Naranja Vibrante)** | `#ffb59a` / `#7e2900` | Alertas, mapas de calor críticos, intervención requerida. |
| **Neutral (El Vacío)** | `#0c1517` (Surface) | Teal casi negro. El canvas de alta contrastre para la precisión industrial. |

### Regla "Sin Líneas"

**Instrucción explícita:** Prohibido usar bordes de `1px solid` para seccionar o agrupar contenido.

Los límites deben definirse únicamente mediante cambios en el color de fondo. Por ejemplo, una sección `surface-container-low` sobre un fondo `surface` genera una separación natural y sofisticada. Si sentís la necesidad de trazar una línea, es porque no estás usando la Escala de Elevación correctamente.

### Regla "Vidrio y Gradiente"

Para lograr el feeling de "Centro de Comando", usar **Glassmorfismo** en todos los overlays flotantes (modales, popovers, navegación flotante): colores de superficie semi-transparentes con `backdrop-blur` de 12px–20px.

- **Textura Signature:** Aplicar un gradiente lineal sutil (de `primary` a `primary-container` al 15% de opacidad) en las hero cards grandes para simular el "alma" de una pantalla digital de alta gama.

---

## 3. Tipografía: El Filo Editorial

Usamos un pairing de alto contraste para equilibrar precisión técnica con legibilidad.

| Rol | Fuente | Uso |
|---|---|---|
| **Display & Headlines** | Space Grotesk | La voz "Industrial". Anchos tabulares y quirks geométricos que evocan números de serie en maquinaria pesada. |
| **Body & Títulos** | Manrope | La voz "Precision". Muy legible en tamaños pequeños. |

### Escala Tipográfica

| Nivel | Tamaño | Uso |
|---|---|---|
| `display-lg` | 3.5rem | Métricas hero (ej: pH del suelo, pronóstico de rendimiento). Letter-spacing: `-0.02em`. |
| `title-lg` | — | Headers de cards. |
| `body-md` | — | Labels de datos. |
| `label-sm` | — | Metadata. |
| `label-md` | — | Labels de inputs. All-caps, letter-spacing: `0.05em`. |

**El contraste editorial:** Alternar agresivamente entre `display-lg` para datos y `label-sm` para metadata. Este contraste evita que la UI parezca un dashboard genérico.

---

## 4. Elevación y Profundidad: Capas Tonales

En este sistema, "más arriba" no significa "con sombra". Significa "más claro".

### El Principio de Capas

| Nivel | Token | Rol |
|---|---|---|
| Level 0 | `surface` | El piso base. |
| Level 1 | `surface-container-low` | Bloques de contenido principales. |
| Level 2 | `surface-container-highest` | Cards interactivas individuales. |

### Sombras Ambientales

Cuando un elemento debe flotar (ej: un toast de alerta crítica), usar una sombra extra-difusa:

```
box-shadow: 0 20px 40px rgba(0, 77, 91, 0.15);
```

El color de la sombra es una versión tintada del Petroleum Blue, **nunca gris**.

### El Fallback "Ghost Border"

Si un contenedor está sobre un fondo del mismo color, usar un "Ghost Border": token `outline-variant` al **15% de opacidad**. Debe *sentirse*, no verse.

---

## 5. Componentes: Utilidad Ingenierizada

### Botones: Los Actuadores Cinéticos

| Tipo | Estilo |
|---|---|
| **Primary** | Fondo `secondary-container` (Lima Eléctrico), texto `on-secondary-container`. Alta visibilidad para estados de "Acción". |
| **Secondary** | Fondo `primary-container` + Ghost Border `primary` al 20% de opacidad. |

- **Shape:** `rounded-sm` (0.125rem) o `none` para el feel brutalista-industrial. Evitar bordes grandes, se sienten demasiado "consumer-soft".

### Cards: Los Módulos de Datos

- **Regla:** Prohibido usar líneas divisoras dentro de las cards. Usar `spacing-6` (1.3rem) de espacio vertical para separar el header del cuerpo de datos.
- **Estilo visual:** Fondo `surface-container-highest`. Para estados de monitoreo "Activo", agregar una barra de 2px en el borde izquierdo usando el token `secondary` (Lima Eléctrico).

### Campos de Entrada: Ingreso Técnico

- **Estilo:** Minimalista. Solo un borde inferior con `outline-variant` al 20% de opacidad.
- **Focus:** La línea transiciona a `primary` (`#95d0e0`) con un glow exterior sutil.
- **Labels:** Siempre usar `label-md` en `Space Grotesk`, posicionado sobre el campo, en `all-caps` con `0.05em` de letter-spacing.

### Componentes Especializados

| Componente | Descripción |
|---|---|
| **Telemetry Strip** | Lista horizontal con scroll de pings de sensores en tiempo real. Usar `surface-container-lowest` para crear un aspecto "hundido" en el dashboard. |
| **Status Orbs** | En lugar de íconos estándar, usar pequeños glows circulares (`secondary` para OK, `tertiary` para Alerta) con efecto `blur-sm` para imitar LEDs de hardware. |

---

## 6. Do's & Don'ts

### Hacer:

- **Abrazar la asimetría.** Ubicar una métrica `display-lg` fuera del centro para generar interés visual.
- **Usar `secondary` (Lima Eléctrico) con moderación.** Es un puntero láser, no un pincel.
- **Tratar el espacio en blanco como elemento estructural.** Usar la escala `spacing-16` o `spacing-24` para que los datos "Hero" respiren.

### No hacer:

- **No usar negro puro ni gris puro.** Todo "neutral" debe estar tintado con la base Petroleum Blue para mantener la profundidad tonal.
- **No usar divisores de 1px.** Si necesitás separar contenido, cambiar el nivel de `surface-container`.
- **No usar esquinas muy redondeadas** (`xl` o `full`) en contenedores funcionales. Mantener `sm` o `md` para preservar la precisión industrial.
