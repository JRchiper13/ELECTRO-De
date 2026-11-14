/* ============================================================
   ARCHIVO: datos.js
   QUÉ HACE: Aquí está TODA la información de la academia.
   Es la "base de datos" sin base de datos: solo listas.
   Para agregar una lección, copia un bloque { ... } y cambia
   los datos. Para quitar algo, bórralo.

   IMPORTANTE: los videos de ejemplo son de prueba (películas
   libres). Reemplázalos por tus videos de electrónica.
   ============================================================ */

/* ===== 1) CONFIGURACIÓN GENERAL ===== */
const CONFIG = {
  nombre: "Electro Academia",                       // nombre arriba a la izquierda
  lema: "Aprende electrónica viendo cómo se hace",  // título grande de la portada
  texto: "Mira cada proyecto paso a paso, practica a tu ritmo y, si te gusta, compra el kit con todo lo necesario. Tú decides.",
  whatsapp: "59170000000",                          // <-- TU número con código de país, solo números (Bolivia = 591)
  correo: "tucorreo@ejemplo.com",                   // <-- tu correo
  canalUrl: "https://www.youtube.com/",             // <-- link de tu canal de YouTube
  moneda: "Bs",                                     // moneda de los precios
  pie: "© 2026 Electro Academia · Hecho con ganas de enseñar"
};

/* ===== 2) CURSOS =====
   Cada curso tiene lecciones (los videos). Cada lección puede ser:
     tipo: "youtube" -> fuente: "ID_DEL_VIDEO"   (lo más recomendado)
     tipo: "local"   -> fuente: "videos/nombre.mp4"  (archivo en la carpeta videos)

   CÓMO OBTENER EL ID DE UN VIDEO DE YOUTUBE:
   Link:  https://www.youtube.com/watch?v=AQUI_ESTA_EL_ID  -> copia lo que va después de "v="
   Link corto: https://youtu.be/AQUI_ESTA_EL_ID

   "pasos" = la parte de "cómo se hace". El campo t es el minuto:segundo
   del video; al hacer clic, el video salta a ese momento.
*/
const CURSOS = [

  /* ---------- CURSO 1 ---------- */
  {
    id: "electronica-desde-cero",                   // identificador único, sin espacios ni tildes
    titulo: "Electrónica desde cero",
    nivel: "Principiante",                          // Principiante / Intermedio / Avanzado
    categoria: "Fundamentos",
    icono: "💡",                                    // se muestra si no hay imagen
    resumen: "Aprende qué es un circuito y arma tus primeros proyectos con LEDs, resistencias y pulsadores.",
    aprenderas: [
      "Qué son voltaje, corriente y resistencia",
      "Cómo usar una protoboard sin quemar nada",
      "Armar un circuito con LED y pulsador"
    ],
    requisitos: ["Ninguno, solo ganas de aprender"],
    kit: {
      nombre: "Kit Básico de Electrónica",
      precio: 120,
      descripcion: "Protoboard, resistencias, LEDs, pulsadores, cables y portapilas. Todo lo de este curso."
    },
    lecciones: [
      {
        id: "que-es-un-circuito",
        titulo: "¿Qué es un circuito eléctrico?",
        tipo: "youtube",
        fuente: "aqz-KE-bpKQ",                      // <-- EJEMPLO: cambia por tu video
        duracion: "8:30",
        resumen: "Entiende cómo viaja la electricidad y cuáles son las partes de un circuito.",
        pasos: [
          { t: "0:00", texto: "Presentación y qué vamos a construir." },
          { t: "1:20", texto: "Voltaje, corriente y resistencia con la analogía del agua." },
          { t: "4:10", texto: "Partes de un circuito: fuente, cable, carga e interruptor." },
          { t: "6:45", texto: "Primer circuito simple sobre la mesa." }
        ],
        materiales: [
          { nombre: "Portapilas con 2 pilas AA", cantidad: 1, precio: 10 },
          { nombre: "LED rojo 5 mm", cantidad: 2, precio: 2 },
          { nombre: "Cables jumper", cantidad: 6, precio: 6 }
        ]
      },
      {
        id: "led-y-resistencia",
        titulo: "Encender un LED con su resistencia",
        tipo: "youtube",
        fuente: "eRsGyueVLvQ",                      // <-- EJEMPLO
        duracion: "11:05",
        resumen: "Calcula la resistencia correcta y arma el circuito en la protoboard.",
        pasos: [
          { t: "0:00", texto: "Por qué un LED sin resistencia se quema." },
          { t: "2:30", texto: "Calcular la resistencia con la ley de Ohm." },
          { t: "5:15", texto: "Cómo funciona una protoboard por dentro." },
          { t: "7:40", texto: "Armado paso a paso del circuito." },
          { t: "10:10", texto: "Pruebas y errores comunes." }
        ],
        materiales: [
          { nombre: "Protoboard 830 puntos", cantidad: 1, precio: 25 },
          { nombre: "Resistencia 330 Ω", cantidad: 2, precio: 1 },
          { nombre: "LED rojo 5 mm", cantidad: 2, precio: 2 },
          { nombre: "Portapilas con 2 pilas AA", cantidad: 1, precio: 10 }
        ]
      },
      {
        id: "pulsador",
        titulo: "Controlar el LED con un pulsador",
        tipo: "youtube",
        fuente: "jNQXAC9IVRw",                      // <-- EJEMPLO
        duracion: "9:40",
        resumen: "Agrega un pulsador para prender y apagar tu circuito.",
        pasos: [
          { t: "0:00", texto: "Cómo funciona un pulsador por dentro." },
          { t: "3:00", texto: "Conectar el pulsador en serie con el LED." },
          { t: "6:30", texto: "Probar y medir con multímetro." }
        ],
        materiales: [
          { nombre: "Pulsador de 4 patas", cantidad: 1, precio: 2 },
          { nombre: "Multímetro básico", cantidad: 1, precio: 60 }
        ]
      }
      /* EJEMPLO de lección con video guardado en la carpeta "videos":
      ,{
        id: "mi-leccion-local",
        titulo: "Título de la lección",
        tipo: "local",
        fuente: "videos/mi-video.mp4",
        miniatura: "videos/mi-miniatura.jpg",       // opcional
        duracion: "5:00",
        resumen: "Qué se aprende aquí.",
        pasos: [], materiales: []
      }
      */
    ]
  },

  /* ---------- CURSO 2 ---------- */
  {
    id: "arduino-primeros-pasos",
    titulo: "Arduino: tu primer proyecto",
    nivel: "Intermedio",
    categoria: "Microcontroladores",
    icono: "🤖",
    resumen: "Programa una placa Arduino para hacer parpadear luces y leer un sensor de temperatura.",
    aprenderas: [
      "Instalar el programa de Arduino y subir tu primer código",
      "Hacer parpadear un LED con programación",
      "Leer un sensor y mostrar datos en la pantalla"
    ],
    requisitos: ["Haber hecho el curso Electrónica desde cero (o saber usar protoboard)"],
    kit: {
      nombre: "Kit Arduino Inicial",
      precio: 260,
      descripcion: "Placa compatible con Arduino UNO, cable USB, protoboard, sensor de temperatura y componentes."
    },
    lecciones: [
      {
        id: "instalar-arduino",
        titulo: "Instalar Arduino y subir el primer código",
        tipo: "youtube",
        fuente: "aqz-KE-bpKQ",                      // <-- EJEMPLO
        duracion: "12:00",
        resumen: "Instalación, conexión de la placa y el famoso 'Blink'.",
        pasos: [
          { t: "0:00", texto: "Qué es Arduino y para qué sirve." },
          { t: "3:00", texto: "Descargar e instalar el programa." },
          { t: "7:30", texto: "Conectar la placa y elegir el puerto." },
          { t: "9:45", texto: "Subir el código Blink." }
        ],
        materiales: [
          { nombre: "Placa compatible Arduino UNO", cantidad: 1, precio: 90 },
          { nombre: "Cable USB tipo B", cantidad: 1, precio: 15 }
        ]
      },
      {
        id: "sensor-temperatura",
        titulo: "Leer la temperatura con un sensor",
        tipo: "youtube",
        fuente: "eRsGyueVLvQ",                      // <-- EJEMPLO
        duracion: "14:20",
        resumen: "Conecta un sensor y muestra la temperatura en el monitor serial.",
        pasos: [
          { t: "0:00", texto: "Cómo funciona el sensor de temperatura." },
          { t: "3:40", texto: "Conexión a la placa." },
          { t: "7:00", texto: "Escribir el código." },
          { t: "11:30", texto: "Ver los datos en el monitor serial." }
        ],
        materiales: [
          { nombre: "Sensor de temperatura LM35", cantidad: 1, precio: 12 },
          { nombre: "Protoboard 830 puntos", cantidad: 1, precio: 25 },
          { nombre: "Cables jumper", cantidad: 6, precio: 6 }
        ]
      }
    ]
  }
];

