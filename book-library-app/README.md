# Capstone - Desarrollo Web

**Estudiante:** Sebastián Humerez

---

## Descripción del Proyecto

Este proyecto es una **aplicación web de biblioteca digital** que permite a los usuarios **buscar, guardar en lista de deseos (wishlist)** y **prestar libros** obtenidos desde la **API pública de Google Books**. También pueden **registrarse, iniciar sesión** y **personalizar su experiencia** (por ejemplo, el tema claro/oscuro).

La aplicación combina tecnologías **modernas de frontend y backend serverless**, usando **Next.js 15**, **Firebase**, **Zustand**, y **TypeScript**. El proyecto fue desarrollado como parte del **Capstone de la materia Desarrollo Web**.

---

## Arquitectura General

### Estructura Base

El proyecto sigue una arquitectura **modular** organizada en carpetas, separando la lógica de negocio, vistas, componentes, estado y servicios. A continuación, se explica el árbol principal:

```
book-library-app/
├── functions/              # Cloud Functions de Firebase (backend serverless)
├── public/                 # Archivos estáticos y recursos públicos
├── src/app/                # Páginas y rutas gestionadas por Next.js (App Router)
├── src/components/         # Componentes reutilizables del frontend
├── src/hooks/              # Hooks personalizados (useAuth, useBooks, etc.)
├── src/lib/                # Conexión con Firebase, API de Google Books y utilidades
├── src/providers/          # Providers globales (AuthProvider, ThemeProvider)
├── src/store/              # Estados globales con Zustand
└── src/types/              # Definiciones TypeScript compartidas
```

---

## Tecnologías Principales

* **Next.js 15 + React 19** → Para el desarrollo del frontend.
* **Firebase (Auth, Firestore, Functions, Emulators)** → Backend serverless.
* **Tailwind CSS** → Para los estilos.
* **Zustand + Immer** → Para el manejo del estado global.
* **TypeScript** → Tipado estático y seguridad en el código.

---

## Uso de Firebase y arquitectura de backend

Firebase es el **núcleo del backend**, y se utiliza en diferentes capas:

1. **Firestore**: Base de datos NoSQL donde se almacenan los libros, préstamos y listas de deseos.
2. **Firebase Auth**: Maneja el registro e inicio de sesión de usuarios (incluyendo Google).
3. **Cloud Functions**: Encapsulan lógica avanzada (por ejemplo: préstamos, conteo de vistas, sincronización de libros y actualización de popularidad).
4. **Emuladores locales**: Se utilizan en desarrollo debido a que el **plan gratuito (Spark)** no permite habilitar Cloud Build y Artifact Registry requeridos para desplegar funciones. Por eso, se ejecutan localmente mediante los **Firebase Emulators**.

---

## Ejecución del Proyecto Localmente

Para ejecutar el proyecto correctamente, es necesario abrir **dos terminales**:

### 1. Terminal de Firebase (Backend local)

```bash
cd functions
pnpm run build 
pnpm firebase emulators:start --only functions,firestore,auth
```

Esto iniciará los emuladores locales de **Functions**, **Firestore**, y **Auth**, que reemplazan los servicios en la nube de Firebase.

### 2. Terminal del Frontend (Next.js)

```bash
pnpm dev
```

Esto ejecutará el entorno de desarrollo en **[http://localhost:3000](http://localhost:3000)**.

---

## Configuración del archivo `.env.local`

Crea un archivo en la raíz del proyecto con el nombre `.env.local` y agrega las siguientes variables de entorno:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBsVeDXGRTkuT3VfswC4RVUtv23m7dnHag
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=book-library-app-49efa.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=book-library-app-49efa
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=book-library-app-49efa.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=928226150569
NEXT_PUBLIC_FIREBASE_APP_ID=1:928226150569:web:67740bde07591d277381b8
NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=AIzaSyBt1gutjH4AZ6ExgRtBtXT1HRD1iyg1xA4
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
```

---

## Funcionamiento del Código

### Búsqueda y Libros

* Los libros se obtienen desde la **API de Google Books**.
* Si un libro no existe en Firestore, se **sincroniza automáticamente** al acceder a su detalle mediante la función `syncBookSnapshot`.

### Wishlist (Lista de Deseos)

* Los usuarios pueden añadir libros a su wishlist.
* Cada vez que se agrega o elimina un libro, se actualiza el contador de popularidad mediante **Cloud Functions** (`onWishlistCreate`, `onWishlistDelete`).

### Loans (Préstamos)

* Un usuario puede pedir prestado un libro si hay stock disponible.
* Cuando se presta o devuelve un libro, las funciones `createLoan` y `returnLoan` actualizan automáticamente el stock y la popularidad.

### Popularidad

* Cada libro tiene un campo `popularityScore` calculado con la siguiente fórmula:

  ```ts
  popularidad = (wishlists * 2) + (loans * 3) + (views * 0.5)
  ```
* Esto permite mostrar libros más populares o con mayor interacción.

### Sistema de Tema (Light/Dark)

* Implementado con Zustand y sincronizado con Firebase (`preferences.theme`).
* El tema se guarda localmente y en Firestore, aplicándose automáticamente al iniciar sesión.

---

## Arquitectura de Páginas

Next.js 15 usa el **App Router**, que convierte cada carpeta dentro de `src/app` en una **ruta**. Por ejemplo:

* `/books/[id]` → Muestra el detalle de un libro (CSR/SSR híbrido).
* `/me/wishlist` → Muestra la wishlist del usuario autenticado.
* `/me/loans` → Lista los préstamos activos.
* `/auth/login` y `/auth/register` → Manejan autenticación.

### SPA + SSR + CSR

El proyecto es una **Single Page Application (SPA)** porque la navegación ocurre en el cliente, manteniendo el estado y evitando recargas completas.

Sin embargo, también utiliza **Server-Side Rendering (SSR)** en partes donde se requiere pre-carga o SEO (como la página principal o el detalle de libro) y **Client-Side Rendering (CSR)** para las páginas interactivas (perfil, wishlist, loans).

Esta combinación permite:

* **SSR** → Rápida primera carga y mejor SEO.
* **CSR** → Experiencia fluida sin recargas.

---

## Conclusión

Este fue un proyecto desafiante porque utilice diferentes tecnologias nuevas, que me permitio aprender mucho en el proceso. Fue un proceso complejo por una migracion que tuve que hacer. Esta aplicacion puede escalar facilmente a un entorno de produccion miragrando a el plan blaze de firebase para poder desplegar las functions creadas.