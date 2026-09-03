/**
 * ============================================================
 * LÓGICA PRINCIPAL DE LA INVITACIÓN
 * ============================================================
 */

const config = window.EVENT_CONFIG;

if (!config) {
  throw new Error("No se encontró window.EVENT_CONFIG. Verifica que config.js cargue antes que app.js.");
}

/* ------------------------------------------------------------
   Utilidades
------------------------------------------------------------ */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value ?? "";
}

function showStatus(selector, message, isError = false) {
  const element = $(selector);
  if (!element) return;

  element.textContent = message;
  element.style.color = isError ? "#FFB6C9" : "#F0D79C";
}

function setVisible(selector, visible) {
  const element = $(selector);
  if (element) element.hidden = !visible;
}

function setButtonLoading(button, loading, loadingText) {
  if (!button) return;

  if (loading) {
    button.dataset.originalText = button.textContent.trim();
    button.textContent = loadingText;
    button.disabled = true;
    return;
  }

  button.textContent = button.dataset.originalText || button.textContent;
  button.disabled = false;
}

/* ------------------------------------------------------------
   Carga de información del evento
------------------------------------------------------------ */
function loadEventData() {
  const name = config.festejada.nombre;

  document.title = `Mis XV ${name} | Lilac Dreams`;

  const metaDescription = $("#metaDescription");
  if (metaDescription) {
    metaDescription.setAttribute(
      "content",
      `Invitación digital de XV años de ${name}`
    );
  }

  [
    "#welcomeName",
    "#heroName",
    "#signatureName",
    "#closingName",
    "#footerName",
    "#guestbookRecipientName"
  ].forEach(selector => setText(selector, name));

  setText("#heroMessage", config.festejada.mensajePortada);
  setText("#mainMessage", config.festejada.mensajePrincipal);

  setText("#eventDateText", config.evento.fechaTexto);
  setText("#eventDayText", config.evento.diaTexto);
  setText("#eventTimeText", config.evento.horaTexto);
  setText("#eventVenue", config.evento.salon);
  setText("#eventAddress", config.evento.direccion);
  setText("#dressCode", config.evento.codigoVestimenta);
  setText("#dressRecommendation", config.evento.recomendacionVestimenta);
  setText("#confirmationDeadline", config.evento.fechaLimiteConfirmacion);

  const mapsButton = $("#mapsButton");
  mapsButton.href = config.evento.googleMaps;

  const whatsappMessage = encodeURIComponent(config.contacto.mensajeConfirmacion);
  $("#whatsappButton").href =
    `https://wa.me/${config.contacto.whatsapp}?text=${whatsappMessage}`;

  const musicEnabled = Boolean(
    config.addons.mostrarMusica && config.multimedia.musica
  );
  setVisible("#musicButton", musicEnabled);

  if (musicEnabled) {
    $("#musicSource").src = config.multimedia.musica;
    $("#backgroundMusic").load();
  } else {
    $("#musicSource").removeAttribute("src");
  }

  const videoEnabled = Boolean(
    config.addons.mostrarVideo && config.multimedia.video
  );
  setVisible("#videoSection", videoEnabled);

  if (videoEnabled) {
    $("#videoSource").src = config.multimedia.video;
    $("#eventVideo").load();
  } else {
    $("#videoSource").removeAttribute("src");
  }

  const galleryEnabled = Boolean(
    config.addons.mostrarGaleria &&
    Array.isArray(config.multimedia.fotos) &&
    config.multimedia.fotos.length
  );
  setVisible("#gallerySection", galleryEnabled);
  if (galleryEnabled) createGallery();

  const giftsEnabled = Boolean(
    config.addons.mostrarMesaRegalos &&
    Array.isArray(config.regalos) &&
    config.regalos.length
  );
  setVisible("#giftsSection", giftsEnabled);
  if (giftsEnabled) createGiftCards();

  setVisible(
    "#confirmationSection",
    config.addons.mostrarConfirmacion
  );

  setVisible(
      "#whatsappSection",
      config.addons.mostrarWhatsapp
  );

  setVisible(
    "#guestbookSection",
    config.addons.mostrarLibroFirmas
  );

  setVisible(
    "#calendarButton",
    config.addons.mostrarAgregarCalendario
  );

  /*
   * El bloque de asistentes inicia oculto.
   * Aparecerá cuando el invitado seleccione "Sí, asistiré".
   */
  $("#companionsGroup").hidden = true;
}