/* ===== 3) PRODUCTOS SUELTOS DE LA TIENDA =====
   Además de los kits de cada curso, puedes vender cosas sueltas. */
const PRODUCTOS = [
  { nombre: "Multímetro digital", icono: "📟", precio: 60, descripcion: "Mide voltaje, corriente y resistencia. Imprescindible." },
  { nombre: "Soldador 40 W + estaño", icono: "🔥", precio: 85, descripcion: "Para pasar tus proyectos de la protoboard a una placa fija." },
  { nombre: "Pack de 100 resistencias", icono: "🧩", precio: 25, descripcion: "Valores surtidos de 1/4 W para todos tus proyectos." },
  { nombre: "Pack de 50 LEDs de colores", icono: "🌈", precio: 30, descripcion: "Rojo, verde, azul, amarillo y blanco." }
];

/* ===== 4) PREGUNTAS FRECUENTES (aparecen en la portada) ===== */
const FAQ = [
  { p: "¿Es gratis ver los videos?", r: "Sí. Puedes ver todas las lecciones sin pagar. Si quieres practicar con los mismos materiales, puedes comprar el kit." },
  { p: "¿Cómo se guarda mi avance?", r: "Tu avance se guarda en este mismo navegador y dispositivo. Si borras los datos del navegador o cambias de celular, empezarás de cero." },
  { p: "¿Cómo compro un kit?", r: "Pulsa el botón del kit y se abrirá un WhatsApp con el mensaje ya escrito. Ahí coordinamos pago y entrega." },
  { p: "¿Necesito comprar el kit para aprender?", r: "No. Los materiales de cada lección están listados con precios, así que puedes conseguirlos donde quieras." }
];
