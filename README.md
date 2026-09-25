# Portfolio OS

Portafolio interactivo construido como un sistema operativo: un escritorio con
temas **macOS** y **Windows 11** que incluye ventanas arrastrables, un chat
asistente con preguntas rápidas, un visualizador de audio y un dock/taskbar.
Los proyectos se cargan desde una base de datos **Supabase**.

## Características

- **Dos temas**: cambia entre macOS Light y Windows 11 Light desde el dock o la barra de tareas.
- **Ventanas gestionables**: abre, cierra, minimiza, maximiza, arrastra y enfoca (z-index) cada ventana.
- **Carpetas por categoría**: el escritorio tiene una carpeta por categoría (Universidad, UX, Personales) que abre una ventana con sus proyectos.
- **Menú integrado**: la barra superior, el dock y la barra de tareas comparten la misma configuración de apps (`APPS`).
- **Chat asistente (Ask AI)**: responde preguntas sobre el portafolio con preguntas rápidas o entrada libre.
- **Visualizador de música**: reproductor con visualizador animado en canvas.
- **Escritorio completo**: héroe editorial, nota adhesiva arrastrable, accesos directos a carpetas/archivos.
- **Proyectos desde Supabase**: la app consume las tablas `projects`, `categories` y `project_categories`.
- **Responsive**: se adapta a móviles (ventanas centradas y apiladas).

## Stack

- [React 19](https://react.dev) + [TypeScript 5.7](https://www.typescriptlang.org)
- [Vite 8](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Font Awesome 6](https://fontawesome.com) (CDN)
- [Supabase](https://supabase.com) (`@supabase/supabase-js`) para los proyectos

## Estructura del proyecto

```
src/
├── main.tsx                  # Entrada de React
├── App.tsx                   # Layout del escritorio, tema y dock/taskbar
├── index.css                 # CSS global + Tailwind v4
├── types.ts                  # Tipos compartidos (Theme, WinId, WinState, ChatMsg, Project)
├── lib/
│   └── supabase.ts           # Cliente de Supabase + isSupabaseConfigured()
├── data/
│   └── index.ts              # Contenido/config: APPS, categorías, ventanas, chat, menú inicio
├── hooks/
│   ├── useWindowManager.ts   # Lógica de ventanas (abrir/cerrar/enfocar/mover/maximizar)
│   ├── useProjects.ts        # Fetch de proyectos + categorías desde Supabase
│   ├── useDrag.ts            # Arrastre con puntero
│   └── useClock.ts           # Reloj en vivo
└── components/
    ├── desktop/              # Elementos del escritorio (Hero, Icons, StickyNote)
    ├── shell/                # Cromo de ventanas compartido (WindowShell)
    ├── apps/                 # Contenido de ventanas + registro WIN_CONTENT
    ├── macos/                # UI específica de macOS (MacDock)
    └── win11/                # UI específica de Windows 11 (Win11Taskbar)

supabase/
└── schema.sql                # Esquema de referencia (projects, categories, project_categories)
```

## Requisitos

- Node.js 22+ (recomendado; `.mise.toml` fija la versión)
- npm 10+ (incluido con Node.js)

## Cómo ejecutar

Instala las dependencias (una sola vez):

```bash
npm install
```

Levanta el servidor de desarrollo:

```bash
npm run dev
```

Abre `http://localhost:8443` en el navegador. Los cambios en el código se
recargan en caliente (HMR).

## Configurar Supabase

La app carga los proyectos (y sus categorías) desde Supabase. La base de datos
usa tres tablas:

- `projects` — `id, title, description, repoUrl, liveUrl, createdAt, image, featured`
- `categories` — `id, slug, label` (personal, university, ux)
- `project_categories` — relación `project_id ↔ category_id`

Para conectarla:

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. (Opcional) Si empiezas de cero, ejecuta `supabase/schema.sql` en **SQL Editor**
   para crear las tablas con RLS de lectura pública.
3. Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
4. En **Settings → API**, copia la `Project URL` y la publishable/anon key a `.env`:
   ```
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=TU_PUBLISHABLE_KEY
   ```
5. Reinicia el servidor de desarrollo.

> **Importante**: usa la **publishable/anon key** (la que comienza por
> `sb_publishable_` o `eyJhbGci...`). Nunca pongas la `service_role`/secret key en
> el cliente ni en `.env`. Sin estas variables la app se ejecuta pero la ventana
> de Proyectos muestra un aviso de configuración.

## Scripts disponibles

| Comando              | Descripción                                            |
| -------------------- | ------------------------------------------------------ |
| `npm run dev`        | Servidor de desarrollo en `http://localhost:8443`      |
| `npm run build`      | Build de producción en `dist/`                         |
| `npm run preview`    | Sirve el build de producción en el puerto 8443         |
| `npm run typecheck`  | Verifica tipos con TypeScript (sin emitir)             |
| `npm run format`     | Formatea el código con oxfmt                           |

## Cómo probar el sistema

1. **Toggle de tema**: en el dock haz clic en el botón `apple ⇄ windows`
   (o en la barra de tareas de Windows) para alternar entre macOS y Windows 11.
   Verifica que cambian el fondo, el estilo de las ventanas y los controles
   (semáforos ⇄ botones de Windows).
2. **Ventanas**: abre cada app desde el dock, los iconos del escritorio o el menú
   inicio. Arrastra por la barra de título, maximiza con el botón verde/cuadrado
   y cierra con la roja/X. Al hacer clic en una ventana debe subir al frente.
3. **Proyectos y categorías**: en el escritorio hay una carpeta por categoría
   (*Universidad*, *UX*, *Personales*); cada una abre una ventana con sus
   proyectos. El icono *Projects* del dock/menú muestra todos agrupados por
   categoría. Con Supabase configurado se cargan los datos de la base; sin
   configurar, aparece un aviso.
4. **Chat (Ask AI)**: toca las preguntas rápidas o escribe una pregunta
   (p. ej. "¿Cuál es tu stack?", "¿haces freelance?"). El asistente responde
   tras un breve retardo.
5. **Música**: abre *Audio Player* desde el dock y pulsa play; el visualizador
   de barras se anima en canvas.
6. **Menú inicio (Windows)**: en el tema Windows, haz clic en el logo de Windows
   de la barra de tareas; el menú debe abrir y cerrar al elegir una opción.
7. **Menú integrado**: la barra superior y el dock/taskbar muestran las mismas
   apps (misma config `APPS`); al abrir una app desde cualquiera de los dos, se
   abre la misma ventana.
8. **Responsive**: reduce el ancho de la ventana del navegador (< 640 px); los
   iconos y las ventanas deben adaptarse y centrarse en móvil.

## Despliegue

Genera el build de producción y sírvelo con cualquier host estático:

```bash
npm run build
```

El resultado queda en `dist/`. Recuerda configurar las variables
`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el host elegido.