/* ------------------------------------------------------------
   Pantalla de apertura y música
------------------------------------------------------------ */
const music = $("#backgroundMusic");
const musicButton = $("#musicButton");

async function playMusic() {
  if (!config.addons.mostrarMusica || !config.multimedia.musica) return;

  try {
    await music.play();
    musicButton.textContent = "Ⅱ";
    musicButton.setAttribute("aria-label", "Pausar música");
  } catch (error) {
    console.info("La música aún no está disponible o fue bloqueada.", error);
  }
}

function pauseMusic() {
  music.pause();
  musicButton.textContent = "♪";
  musicButton.setAttribute("aria-label", "Reproducir música");
}

$("#openInvitation").addEventListener("click", async () => {
  $("#welcomeScreen").classList.add("hidden");
  await playMusic();
});

musicButton.addEventListener("click", async () => {
  if (music.paused) {
    await playMusic();
  } else {
    pauseMusic();
  }
});

/* ------------------------------------------------------------
   CUENTA REGRESIVA
------------------------------------------------------------ */

/**
 * Actualiza la cuenta regresiva y controla tres estados:
 *
 * 1. Antes del evento:
 *    muestra días, horas, minutos y segundos.
 *
 * 2. Durante las horas del evento:
 *    muestra "Hoy es el gran día".
 *
 * 3. Después del evento:
 *    muestra "Gracias por acompañarnos".
 */
function updateCountdown() {
    const countdown = $(".countdown");

    if (!countdown) return;

    /*
     * Fecha y hora inicial configurada en config.js.
     */
    const eventStart =
        new Date(config.evento.fechaISO).getTime();

    /*
     * Se considera una duración aproximada de 6 horas.
     */
    const eventDuration =
        6 * 60 * 60 * 1000;

    const eventEnd =
        eventStart + eventDuration;

    const currentTime = Date.now();
    const distance = eventStart - currentTime;

    /*
     * ========================================================
     * EVENTO FINALIZADO
     * ========================================================
     */
    if (currentTime > eventEnd) {
        countdown.innerHTML = `
      <article class="countdown-message">
        <strong>GRACIAS</strong>
        <span>POR ACOMPAÑARNOS</span>
      </article>
    `;

        return;
    }

    /*
     * ========================================================
     * EVENTO EN CURSO
     * ========================================================
     */
    if (distance <= 0) {
        countdown.innerHTML = `
      <article class="countdown-message">
        <strong>HOY</strong>
        <span>ES EL GRAN DÍA</span>
      </article>
    `;

        return;
    }

    /*
     * ========================================================
     * CUENTA REGRESIVA NORMAL
     * ========================================================
     */
    const days =
        Math.floor(distance / 86400000);

    const hours =
        Math.floor((distance / 3600000) % 24);

    const minutes =
        Math.floor((distance / 60000) % 60);

    const seconds =
        Math.floor((distance / 1000) % 60);

    setText(
        "#days",
        String(days).padStart(2, "0")
    );

    setText(
        "#hours",
        String(hours).padStart(2, "0")
    );

    setText(
        "#minutes",
        String(minutes).padStart(2, "0")
    );

    setText(
        "#seconds",
        String(seconds).padStart(2, "0")
    );
}

/* ------------------------------------------------------------
   GALERÍA AUTOMÁTICA
------------------------------------------------------------ */

/*
 * Posición de la fotografía que se muestra actualmente.
 */
let currentGalleryImage = 0;

/*
 * Temporizador utilizado para cambiar automáticamente
 * las fotografías.
 */
let galleryInterval = null;

/*
 * Tiempo que permanecerá cada fotografía en pantalla.
 *
 * 5000 milisegundos = 5 segundos.
 */
const GALLERY_INTERVAL_TIME = 5000;


/**
 * Crea:
 *
 * 1. Una fotografía principal que cambia automáticamente.
 * 2. Todas las fotografías dentro del modal.
 */
