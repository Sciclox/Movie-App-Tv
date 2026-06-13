# LaMovie TV - Android TV App

Una aplicación nativa de **Android TV** que funciona como un contenedor inteligente (WebView Wrapper) para la web de streaming [LaMovie.org](https://lamovie.org/). Esta aplicación está diseñada específicamente para televisores inteligentes y dispositivos de transmisión (Chromecast con Google TV, Xiaomi Mi Box, Fire TV Stick, etc.).

---

## 🚀 Características Clave

*   **Navegación Espacial 2D Inteligente (D-Pad):** Mapeo de los botones direccionales (Arriba, Abajo, Izquierda, Derecha, OK/Enter) del control remoto para navegar de manera intuitiva por las cuadrículas y menús de la web.
*   **Enfoque Visual Claro (Branding LaMovie):** Los elementos seleccionados muestran un borde rojo brillante con sombra y una micro-animación de zoom para que el usuario sepa en todo momento qué película o serie tiene seleccionada.
*   **Auto-Scroll Centrado:** Al mover el foco, la pantalla se desplaza automáticamente de forma suave para mantener el elemento enfocado siempre en el centro.
*   **Soporte de Video en Pantalla Completa:** Implementación personalizada de `WebChromeClient` que intercepta las peticiones de pantalla completa de reproductores externos (como VOE, Goodstream, etc.) y los despliega sobre un contenedor inmersivo nativo.
*   **Control del Botón Atrás:** Mapeo del botón de retorno del mando para salir de la pantalla completa del video o retroceder en el historial de navegación web sin cerrar la app accidentalmente.
*   **Integración con GitHub Actions:** Compilación automatizada en la nube que genera el archivo APK instalable cada vez que se sube un cambio al repositorio.

---

## 🛠️ Estructura del Proyecto

El proyecto sigue una estructura limpia estándar de Android Studio:

```text
├── .github/workflows/
│   └── build.yml               # Configuración de compilación automatizada en GitHub Actions
├── app/
│   ├── src/main/
│   │   ├── assets/
│   │   │   └── tv_script.js    # Inyección de código JS para navegación D-Pad y scroll
│   │   ├── java/com/lamovie/tvapp/
│   │   │   └── MainActivity.kt # Lógica del WebView, clientes personalizados y Fullscreen
│   │   ├── res/
│   │   │   ├── drawable/
│   │   │   │   └── tv_banner.png # Banner promocional para el Launcher de Android TV
│   │   │   ├── layout/
│   │   │   │   └── activity_main.xml # Layout de WebView + Contenedor de Video
│   │   │   └── values/
│   │   │       ├── colors.xml   # Paleta de colores (Rojo LaMovie y Tema Oscuro)
│   │   │       ├── strings.xml  # Textos y nombre de la app
│   │   │       └── themes.xml   # Tema Fullscreen sin barras del sistema
│   │   └── AndroidManifest.xml # Configuración de Leanback TV y permisos de red
│   └── build.gradle            # Dependencias del módulo
├── gradle/wrapper/
│   └── gradle-wrapper.properties # Configuración de versión de Gradle
├── build.gradle                # Configuración de plugins del proyecto
└── settings.gradle             # Configuración de módulos
```

---

## 📦 Compilación y Generación de la App

### Opción A: Compilación en la Nube con GitHub Actions (Recomendada)
No necesitas tener Android Studio ni Java instalado en tu computadora:
1. Ve a la pestaña **Actions** en tu repositorio de GitHub.
2. Selecciona la ejecución del flujo de trabajo **Build Android TV APK**.
3. Una vez terminada la compilación (aproximadamente 2 minutos), desplázate abajo a **Artifacts** y descarga el archivo comprimido **LaMovieTV-APK**.
4. Descomprímelo para obtener el archivo `app-debug.apk`.

### Opción B: Compilación Local en Android Studio
1. Abre **Android Studio**.
2. Importa o abre este proyecto seleccionando la carpeta raíz.
3. Espera que la sincronización de Gradle finalice.
4. Ve al menú superior y selecciona **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
5. Haz clic en **Locate** en la esquina inferior derecha para obtener el archivo `app-debug.apk`.

---

## 📺 Instalación en tu Smart TV

Una vez que tengas el archivo `app-debug.apk`, puedes instalarlo en tu televisor de dos formas:

### Método 1: Mediante Memoria USB (Pendrive)
1. Copia el archivo `.apk` a un pendrive USB formateado en FAT32.
2. Conecta el pendrive a tu televisor Android TV.
3. En la TV, abre un explorador de archivos (como *File Commander* o *AnExplorer* desde la Play Store).
4. Selecciona el archivo APK e instálalo (deberás conceder permisos para instalar desde orígenes desconocidos si es la primera vez).

### Método 2: Transmisión Inalámbrica (Sin Cables)
1. Descarga la aplicación **Send Files to TV** tanto en tu computadora/teléfono como en tu televisor (disponible gratis en la Google Play Store).
2. Abre la app en ambos dispositivos.
3. En tu PC/móvil selecciona **Send** y elige el archivo `.apk`.
4. En tu TV selecciona **Receive**.
5. Una vez recibido el archivo en la TV, haz clic sobre él para proceder con la instalación.
