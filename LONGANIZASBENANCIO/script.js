  document.getElementById("year").textContent = new Date().getFullYear();
  
/* =========================================================
   SPARKLE TRAIL (GSAP)
   ---------------------------------------------------------
   Objetivo:
   - Cuando el usuario mueve el ratón (o dedo / stylus),
     generamos “partículas” (✨) en la posición del puntero.
   - Cada partícula se anima: sube, se desplaza un poco,
     gira, se hace pequeña y desaparece.
   - Al terminar, se elimina del DOM para no acumular basura.
   ========================================================= */

/* 1) Seleccionamos la capa contenedora donde pondremos partículas.
   Si no existe, el efecto no se ejecuta (evita errores). */
const layer = document.querySelector(".capa-estrellita");

if (layer) {

  /* 2) last guardará el último momento (en ms) en el que creamos
     una partícula. Esto sirve para “limitar” cuántas partículas
     generamos por segundo (throttle). */
  let last = 0;

  /* 3) pointermove:
     - Se dispara con ratón, trackpad, stylus e incluso táctil (según dispositivo).
     - Es más general que mousemove.
     - e (evento) trae coordenadas y mucha info del puntero. */
  window.addEventListener("pointermove", (e) => {

    /* 4) performance.now():
       Devuelve un reloj de alta precisión (milisegundos con decimales).
       Mejor que Date.now() para animaciones/mediciones finas. */
    const now = performance.now();

    /* 5) LIMITADOR (throttle):
       Si han pasado menos de 30ms desde la última partícula, salimos.
       - 30ms ≈ máximo ~33 partículas/segundo
       - Esto protege rendimiento (menos DOM, menos animaciones).
       Puedes probar valores:
       - 16ms (≈60/s) => más denso, más coste
       - 50ms (≈20/s) => más ligero */
    if (now - last < 30) return;
    last = now; // actualizamos “último instante”

    /* 6) Creamos el elemento partícula (div) dinámicamente.
       Esto es la parte que CSS NO puede hacer por sí solo:
       CSS no puede “crear elementos”, JS sí. */
    const s = document.createElement("div");

    /* 7) Le ponemos la clase para que coja los estilos CSS. */
    s.className = "estrellita";

    /* 8) Contenido: un emoji.
       Podrías cambiarlo por:
       - "🔥", "💥", "⭐"
       - o incluso usar SVG/imagen (más avanzado). */
    s.textContent = "✨";

    /* 9) La insertamos dentro del layer.
       A partir de aquí, existe en la página y podemos animarla. */
    layer.appendChild(s);

    /* 10) Posición inicial con gsap.set()
        set() no anima: aplica valores instantáneamente.
        Aquí colocamos la partícula EXACTAMENTE en el puntero. */
    gsap.set(s, {
      /* e.clientX / e.clientY:
         coordenadas en píxeles respecto a la ventana (viewport).
         Perfectas para un contenedor fixed que ocupa toda la pantalla. */
      x: e.clientX,
      y: e.clientY,

      /* empieza un poco visible y con tamaño intermedio */
      scale: 0.8,
      opacity: 1
    });

    /* 11) Animación principal con gsap.to()
        Ahora sí animamos: desde el estado actual hasta el nuevo estado. */
    gsap.to(s, {

      /* y final:
         sube hacia arriba (menos y).
         -50 => sube 50px
         - Math.random()*30 => añade variación (0 a 30px extra)
         Resultado: no todas suben igual => efecto más natural */
      y: e.clientY - 50 - Math.random() * 30,

      /* x final:
         se desplaza un poco a los lados:
         Math.random()*60 -> 0..60
         -30 -> -30..+30 */
      x: e.clientX + (Math.random() * 60 - 30),

      /* rotación final:
         giro aleatorio:
         Math.random()*180 -> 0..180
         -90 -> -90..+90 */
      rotation: Math.random() * 180 - 90,

      /* se hace más pequeña */
      scale: 0.2,

      /* y se desvanece */
      opacity: 0,

      /* duración en segundos */
      duration: 0.8,

      /* ease:
         “power2.out” empieza rápido y termina suave,
         da sensación de “desaceleración” natural. */
      ease: "power2.out",

      /* 12) Limpieza:
         Cuando termine la animación, eliminamos el elemento del DOM.
         Esto es CLAVE:
         si no lo borras, en 1 minuto podrías tener miles de divs
         y la web se vuelve lenta. */
      onComplete: () => s.remove()
    });
  });
}