function createGallery() {
    const galleryGrid = $("#galleryGrid");
    const modalGallery = $("#modalGallery");
    const photos = config.multimedia.fotos || [];

    if (!galleryGrid || !modalGallery) return;

    /*
     * Limpia contenido anterior para evitar duplicados.
     */
    galleryGrid.innerHTML = "";
    modalGallery.innerHTML = "";

    /*
     * Si no existen fotografías configuradas,
     * oculta completamente la sección.
     */
    if (photos.length === 0) {
        setVisible("#gallerySection", false);
        return;
    }

    /*
     * ========================================================
     * FOTOGRAFÍA PRINCIPAL
     * Solo se crea una imagen en la pantalla.
     * Su contenido cambiará automáticamente.
     * ========================================================
     */
    const figure = document.createElement("figure");

    figure.className = "gallery-item gallery-featured";
    figure.setAttribute(
        "aria-label",
        "Abrir galería completa"
    );

    const featuredImage = document.createElement("img");

    featuredImage.id = "featuredGalleryImage";
    featuredImage.src = photos[0];
    featuredImage.alt =
        `Fotografía 1 de ${config.festejada.nombre}`;

    /*
     * La primera fotografía se carga inmediatamente.
     */
    featuredImage.loading = "eager";

    figure.appendChild(featuredImage);
    galleryGrid.appendChild(figure);

    /*
     * Al presionar la fotografía se abre el modal completo.
     */
    figure.addEventListener("click", openGallery);

    /*
     * ========================================================
     * GALERÍA COMPLETA DEL MODAL
     * Aquí sí se agregan todas las fotografías.
     * ========================================================
     */
    photos.forEach((src, index) => {
        const modalImage = document.createElement("img");

        modalImage.src = src;
        modalImage.alt =
            `Fotografía ${index + 1} de ${config.festejada.nombre}`;

        modalImage.loading = "lazy";

        modalGallery.appendChild(modalImage);
    });

    /*
     * Inicia el cambio automático solamente cuando
     * existen dos o más fotografías.
     */
    if (photos.length > 1) {
        startAutomaticGallery();
    }
}


/**
 * Cambia la fotografía principal por la siguiente.
 */
function showNextGalleryImage() {
    const featuredImage = $("#featuredGalleryImage");
    const photos = config.multimedia.fotos || [];

    if (!featuredImage || photos.length <= 1) return;

    /*
     * Calcula la siguiente posición.
     *
     * Cuando llega a la última fotografía,
     * regresa automáticamente a la primera.
     */
    currentGalleryImage =
        (currentGalleryImage + 1) % photos.length;

    /*
     * Inicia la transición ocultando suavemente
     * la fotografía actual.
     */
    featuredImage.classList.add("changing");

    /*
     * Espera a que avance la transición antes
     * de reemplazar la imagen.
     */
    window.setTimeout(() => {
        featuredImage.src = photos[currentGalleryImage];

        featuredImage.alt =
            `Fotografía ${currentGalleryImage + 1} de ` +
            config.festejada.nombre;

        /*
         * Cuando la nueva fotografía termina de cargar,
         * vuelve a mostrarla.
         */
        featuredImage.onload = () => {
            featuredImage.classList.remove("changing");
        };
    }, 350);
}


/**
 * Inicia el cambio automático de fotografías.
 */
function startAutomaticGallery() {
    /*
     * Elimina un temporizador anterior, en caso
     * de que la función se ejecute nuevamente.
     */
    stopAutomaticGallery();

    galleryInterval = window.setInterval(
        showNextGalleryImage,
        GALLERY_INTERVAL_TIME
    );
}


/**
 * Detiene temporalmente el cambio automático.
 */
function stopAutomaticGallery() {
    if (!galleryInterval) return;

    window.clearInterval(galleryInterval);
    galleryInterval = null;
}


/**
 * Abre el modal con todas las fotografías.
 */
function openGallery() {
    $("#galleryModal").classList.add("open");

    $("#galleryModal").setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow = "hidden";

    /*
     * Detiene el carrusel mientras el usuario
     * está viendo la galería completa.
     */
    stopAutomaticGallery();
}


/**
 * Cierra el modal.
 */
function closeGallery() {
    $("#galleryModal").classList.remove("open");

    $("#galleryModal").setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow = "";

    /*
     * Reactiva el carrusel después de cerrar
     * la galería completa.
     */
    if ((config.multimedia.fotos || []).length > 1) {
        startAutomaticGallery();
    }
}


/*
 * Abre el modal desde el botón.
 */
$("#openGallery").addEventListener(
    "click",
    openGallery
);


/*
 * Cierra el modal desde el botón X.
 */
$("#closeGallery").addEventListener(
    "click",
    closeGallery
);


