/* ============================================================
   ARCHIVO: app.js
   QUÉ HACE: Es el "cerebro" de la página. Toma los datos de
   datos.js y dibuja las pantallas: inicio, lección, tienda y
   progreso. También guarda tu avance en el navegador.
   No necesitas editarlo para agregar videos o productos.
   ============================================================ */

(function () {
  "use strict"; // modo estricto: ayuda a detectar errores

  /* ============================================================
     1) AYUDANTES (herramientas pequeñas que usa todo el código)
     ============================================================ */
  const app = document.getElementById("app");

  /* h(): crea un elemento HTML. Usa textContent (no innerHTML),
     así ningún texto puede meter código raro en la página. */
  function h(etiqueta, props, ...hijos) {
    const el = document.createElement(etiqueta);
    Object.entries(props || {}).forEach(([k, v]) => {
      if (v === false || v === null || v === undefined) return;
      if (k === "class") el.className = v;
      else if (k === "texto") el.textContent = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    });
    hijos.flat().forEach((hijo) => {
      if (hijo === null || hijo === undefined || hijo === false) return;
      el.appendChild(typeof hijo === "object" ? hijo : document.createTextNode(String(hijo)));
    });
    return el;
  }

  const enc = encodeURIComponent;
  const cursoPorId = (id) => CURSOS.find((c) => c.id === id);
  const dinero = (n) => CONFIG.moneda + " " + n;

  /* "8:30" -> 510 segundos */
  function aSegundos(t) {
    const partes = String(t).split(":").map(Number);
    if (partes.some(isNaN)) return 0;
    return partes.reduce((total, n) => total * 60 + n, 0);
  }

  /* Duración total de un curso, ej: "31 min" */
  function duracionTotal(curso) {
    const seg = curso.lecciones.reduce((s, l) => s + aSegundos(l.duracion || "0:00"), 0);
    return Math.max(1, Math.round(seg / 60)) + " min";
  }

  /* Link de WhatsApp con el mensaje ya escrito */
  function linkWhatsapp(mensaje) {
    return "https://wa.me/" + String(CONFIG.whatsapp).replace(/\D/g, "") + "?text=" + enc(mensaje);
  }

  /* Aviso flotante abajo (ej: "Lección completada") */
  function aviso(texto) {
    const el = h("div", { class: "aviso", role: "status", texto });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  /* ============================================================
     2) PROGRESO GUARDADO (sin base de datos: localStorage)
     Se guarda en el navegador de cada persona.
     ============================================================ */
  const CLAVE = "electro-academia-progreso-v1";
  let prog = { hechas: {}, ultima: null, tiempos: {} };

  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) prog = Object.assign(prog, JSON.parse(guardado));
  } catch (e) { /* si el navegador bloquea el guardado, seguimos sin él */ }

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(prog)); } catch (e) { /* sin guardado */ }
  }

  const llave = (curso, lec) => curso.id + "/" + lec.id;
  const hechasDeCurso = (curso) => curso.lecciones.filter((l) => prog.hechas[llave(curso, l)]).length;
  const porcentaje = (curso) => Math.round((hechasDeCurso(curso) / (curso.lecciones.length || 1)) * 100);

  /* ============================================================
     3) PIEZAS REUTILIZABLES (barra de progreso, tarjetas, etc.)
     ============================================================ */
  function barraProgreso(pct) {
    return h("div", { class: "progreso" },
      h("div", { class: "barra-progreso" },
        h("div", { class: "barra-progreso__relleno", style: "width:" + pct + "%" })),
      h("div", { class: "progreso__texto", texto: pct + "% completado" }));
  }

  /* Miniatura de una lección (YouTube la da gratis con el id) */
  function miniaturaLeccion(lec) {
    if (lec.tipo === "youtube") return "https://i.ytimg.com/vi/" + enc(lec.fuente) + "/hqdefault.jpg";
    return lec.miniatura || null;
  }
  const portadaCurso = (c) => c.portada || miniaturaLeccion(c.lecciones[0]);

  function tarjetaCurso(c) {
    const pct = porcentaje(c);
    const img = portadaCurso(c);
    return h("a", { class: "tarjeta-curso", href: "#/curso/" + enc(c.id) },
      h("div", { class: "miniatura" },
        img ? h("img", { src: img, alt: "", loading: "lazy" }) : h("span", { class: "icono-grande", texto: c.icono || "🔌" }),
        h("span", { class: "insignia insignia--nivel", texto: c.nivel }),
        pct === 100 ? h("span", { class: "insignia insignia--ok", texto: "🏅 Completado" }) : null),
      h("div", { class: "tarjeta-curso__cuerpo" },
        h("span", { class: "etiqueta", texto: c.categoria }),
        h("h3", { texto: c.titulo }),
        h("p", { texto: c.resumen }),
        h("div", { class: "meta", texto: c.lecciones.length + " lecciones · " + duracionTotal(c) }),
        barraProgreso(pct)));
  }

  /* Caja de compra del kit de un curso */
  function cajaKit(curso) {
    if (!curso.kit) return null;
    const msg = "Hola, me interesa el \"" + curso.kit.nombre + "\" del curso \"" + curso.titulo + "\". ¿Está disponible?";
    return h("div", { class: "caja caja--compra" },
      h("h3", { texto: "¿Quieres practicar? 🛒" }),
      h("strong", { texto: curso.kit.nombre }),
      h("div", { class: "precio", texto: dinero(curso.kit.precio) }),
      h("p", { texto: curso.kit.descripcion }),
      h("a", { class: "boton boton--compra", href: linkWhatsapp(msg), target: "_blank", rel: "noopener", texto: "Pedir por WhatsApp" }));
  }

  /* ============================================================
     4) PANTALLA: INICIO (catálogo de cursos)
     ============================================================ */
  function vistaInicio() {
    document.title = CONFIG.nombre + " | " + CONFIG.lema;
    const totalLecciones = CURSOS.reduce((s, c) => s + c.lecciones.length, 0);

    /* --- Portada --- */
    const burbujas = h("div", { class: "burbujas", "aria-hidden": "true" },
      Array.from({ length: 14 }, (_, i) => h("span", { class: "burbuja burbuja--" + (i + 1) })));
    const portada = h("section", { class: "portada" },
      burbujas,
      h("div", { class: "contenedor" },
        h("span", { class: "portada__etiqueta", texto: "Aprende · Practica · Decide" }),
        h("h1", { texto: CONFIG.lema }),
        h("p", { class: "portada__texto", texto: CONFIG.texto }),
        h("div", { class: "fila" },
          h("button", { class: "boton boton--principal", type: "button",
            onclick: () => document.getElementById("cursos").scrollIntoView({ behavior: "smooth" }), texto: "Ver cursos" }),
          h("a", { class: "boton boton--secundario", href: "#/tienda", texto: "Ver kits y tienda" }),
          h("a", { class: "boton boton--secundario", href: CONFIG.canalUrl, target: "_blank", rel: "noopener", texto: "Canal de YouTube" })),
        h("ul", { class: "estadisticas" },
          h("li", null, h("strong", { texto: CURSOS.length }), "cursos"),
          h("li", null, h("strong", { texto: totalLecciones }), "lecciones"),
          h("li", null, h("strong", { texto: "100%" }), "gratis de ver"))),
      continuarViendo());

    /* --- Cómo funciona --- */
    const como = h("section", { class: "seccion" },
      h("div", { class: "contenedor" },
        h("h2", { texto: "Cómo funciona" }),
        h("div", { class: "pasos-inicio" },
          pasoInicio("🎬", "1. Mira cómo se hace", "Cada lección muestra el armado paso a paso, con marcas de tiempo."),
          pasoInicio("🔧", "2. Practica a tu ritmo", "Tienes la lista de materiales de cada lección y tu avance se guarda solo."),
          pasoInicio("🛒", "3. Compra si quieres", "Si te animas, pides el kit completo por WhatsApp. Si no, sigues aprendiendo gratis."))));

    /* --- Catálogo con buscador y filtros --- */
    const niveles = ["Todos", ...new Set(CURSOS.map((c) => c.nivel))];
    let nivelActivo = "Todos";
    let texto = "";
    const filtros = h("div", { class: "filtros", role: "group", "aria-label": "Filtrar por nivel" });
    const rejilla = h("div", { class: "rejilla" });
    const vacio = h("p", { class: "vacio", texto: "No encontramos cursos con esa búsqueda.", hidden: true });

    function dibujarCatalogo() {
      filtros.innerHTML = "";
      niveles.forEach((n) => filtros.appendChild(
        h("button", { class: "filtro" + (n === nivelActivo ? " activo" : ""), type: "button", texto: n,
          onclick: () => { nivelActivo = n; dibujarCatalogo(); } })));
      rejilla.innerHTML = "";
      const q = texto.trim().toLowerCase();
      const lista = CURSOS.filter((c) =>
        (nivelActivo === "Todos" || c.nivel === nivelActivo) &&
        (c.titulo + " " + c.resumen + " " + c.categoria).toLowerCase().includes(q));
      lista.forEach((c) => rejilla.appendChild(tarjetaCurso(c)));
      requestAnimationFrame(() => rejilla.querySelectorAll(".tarjeta-curso").forEach((tarjeta) => tarjeta.classList.add("visible")));
      vacio.hidden = lista.length > 0;
    }

    const buscador = h("input", { type: "search", class: "buscador", id: "buscador", placeholder: "Buscar cursos: LED, Arduino, sensores..." });
    buscador.addEventListener("input", () => { texto = buscador.value; dibujarCatalogo(); });
    dibujarCatalogo();

    const catalogo = h("section", { class: "seccion seccion--alterna", id: "cursos" },
      h("div", { class: "contenedor" },
        h("h2", { texto: "Cursos" }),
        h("p", { class: "seccion__sub", texto: "Elige uno y empieza hoy. Tu avance queda guardado." }),
        h("label", { class: "solo-lectores", for: "buscador", texto: "Buscar cursos" }),
        buscador, filtros, rejilla, vacio));

    /* --- Preguntas frecuentes --- */
    const faq = h("section", { class: "seccion" },
      h("div", { class: "contenedor" },
        h("h2", { texto: "Preguntas frecuentes" }),
        FAQ.map((f) => h("details", null, h("summary", { texto: f.p }), h("p", { texto: f.r })))));

    app.append(portada, como, catalogo, faq);
  }

  function pasoInicio(icono, titulo, texto) {
    return h("div", { class: "paso-inicio" }, h("span", { texto: icono }), h("h3", { texto: titulo }), h("p", { texto }));
  }

  /* Tarjeta "Continúa donde quedaste" (si ya viste algo) */
  function continuarViendo() {
    if (!prog.ultima) return null;
    const curso = cursoPorId(prog.ultima.curso);
    const lec = curso && curso.lecciones.find((l) => l.id === prog.ultima.leccion);
    if (!lec) return null;
    return h("div", { class: "contenedor" },
      h("div", { class: "continuar" },
        h("div", null,
          h("small", { texto: "Continúa donde quedaste" }),
          h("h3", { texto: lec.titulo }),
          h("p", { texto: curso.titulo + " · " + porcentaje(curso) + "% completado" })),
        h("a", { class: "boton boton--principal", href: "#/curso/" + enc(curso.id) + "/" + enc(lec.id), texto: "▶ Continuar" })));
  }

  /* ============================================================
     5) PANTALLA: LECCIÓN (video + pasos + materiales)
     ============================================================ */
  function vistaLeccion(cursoId, leccionId) {
    const curso = cursoPorId(cursoId);
    if (!curso) return vistaNoEncontrada();

    let idx = curso.lecciones.findIndex((l) => l.id === leccionId);

    /* Si entran al curso sin lección: los llevamos a la última vista
       o a la primera que falte por completar. */
    if (idx < 0) {
      idx = prog.ultima && prog.ultima.curso === curso.id
        ? curso.lecciones.findIndex((l) => l.id === prog.ultima.leccion) : -1;
      if (idx < 0) idx = curso.lecciones.findIndex((l) => !prog.hechas[llave(curso, l)]);
      if (idx < 0) idx = 0;
      location.replace("#/curso/" + enc(curso.id) + "/" + enc(curso.lecciones[idx].id));
      return; // el cambio de dirección vuelve a dibujar la página
    }

    const lec = curso.lecciones[idx];
    const anterior = curso.lecciones[idx - 1];
    const siguiente = curso.lecciones[idx + 1];
    document.title = lec.titulo + " | " + curso.titulo;

    /* Recordamos dónde va la persona */
    prog.ultima = { curso: curso.id, leccion: lec.id };
    guardar();

    const reproductor = crearReproductor(curso, lec);

    /* --- Botones de acción --- */
    const btnHecha = h("button", { class: "boton boton--secundario btn-hecha", id: "btn-hecha", type: "button",
      onclick: () => marcar(curso, lec, !prog.hechas[llave(curso, lec)]) });

    const acciones = h("div", { class: "acciones" },
      btnHecha,
      anterior ? h("a", { class: "boton boton--secundario", href: "#/curso/" + enc(curso.id) + "/" + enc(anterior.id), texto: "← Anterior" }) : null,
      siguiente
        ? h("a", { class: "boton boton--principal", href: "#/curso/" + enc(curso.id) + "/" + enc(siguiente.id), texto: "Siguiente →" })
        : h("a", { class: "boton boton--compra", href: "#/tienda", texto: "Ver kits y tienda 🛒" }));

    /* --- Pestañas --- */
    const panel = h("div", { class: "panel" });
    const pestanas = h("div", { class: "pestanas", role: "tablist" });
    const nombres = ["Cómo se hace", "Materiales", "Sobre el curso"];
    let activa = 0;

    function mostrarPanel() {
      pestanas.innerHTML = "";
      nombres.forEach((n, i) => pestanas.appendChild(
        h("button", { class: "pestana" + (i === activa ? " activa" : ""), type: "button", role: "tab", texto: n,
          onclick: () => { activa = i; mostrarPanel(); } })));
      panel.innerHTML = "";
      if (activa === 0) panel.appendChild(panelPasos(lec, reproductor));
      if (activa === 1) panel.appendChild(panelMateriales(curso, lec));
      if (activa === 2) panel.appendChild(panelCurso(curso));
    }
    mostrarPanel();

    /* --- Barra lateral: progreso, lista de lecciones y kit --- */
    const lista = h("ol", { class: "lista-lecciones" },
      curso.lecciones.map((l, i) => h("li", null,
        h("a", { href: "#/curso/" + enc(curso.id) + "/" + enc(l.id), "data-llave": llave(curso, l),
            class: (l.id === lec.id ? "actual " : "") + (prog.hechas[llave(curso, l)] ? "hecha" : "") },
          h("span", { class: "marca", texto: "✓" }),
          h("span", null, (i + 1) + ". " + l.titulo, h("small", { texto: l.duracion || "" }))))));

    const cajaProgreso = h("div", { class: "caja" },
      h("h3", { texto: curso.titulo }),
      h("div", { id: "progreso-curso" }),
      lista);

    const lateral = h("aside", { class: "lateral" }, cajaProgreso, cajaKit(curso));

    /* --- Armado final de la pantalla --- */
    app.appendChild(h("div", { class: "contenedor leccion-pagina" },
      h("nav", { class: "migas", "aria-label": "Ruta" },
        h("a", { href: "#/", texto: "Cursos" }), " › ", curso.titulo),
      h("div", { class: "leccion-grid" },
        h("div", null,
          reproductor,
          h("h1", { class: "leccion-titulo", texto: lec.titulo }),
          h("p", { class: "leccion-meta", texto: "Lección " + (idx + 1) + " de " + curso.lecciones.length + " · " + (lec.duracion || "") + " · " + curso.nivel }),
          acciones, pestanas, panel),
        lateral)));

    refrescarProgreso(curso, lec);
  }

  /* Reproductor: YouTube o video local, con función para saltar a un segundo */
  function crearReproductor(curso, lec) {
    const caja = h("div", { class: "reproductor" });
    const k = llave(curso, lec);

    if (lec.tipo === "local") {
      const v = h("video", { controls: true, preload: "metadata", playsinline: true, src: lec.fuente });
      if (lec.miniatura) v.poster = lec.miniatura;
      /* Retoma donde te quedaste */
      v.addEventListener("loadedmetadata", () => {
        const t = prog.tiempos[k];
        if (t && t < v.duration - 5) v.currentTime = t;
      });
      /* Guarda el minuto cada 3 segundos y marca completada al 90% */
      let ultimo = 0;
      v.addEventListener("timeupdate", () => {
        if (Date.now() - ultimo > 3000) { ultimo = Date.now(); prog.tiempos[k] = Math.floor(v.currentTime); guardar(); }
        if (v.duration && v.currentTime / v.duration > 0.9 && !prog.hechas[k]) marcar(curso, lec, true);
      });
      caja.appendChild(v);
      caja.buscar = (s) => { v.currentTime = s; v.play(); };
    } else {
      const f = h("iframe", {
        src: "https://www.youtube-nocookie.com/embed/" + enc(lec.fuente) + "?rel=0&enablejsapi=1",
        title: lec.titulo, loading: "lazy",
        allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen",
        allowfullscreen: true });
      const orden = (fn, args) => f.contentWindow.postMessage(JSON.stringify({ event: "command", func: fn, args: args || [] }), "*");
      caja.appendChild(f);
      caja.buscar = (s) => { orden("seekTo", [s, true]); orden("playVideo"); };
    }
    return caja;
  }

  /* Pestaña "Cómo se hace": pasos con minuto clicable */
  function panelPasos(lec, reproductor) {
    const cont = h("div", null, lec.resumen ? h("p", { class: "aviso-suave", texto: lec.resumen }) : null);
    if (!lec.pasos || !lec.pasos.length) {
      cont.appendChild(h("p", { class: "vacio", texto: "Esta lección todavía no tiene pasos escritos." }));
      return cont;
    }
    cont.appendChild(h("ol", { class: "lista-pasos", style: "margin-top:14px" },
      lec.pasos.map((p) => h("li", null,
        p.t ? h("button", { class: "tiempo", type: "button", title: "Ir a este momento del video", texto: p.t,
          onclick: () => { reproductor.scrollIntoView({ behavior: "smooth", block: "center" }); reproductor.buscar(aSegundos(p.t)); } }) : null,
        h("span", { texto: p.texto })))));
    cont.appendChild(h("p", { class: "aviso-suave", texto: "Toca el minuto para saltar a ese momento del video." }));
    return cont;
  }

  /* Pestaña "Materiales": tabla, total y pedido por WhatsApp */
  function panelMateriales(curso, lec) {
    const mats = lec.materiales || [];
    if (!mats.length) return h("p", { class: "vacio", texto: "Para esta lección no necesitas materiales." });
    const total = mats.reduce((s, m) => s + (m.precio || 0), 0);
    const mensaje = "Hola, quiero estos materiales de la lección \"" + lec.titulo + "\" (" + curso.titulo + "):\n" +
      mats.map((m) => "- " + m.cantidad + " x " + m.nombre).join("\n") + "\n¿Los tienen disponibles?";
    return h("div", null,
      h("table", { class: "tabla-materiales" },
        h("thead", null, h("tr", null, h("th", { texto: "Material" }), h("th", { texto: "Cant." }), h("th", { texto: "Precio ref." }))),
        h("tbody", null, mats.map((m) => h("tr", null,
          h("td", { texto: m.nombre }), h("td", { texto: m.cantidad }), h("td", { texto: m.precio ? dinero(m.precio) : "—" }))))),
      h("p", null, h("strong", { texto: "Total aproximado: " + dinero(total) })),
      h("p", { class: "aviso-suave", texto: "Los precios son de referencia. Puedes conseguir los materiales donde prefieras." }),
      h("div", { class: "acciones", style: "margin-top:14px" },
        h("a", { class: "boton boton--compra", href: linkWhatsapp(mensaje), target: "_blank", rel: "noopener", texto: "Pedir estos materiales por WhatsApp" })));
  }

  /* Pestaña "Sobre el curso" */
  function panelCurso(curso) {
    return h("div", null,
      h("p", { texto: curso.resumen }),
      h("h3", { style: "margin-top:16px", texto: "Lo que aprenderás" }),
      h("ul", { class: "lista-simple" }, (curso.aprenderas || []).map((a) => h("li", { texto: a }))),
      h("h3", { texto: "Requisitos" }),
      h("ul", { class: "lista-simple" }, (curso.requisitos || []).map((r) => h("li", { texto: r }))));
  }

  /* Marca/desmarca una lección y actualiza la pantalla sin recargar el video */
  function marcar(curso, lec, valor) {
    const k = llave(curso, lec);
    if (valor) prog.hechas[k] = true; else delete prog.hechas[k];
    guardar();
    refrescarProgreso(curso, lec);
    if (valor) aviso(porcentaje(curso) === 100 ? "🏅 ¡Completaste el curso!" : "✔ Lección completada");
  }

  function refrescarProgreso(curso, lec) {
    document.querySelectorAll("[data-llave]").forEach((el) => el.classList.toggle("hecha", !!prog.hechas[el.getAttribute("data-llave")]));
    const btn = document.getElementById("btn-hecha");
    if (btn) {
      const hecha = !!prog.hechas[llave(curso, lec)];
      btn.classList.toggle("hecha", hecha);
      btn.textContent = hecha ? "✔ Completada (clic para desmarcar)" : "Marcar como completada";
    }
    const cont = document.getElementById("progreso-curso");
    if (cont) { cont.innerHTML = ""; cont.appendChild(barraProgreso(porcentaje(curso))); }
  }

  /* ============================================================
     6) PANTALLA: TIENDA (kits y productos, compra por WhatsApp)
     ============================================================ */
  function vistaTienda() {
    document.title = "Tienda | " + CONFIG.nombre;

    const kits = CURSOS.filter((c) => c.kit).map((c) => {
      const msg = "Hola, me interesa el \"" + c.kit.nombre + "\" (" + dinero(c.kit.precio) + "). ¿Está disponible?";
      return h("div", { class: "tarjeta-producto" },
        h("span", { class: "icono", texto: c.icono || "📦" }),
        h("span", { class: "etiqueta", texto: "Kit del curso" }),
        h("h3", { texto: c.kit.nombre }),
        h("p", { texto: c.kit.descripcion }),
        h("div", { class: "precio", texto: dinero(c.kit.precio) }),
        h("a", { class: "boton boton--compra", href: linkWhatsapp(msg), target: "_blank", rel: "noopener", texto: "Pedir por WhatsApp" }),
        h("a", { class: "boton boton--secundario boton--chico", href: "#/curso/" + enc(c.id), texto: "Ver el curso" }));
    });

    const sueltos = PRODUCTOS.map((p) => {
      const msg = "Hola, me interesa: " + p.nombre + " (" + dinero(p.precio) + "). ¿Está disponible?";
      return h("div", { class: "tarjeta-producto" },
        h("span", { class: "icono", texto: p.icono || "🔧" }),
        h("h3", { texto: p.nombre }),
        h("p", { texto: p.descripcion }),
        h("div", { class: "precio", texto: dinero(p.precio) }),
        h("a", { class: "boton boton--compra", href: linkWhatsapp(msg), target: "_blank", rel: "noopener", texto: "Lo quiero" }));
    });

    app.appendChild(h("section", { class: "seccion" },
      h("div", { class: "contenedor" },
        h("h2", { texto: "Tienda" }),
        h("p", { class: "seccion__sub", texto: "Todo lo que usamos en los videos. El pago y la entrega se coordinan por WhatsApp." }),
        h("h3", { style: "margin-bottom:14px", texto: "Kits de los cursos" }),
        h("div", { class: "rejilla" }, kits),
        h("h3", { style: "margin:34px 0 14px", texto: "Componentes y herramientas" }),
        h("div", { class: "rejilla" }, sueltos),
        h("p", { class: "aviso-suave", style: "margin-top:24px" }, "¿Otra consulta? Escríbenos a ",
          h("a", { href: "mailto:" + CONFIG.correo, texto: CONFIG.correo }), "."))));
  }

  /* ============================================================
     7) PANTALLA: MI PROGRESO
     ============================================================ */
  function vistaProgreso() {
    document.title = "Mi progreso | " + CONFIG.nombre;
    const totalHechas = CURSOS.reduce((s, c) => s + hechasDeCurso(c), 0);
    const totalLecciones = CURSOS.reduce((s, c) => s + c.lecciones.length, 0);
    const completos = CURSOS.filter((c) => porcentaje(c) === 100).length;

    const filas = CURSOS.map((c) => {
      const sigIdx = c.lecciones.findIndex((l) => !prog.hechas[llave(c, l)]);
      const destino = "#/curso/" + enc(c.id) + (sigIdx >= 0 ? "/" + enc(c.lecciones[sigIdx].id) : "");
      return h("div", { class: "fila-curso" },
        h("div", { class: "info" },
          h("strong", { texto: c.titulo }),
          h("div", { class: "meta", texto: hechasDeCurso(c) + " de " + c.lecciones.length + " lecciones" }),
          barraProgreso(porcentaje(c))),
        h("a", { class: "boton boton--principal boton--chico", href: destino,
          texto: porcentaje(c) === 100 ? "Repasar" : (hechasDeCurso(c) ? "Continuar" : "Empezar") }));
    });

    app.appendChild(h("section", { class: "seccion" },
      h("div", { class: "contenedor" },
        h("h2", { texto: "Mi progreso" }),
        h("p", { class: "seccion__sub", texto: "Se guarda en este navegador y dispositivo." }),
        h("div", { class: "resumen-progreso" },
          h("div", { class: "dato" }, h("strong", { texto: totalHechas + "/" + totalLecciones }), "lecciones completadas"),
          h("div", { class: "dato" }, h("strong", { texto: completos + "/" + CURSOS.length }), "cursos terminados 🏅")),
        filas,
        h("button", { class: "boton boton--secundario boton--chico", type: "button", style: "margin-top:20px",
          texto: "Borrar todo mi avance",
          onclick: () => {
            if (confirm("¿Seguro que quieres borrar todo tu avance?")) {
              prog = { hechas: {}, ultima: null, tiempos: {} };
              guardar(); render();
            }
          } }))));
  }

  /* ============================================================
     8) PANTALLA: NO ENCONTRADA
     ============================================================ */
  function vistaNoEncontrada() {
    document.title = "No encontrado | " + CONFIG.nombre;
    app.appendChild(h("section", { class: "seccion" },
      h("div", { class: "contenedor vacio" },
        h("h2", { texto: "No encontramos esa página" }),
        h("p", { texto: "Puede que el link esté mal escrito." }),
        h("a", { class: "boton boton--principal", href: "#/", texto: "Volver al inicio" }))));
  }

  /* ============================================================
     9) NAVEGACIÓN (router): según el link (#/...) muestra una pantalla
     #/                    -> inicio
     #/curso/ID            -> curso (lleva a la lección que toca)
     #/curso/ID/LECCION    -> lección
     #/tienda              -> tienda
     #/progreso            -> mi progreso
     ============================================================ */
  function activarInteracciones() {
    const items = app.querySelectorAll(".seccion, .tarjeta-curso, .paso-inicio, .dato, .tarjeta-producto, .caja, .fila-curso");
    if ("IntersectionObserver" in window) {
      const observador = new IntersectionObserver((entradas, obs) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visible");
            obs.unobserve(entrada.target);
          }
        });
      }, { threshold: .12 });
      items.forEach((item) => observador.observe(item));
    } else items.forEach((item) => item.classList.add("visible"));

    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      app.querySelectorAll(".boton, .filtro, .pestana").forEach((control) => {
        control.addEventListener("pointermove", (evento) => {
          const caja = control.getBoundingClientRect();
          control.style.setProperty("--luz-x", `${((evento.clientX - caja.left) / caja.width) * 100}%`);
          control.style.setProperty("--luz-y", `${((evento.clientY - caja.top) / caja.height) * 100}%`);
        });
      });
      app.querySelectorAll(".tarjeta-curso, .paso-inicio, .tarjeta-producto").forEach((tarjeta) => {
        tarjeta.addEventListener("pointermove", (evento) => {
          const caja = tarjeta.getBoundingClientRect();
          const x = (evento.clientX - caja.left) / caja.width;
          const y = (evento.clientY - caja.top) / caja.height;
          tarjeta.style.setProperty("--puntero-x", `${x * 100}%`);
          tarjeta.style.setProperty("--puntero-y", `${y * 100}%`);
          tarjeta.style.setProperty("--giro-y", `${(x - .5) * 7}deg`);
          tarjeta.style.setProperty("--giro-x", `${(.5 - y) * 6}deg`);
        });
        tarjeta.addEventListener("pointerleave", () => {
          tarjeta.style.setProperty("--giro-y", "0deg");
          tarjeta.style.setProperty("--giro-x", "0deg");
        });
      });
    }
  }

  function render() {
    const partes = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
    app.innerHTML = "";
    let seccion = "inicio";

    if (!partes.length) vistaInicio();
    else if (partes[0] === "cursos") {
      vistaInicio();
      requestAnimationFrame(() => document.getElementById("cursos")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
    else if (partes[0] === "curso" && partes[1]) { seccion = "inicio"; vistaLeccion(partes[1], partes[2]); }
    else if (partes[0] === "tienda") { seccion = "tienda"; vistaTienda(); }
    else if (partes[0] === "progreso") { seccion = "progreso"; vistaProgreso(); }
    else vistaNoEncontrada();

    /* Resalta el menú de arriba */
    document.querySelectorAll("[data-ruta]").forEach((a) => a.classList.toggle("actual", a.getAttribute("data-ruta") === seccion));
    window.scrollTo(0, 0);
    activarInteracciones();
  }

  /* ============================================================
     10) ARRANQUE
     ============================================================ */
  document.getElementById("logo-nombre").textContent = CONFIG.nombre;
  document.getElementById("pie").appendChild(h("p", null, CONFIG.pie, " · ",
    h("a", { href: CONFIG.canalUrl, target: "_blank", rel: "noopener", texto: "YouTube" })));

  let cuadroScrollPendiente = false;
  window.addEventListener("scroll", () => {
    if (cuadroScrollPendiente) return;
    cuadroScrollPendiente = true;
    requestAnimationFrame(() => {
      const recorrido = document.documentElement.scrollHeight - window.innerHeight;
      const avance = recorrido > 0 ? window.scrollY / recorrido : 0;
      document.documentElement.style.setProperty("--avance-scroll", `${avance * 100}%`);
      cuadroScrollPendiente = false;
    });
  }, { passive: true });
  window.addEventListener("hashchange", render);
  render();
})();
