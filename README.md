# COMO UN DISPARO — AISSA ft. NICKZZY
### Experiencia Web Dinámica 3D & Brutalista

Sitio web interactivo y brutalista inspirado en el lanzamiento de *"Como un Disparo"* de **AISSA ft. Nickzzy** (marzo de 2022). Inspirado en el diseño visual y cromático de *La Mudita Burger*, *Silencio.es* y *Artpill.studio*.

---

## ⚡ Características Principales

* **Hero Monumental (Estilo La Mudita):**
  * Tipografía monumental comprimida en fuente *Anton* con insignias superpuestas estilo viñeta (`FT. NICKZZY`, `¡PLA-PLA!`) y sello circular dinámico.
* **Secuencia Balística 3D Cinemática (Three.js WebGL):**
  * **Pistola Táctica:** Integrada en el tercio superior del Hero con paralaje 3D reactivo al cursor.
  * **Detonación y Retroceso:** Al iniciar el scroll, la pistola ejecuta un retroceso mecánico con cabeceo angular, un destello luminoso (*muzzle flash*) y una onda de choque supersónica frontal.
  * **Bala 3D de Alta Precisión:**
    * Ojiva torneada en cromo plateado espejo (*silver chrome*).
    * Anillo sellador de laca roja carmesí táctica.
    * Vaina de latón dorado pulido con ranura de extracción y culote detallado con pistón de percusión.
    * Entorno de reflexión de estudio con línea de horizonte y cajas de luz.
  * **Rotación Exclusiva por Scroll:** El proyectil gira sobre su eje longitudinal en proporción a la velocidad del scroll y se congela instantáneamente al estar inactivo para no interferir en la lectura.
  * **Carril de Telemetría Lateral:** Acompaña el desplazamiento en un corredor derecho reservado con métricas en tiempo real (`VEL // M/S` e indicador de sección).
* **Morfología Cromática de Fondo:**
  * Transición fluida de color entre secciones:
    * `[00] Hero:` Vermellón brillante (`#ff3300`)
    * `[01] Reproductor:` Negro medianoche asfalto (`#0c0d0e`)
    * `[02] Letra:` Crema marfil editorial (`#fff7ef`)
    * `[03] El Tema:` Amarillo ácido brutalista (`#efff04`)
    * `[04] El Artista:` Carbón aterciopelado (`#161413`)
    * `Footer:` Negro puro (`#000000`)
* **Audio & Beat Lab:**
  * Embed oficial de Spotify del tema (*Track ID: 66uet4xls7K2lHSVYblCYw*).
  * Sintetizador procedural con Web Audio API de ritmo Afro-Drill a 108 BPM con bombo afinado, hi-hats y acordes sintetizados.
* **Paleta Tipográfica Curada:**
  * *Anton* (Hero y titulares de impacto)
  * *Unbounded* (Módulo tecnológico de audio y ficha de producción)
  * *Instrument Serif* (Letra y citas líricas)
  * *Space Mono* (Telemetría de estudio y especificaciones técnicas)
  * *Space Grotesk* (Cuerpo de texto moderno)

---

## 🛠️ Tecnologías

* **HTML5 Semántico**
* **CSS3 Moderno** (Variables CSS, transiciones cúbicas, layout adaptativo clamp)
* **JavaScript (ES6+)**
* **Three.js (WebGL r128)**
* **Web Audio API**

---

## 🚀 Instalación y Uso Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Miito456/ComoUnDisparo.git
   cd ComoUnDisparo
   ```

2. Inicia un servidor local (por ejemplo con Python):
   ```bash
   python -m http.server 8000
   ```

3. Abre en tu navegador:
   ```
   http://localhost:8000/
   ```

---

*Diseño y desarrollo dinámico — 2022 / 2026.*