/*
 * También permite cerrar el modal presionando
 * sobre el fondo oscuro.
 */
$("#galleryModal").addEventListener(
    "click",
    (event) => {
        if (event.target.id === "galleryModal") {
            closeGallery();
        }
    }
);


/*
 * Permite cerrar la galería con la tecla Escape.
 */
document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        $("#galleryModal").classList.contains("open")
    ) {
        closeGallery();
    }
});


/*
 * Detiene el cambio de fotografías cuando el usuario
 * cambia de pestaña y lo reactiva cuando regresa.
 */
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        stopAutomaticGallery();
        return;
    }

    const modalIsOpen =
        $("#galleryModal").classList.contains("open");

    if (
        !modalIsOpen &&
        (config.multimedia.fotos || []).length > 1
    ) {
        startAutomaticGallery();
    }
});

/* ------------------------------------------------------------
   Mesa de regalos
------------------------------------------------------------ */
function createGiftCards() {
  const container = $("#giftsGrid");
  container.innerHTML = "";

  config.regalos.forEach((gift) => {
    const article = document.createElement("article");
    article.className = "gift-card";

    const title = document.createElement("h3");
    title.textContent = gift.nombre;

    const description = document.createElement("p");
    description.textContent = gift.descripcion;

    article.append(title, description);

    if (gift.enlace) {
      const link = document.createElement("a");
      link.className = "button button-outline";
      link.href = gift.enlace;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Ver información";
      article.appendChild(link);
    }

    container.appendChild(article);
  });
}

