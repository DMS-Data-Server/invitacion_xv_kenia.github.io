/**
 * ============================================================
 * CONFIGURACIÓN GENERAL DEL EVENTO
 * ============================================================
 *
 * Cliente: CL_0001
 * Evento: XV años de Kenia
 *
 * Este es el archivo principal que modificarás para
 * personalizar futuras invitaciones.
 */

window.EVENT_CONFIG = {
    /* ----------------------------------------------------------
       IDENTIFICADORES INTERNOS
    ---------------------------------------------------------- */

    eventoId: "EV_CL_0001",

    cliente: {
        id: "CL_0001",
        nombre: "Eduardo Montalvo"
    },

    /* ----------------------------------------------------------
       INFORMACIÓN DE LA FESTEJADA
    ---------------------------------------------------------- */

    festejada: {
        nombre: "Kenia",
        tipoEvento: "Mis XV Años",

        mensajePortada:
            "Te invito a celebrar este día tan especial",

        mensajePrincipal:
            "Hay momentos en la vida que imaginamos, soñamos y esperamos con ilusión. \nHoy quiero compartir contigo uno de los días más importantes de mi vida."
    },

    /* ----------------------------------------------------------
       INFORMACIÓN DEL EVENTO
    ---------------------------------------------------------- */

    evento: {
        fechaISO: "2026-10-10T19:00:00-06:00",
        fechaTexto: "10 de octubre de 2026",
        diaTexto: "Sábado",
        horaTexto: "7:00 p. m.",

        salon: "FLORESTA EVENTOS",

        direccion:
            "Carretera Reynosa #2200, Hacienda La Trinidad, 67196 Guadalupe, N.L.",

        googleMaps:
            "https://maps.app.goo.gl/u2HesPtq5oKrwJZA8",

        fechaLimiteConfirmacion:
            "3 de octubre de 2026",

        codigoVestimenta: "Formal",

        recomendacionVestimenta:
            "Se agradece evitar tonos lila y lavanda, reservados para la quinceañera."
    },

    /* ----------------------------------------------------------
       CONFIRMACIÓN
    ---------------------------------------------------------- */

    contacto: {
        /**
         * Formato:
         * 52 + número mexicano de 10 dígitos.
         */
        whatsapp: "528184622238",

        mensajeConfirmacion:
            "Hola, confirmo mi asistencia a los XV años de Kenia."
    },

    confirmacion: {
        /**
         * Número máximo permitido en el formulario.
         * Incluye al invitado principal.
         */
        maximoAsistentes: 10
    },

    /* ----------------------------------------------------------
       MESA DE REGALOS
    ---------------------------------------------------------- */

    regalos: [
        {
            nombre: "Liverpool",
            descripcion: "Mesa de regalos del evento",
            enlace: "#"
        },
        {
            nombre: "Lluvia de sobres",
            descripcion:
                "También habrá opción de regalo en efectivo.",
            enlace: ""
        }
    ],

    /* ----------------------------------------------------------
       MULTIMEDIA ALOJADA EN GITHUB
    ---------------------------------------------------------- */

    multimedia: {
        /**
         * Conserva estos nombres para cambiar archivos sin
         * modificar nuevamente el código.
         */
        musica: "assets/audio/music.mp3",
        video: "assets/video/video.mp4",

        fotos: [
            "assets/images/gallery-1.jpg",
            "assets/images/gallery-2.jpg",
            "assets/images/gallery-3.jpg",
            "assets/images/gallery-4.jpg",
            "assets/images/gallery-5.jpg"
        ]
    },

    /* ----------------------------------------------------------
       MODO DEL SISTEMA
    ---------------------------------------------------------- */

    sistema: {
        /**
         * true:
         * Muestra la invitación, pero no guarda formularios.
         *
         * false:
         * Envía confirmaciones y firmas a Apps Script.
         */
        modoDemostracion: true
    },

    /* ----------------------------------------------------------
       MÓDULOS VISIBLES
    ---------------------------------------------------------- */

    addons: {
        mostrarMusica: true,
        mostrarGaleria: true,
        mostrarVideo: true,

        // Deshabilitada para este cliente.
        mostrarMesaRegalos: false,

        /* Adicional: lista almacenada en Google Sheets */
        mostrarConfirmacion: true,

        /* Incluido: confirmación mediante WhatsApp */
        mostrarWhatsapp: true,

        mostrarLibroFirmas: true,
        mostrarAgregarCalendario: true,
        mostrarConfirmacionAcompanantes: true
    },

    /* ----------------------------------------------------------
       API DE GOOGLE APPS SCRIPT
    ---------------------------------------------------------- */

    /**
     * Déjala vacía mientras desarrollas la invitación.
     *
     * Posteriormente colocaremos aquí la URL /exec.
     */
    appsScriptUrl: ""
};