/* ------------------------------------------------------------
   Agregar evento al calendario
------------------------------------------------------------ */
function formatCalendarDate(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

$("#calendarButton").addEventListener("click", () => {
  const start = new Date(config.evento.fechaISO);
  const end = new Date(start.getTime() + 5 * 60 * 60 * 1000);

  const calendarUrl = new URL("https://calendar.google.com/calendar/render");
  calendarUrl.searchParams.set("action", "TEMPLATE");
  calendarUrl.searchParams.set(
    "text",
    `${config.festejada.tipoEvento} de ${config.festejada.nombre}`
  );
  calendarUrl.searchParams.set(
    "dates",
    `${formatCalendarDate(start)}/${formatCalendarDate(end)}`
  );
  calendarUrl.searchParams.set("location", config.evento.direccion);
  calendarUrl.searchParams.set(
    "details",
    config.festejada.mensajePortada
  );

  window.open(calendarUrl.toString(), "_blank", "noopener");
});

/* ------------------------------------------------------------
   Envío genérico hacia Apps Script
------------------------------------------------------------ */
async function sendToAppsScript(payload) {
  if (config.sistema.modoDemostracion || !config.appsScriptUrl) {
    return {
      success: true,
      demo: true,
      message: "Modo demostración: la información no se guardó en Google Sheets."
    };
  }

  const response = await fetch(config.appsScriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}`);
  }

  const result = await response.json();

  if (!result || result.success !== true) {
    throw new Error(
      result?.message || "Apps Script no confirmó que el registro fuera guardado."
    );
  }

  return result;
}

/* ------------------------------------------------------------
   FORMULARIO DE CONFIRMACIÓN
------------------------------------------------------------ */

/**
 * Crea las opciones del campo "Asistentes".
 *
 * El máximo se toma desde config.js:
 * config.confirmacion.maximoAsistentes
 */
function createAttendeesOptions() {
    const companionsSelect = $("#companions");

    /*
     * Si no existe el campo, detenemos la función.
     * Esto evita errores si posteriormente se desactiva el módulo.
     */
    if (!companionsSelect) return;

    /*
     * Obtiene el máximo configurado.
     * Si no encuentra la configuración, utilizará 10.
     */
    const maximumAttendees =
        Number(config.confirmacion?.maximoAsistentes) || 10;

    companionsSelect.innerHTML = "";

    /*
     * Genera las opciones:
     * 1 asistente
     * 2 asistentes
     * 3 asistentes
     * etc.
     */
    for (
        let quantity = 1;
        quantity <= maximumAttendees;
        quantity++
    ) {
        const option = document.createElement("option");

        option.value = String(quantity);

        option.textContent =
            quantity === 1
                ? "1 asistente"
                : `${quantity} asistentes`;

        companionsSelect.appendChild(option);
    }

    /*
     * Valor inicial del formulario:
     * 1 asistente = 1 adulto y 0 niños.
     */
    companionsSelect.value = "1";

    createDistributionOptions(1);
}


/**
 * Genera las opciones de Adultos y Niños según
 * el total de asistentes seleccionado.
 *
 * Ejemplo:
 * Si el invitado selecciona 4 asistentes,
 * podrá distribuirlos como:
 *
 * 4 adultos y 0 niños
 * 3 adultos y 1 niño
 * 2 adultos y 2 niños
 * 1 adulto  y 3 niños
 * 0 adultos y 4 niños
 */
function createDistributionOptions(totalAttendees) {
    const adultsSelect = $("#adults");
    const childrenSelect = $("#children");

    if (!adultsSelect || !childrenSelect) return;

    adultsSelect.innerHTML = "";
    childrenSelect.innerHTML = "";

    /*
     * Genera las opciones de adultos desde cero
     * hasta el total de asistentes.
     */
    for (
        let quantity = 0;
        quantity <= totalAttendees;
        quantity++
    ) {
        /* Opción para Adultos */
        const adultsOption = document.createElement("option");

        adultsOption.value = String(quantity);

        adultsOption.textContent =
            quantity === 1
                ? "1 adulto"
                : `${quantity} adultos`;

        adultsSelect.appendChild(adultsOption);

        /* Opción para Niños */
        const childrenOption = document.createElement("option");

        childrenOption.value = String(quantity);

        childrenOption.textContent =
            quantity === 1
                ? "1 niño"
                : `${quantity} niños`;

        childrenSelect.appendChild(childrenOption);
    }

    /*
     * De manera predeterminada, todos los asistentes
     * se consideran adultos.
     *
     * Ejemplo:
     * 4 asistentes = 4 adultos y 0 niños.
     */
    adultsSelect.value = String(totalAttendees);
    childrenSelect.value = "0";

    updateAttendeesSummary();
}


/**
 * Cuando el usuario cambia la cantidad de adultos,
 * calcula automáticamente la cantidad de niños.
 *
 * Fórmula:
 * Niños = Asistentes - Adultos
 */
function synchronizeFromAdults() {
    const totalAttendees =
        Number($("#companions").value || 1);

    const adultsQuantity =
        Number($("#adults").value || 0);

    const childrenQuantity =
        totalAttendees - adultsQuantity;

    $("#children").value = String(childrenQuantity);

    updateAttendeesSummary();
}


/**
 * Cuando el usuario cambia la cantidad de niños,
 * calcula automáticamente la cantidad de adultos.
 *
 * Fórmula:
 * Adultos = Asistentes - Niños
 */
function synchronizeFromChildren() {
    const totalAttendees =
        Number($("#companions").value || 1);

    const childrenQuantity =
        Number($("#children").value || 0);

    const adultsQuantity =
        totalAttendees - childrenQuantity;

    $("#adults").value = String(adultsQuantity);

    updateAttendeesSummary();
}


/**
 * Actualiza el resumen mostrado debajo de los selectores.
 *
 * Ejemplo:
 * 4 asistentes: 2 adultos y 2 niños.
 */
function updateAttendeesSummary() {
    const totalAttendees =
        Number($("#companions").value || 1);

    const adultsQuantity =
        Number($("#adults").value || 0);

    const childrenQuantity =
        Number($("#children").value || 0);

    const attendeesText =
        totalAttendees === 1
            ? "1 asistente"
            : `${totalAttendees} asistentes`;

    const adultsText =
        adultsQuantity === 1
            ? "1 adulto"
            : `${adultsQuantity} adultos`;

    const childrenText =
        childrenQuantity === 1
            ? "1 niño"
            : `${childrenQuantity} niños`;

    setText(
        "#attendeesSummary",
        `${attendeesText}: ${adultsText} y ${childrenText}.`
    );
}


/**
 * Muestra u oculta los campos de asistentes.
 *
 * Solo se muestran cuando:
 * 1. El invitado selecciona "Sí".
 * 2. El módulo de acompañantes está habilitado.
 */
$("#attendance").addEventListener("change", (event) => {
    const attending = event.target.value === "Sí";

    const showAttendees =
        attending &&
        config.addons.mostrarConfirmacionAcompanantes;

    $("#companionsGroup").hidden = !showAttendees;

    /*
     * Si selecciona que no asistirá,
     * reinicia las cantidades.
     */
    if (!attending) {
        $("#companions").value = "1";
        createDistributionOptions(1);
    }
});


/**
 * Al cambiar el total de asistentes,
 * regenera las cantidades de Adultos y Niños.
 */
$("#companions").addEventListener("change", (event) => {
    const totalAttendees =
        Number(event.target.value || 1);

    createDistributionOptions(totalAttendees);
});


/**
 * Al cambiar Adultos, actualiza Niños.
 */
$("#adults").addEventListener(
    "change",
    synchronizeFromAdults
);


/**
 * Al cambiar Niños, actualiza Adultos.
 */
$("#children").addEventListener(
    "change",
    synchronizeFromChildren
);


/**
 * Envía la confirmación de asistencia.
 */
$("#rsvpForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const attendance = $("#attendance").value;
    const willAttend = attendance === "Sí";

    /*
     * Si la persona selecciona que no asistirá,
     * se guardarán cero asistentes, adultos y niños.
     */
    const payload = {
        accion: "registrarConfirmacion",

        eventoId: config.eventoId,
        clienteId: config.cliente.id,

        invitado: $("#guestName").value.trim(),
        asiste: attendance,

        asistentes: willAttend
            ? Number($("#companions").value || 1)
            : 0,

        adultos: willAttend
            ? Number($("#adults").value || 0)
            : 0,

        ninos: willAttend
            ? Number($("#children").value || 0)
            : 0,

        fechaRegistro: new Date().toISOString()
    };

    /*
     * Validación adicional.
     * Adultos + niños siempre debe ser igual
     * al número total de asistentes.
     */
    if (
        willAttend &&
        payload.adultos + payload.ninos !== payload.asistentes
    ) {
        showStatus(
            "#rsvpStatus",
            "La cantidad de adultos y niños no coincide con el total de asistentes.",
            true
        );

        return;
    }

    try {
        showStatus(
            "#rsvpStatus",
            "Enviando confirmación..."
        );

        const result = await sendToAppsScript(payload);

        showStatus(
            "#rsvpStatus",
            result.demo
                ? "Confirmación preparada correctamente. Actualmente está en modo demostración."
                : "¡Gracias! Tu confirmación fue registrada."
        );

        /*
         * Limpia el formulario después de enviarlo.
         */
        $("#rsvpForm").reset();

        /*
         * Oculta nuevamente los campos de asistentes
         * hasta que se vuelva a seleccionar "Sí".
         */
        $("#companionsGroup").hidden = true;

        /*
         * Restablece la distribución inicial.
         */
        $("#companions").value = "1";
        createDistributionOptions(1);

    } catch (error) {
        console.error(error);

        showStatus(
            "#rsvpStatus",
            "No fue posible registrar la confirmación. Intenta nuevamente.",
            true
        );
    }
});

/* ------------------------------------------------------------
   Libro de firmas
------------------------------------------------------------ */
$("#guestbookForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = $("#guestbookSubmitButton");

  const payload = {
    accion: "registrarFirma",
    eventoId: config.eventoId,
    clienteId: config.cliente.id,
    nombre: $("#signatureGuestName").value.trim(),
    mensaje: $("#signatureMessage").value.trim(),
    fechaRegistro: new Date().toISOString()
  };

  try {
    setButtonLoading(submitButton, true, "Enviando...");
    showStatus("#guestbookStatus", "Guardando tu mensaje...");
    const result = await sendToAppsScript(payload);

    showStatus(
      "#guestbookStatus",
      result.demo
        ? "Mensaje preparado correctamente. Actualmente está en modo demostración."
        : "Tu mensaje fue guardado. ¡Muchas gracias!"
    );

    $("#guestbookForm").reset();
  } catch (error) {
    console.error(error);
    showStatus(
      "#guestbookStatus",
      "No fue posible guardar tu mensaje. Intenta nuevamente.",
      true
    );
  } finally {
    setButtonLoading(submitButton, false);
  }
});

/* ------------------------------------------------------------
   Animaciones al hacer scroll
------------------------------------------------------------ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.14 }
);

$$(".reveal").forEach((element) => revealObserver.observe(element));

/* ------------------------------------------------------------
   Inicio de la aplicación
------------------------------------------------------------ */
loadEventData();

/*
 * Genera las opciones de los selectores:
 * Asistentes, Adultos y Niños.
 */
createAttendeesOptions();

updateCountdown();
setInterval(updateCountdown, 1000);
