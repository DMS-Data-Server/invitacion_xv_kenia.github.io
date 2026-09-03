/**
 * ============================================================
 * STUDIOICREA - API PARA INVITACIÓN DIGITAL
 * Proyecto: CL_0001 - Mis XV Kenia
 * ============================================================
 *
 * FUNCIONES PRINCIPALES
 * ------------------------------------------------------------
 * configurarProyecto()
 *   Crea automáticamente un archivo de Google Sheets con:
 *   - Confirmaciones
 *   - LibroFirmas
 *   - Dashboard
 *
 * doGet()
 *   Permite verificar que la Web App esté activa.
 *
 * doPost(e)
 *   Recibe los formularios enviados desde GitHub Pages.
 *
 * IMPORTANTE
 * ------------------------------------------------------------
 * 1. Ejecuta configurarProyecto() una sola vez manualmente.
 * 2. Autoriza los permisos solicitados por Google.
 * 3. Revisa el registro de ejecución para obtener la URL del Sheet.
 * 4. Implementa el proyecto como Aplicación web.
 */


/* ============================================================
   CONFIGURACIÓN DEL PROYECTO
============================================================ */

const PROJECT_CONFIG = Object.freeze({
  eventoId: "EV_CL_0001",
  clienteId: "CL_0001",
  clienteNombre: "Eduardo Montalvo",
  festejadaNombre: "Kenia",

  spreadsheetName:
    "CL_0001 - Mis XV Kenia - Registros",

  sheets: Object.freeze({
    confirmations: "Confirmaciones",
    guestbook: "LibroFirmas",
    dashboard: "Dashboard"
  }),

  modules: Object.freeze({
    confirmations: true,
    guestbook: true
  }),

  limits: Object.freeze({
    maxAttendees: 10,
    maxGuestNameLength: 120,
    maxSignatureNameLength: 80,
    maxSignatureMessageLength: 500
  })
});


/* ============================================================
   CONSTANTES INTERNAS
============================================================ */

const SCRIPT_PROPERTIES = Object.freeze({
  spreadsheetId: "STUDIOICREA_SPREADSHEET_ID"
});

const CONFIRMATION_HEADERS = Object.freeze([
  "Fecha de registro",
  "Evento ID",
  "Cliente ID",
  "Invitado o familia",
  "Asiste",
  "Asistentes",
  "Adultos",
  "Niños"
]);

const GUESTBOOK_HEADERS = Object.freeze([
  "Fecha de registro",
  "Evento ID",
  "Cliente ID",
  "Nombre",
  "Mensaje"
]);


/* ============================================================
   CONFIGURACIÓN AUTOMÁTICA DEL PROYECTO
============================================================ */

/**
 * Crea o repara el Google Sheet utilizado por la invitación.
 *
 * Esta función puede ejecutarse nuevamente sin borrar registros.
 * Si el archivo ya existe, solamente verifica hojas, encabezados,
 * formatos, fórmulas y gráficas.
 *
 * @return {Object} Información del proyecto configurado.
 */
function configurarProyecto() {
  const lock = LockService.getScriptLock();

  lock.waitLock(30000);

  try {
    let spreadsheet = obtenerSpreadsheet_(false);

    /*
     * Si todavía no existe un archivo configurado,
     * crea uno nuevo en Google Drive.
     */
    if (!spreadsheet) {
      spreadsheet = SpreadsheetApp.create(
        PROJECT_CONFIG.spreadsheetName
      );

      PropertiesService
        .getScriptProperties()
        .setProperty(
          SCRIPT_PROPERTIES.spreadsheetId,
          spreadsheet.getId()
        );
    }

    const confirmationsSheet = obtenerOCrearHoja_(
      spreadsheet,
      PROJECT_CONFIG.sheets.confirmations
    );

    const guestbookSheet = obtenerOCrearHoja_(
      spreadsheet,
      PROJECT_CONFIG.sheets.guestbook
    );

    const dashboardSheet = obtenerOCrearHoja_(
      spreadsheet,
      PROJECT_CONFIG.sheets.dashboard
    );

    configurarHojaConfirmaciones_(confirmationsSheet);
    configurarHojaLibroFirmas_(guestbookSheet);
    configurarDashboard_(dashboardSheet);

    eliminarHojaInicialVacia_(spreadsheet);

    SpreadsheetApp.flush();

    const result = {
      success: true,
      message: "Proyecto configurado correctamente.",
      spreadsheetId: spreadsheet.getId(),
      spreadsheetUrl: spreadsheet.getUrl()
    };

    console.log(JSON.stringify(result, null, 2));

    return result;
  } finally {
    lock.releaseLock();
  }
}


/**
 * Devuelve la información del Google Sheet configurado.
 * Útil para recuperar su URL posteriormente.
 *
 * @return {Object}
 */
function obtenerInformacionProyecto() {
  const spreadsheet = obtenerSpreadsheet_(true);

  const result = {
    success: true,
    eventoId: PROJECT_CONFIG.eventoId,
    clienteId: PROJECT_CONFIG.clienteId,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName(),
    spreadsheetUrl: spreadsheet.getUrl()
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/* ============================================================
   ENDPOINTS DE LA APLICACIÓN WEB
============================================================ */

/**
 * Verifica que la API esté publicada y funcionando.
 *
 * Al abrir la URL /exec en el navegador devolverá un JSON.
 *
 * @return {TextOutput}
 */
function doGet() {
  try {
    const spreadsheet = obtenerSpreadsheet_(true);

    return jsonResponse_({
      success: true,
      message: "API StudioICrea activa.",
      eventoId: PROJECT_CONFIG.eventoId,
      clienteId: PROJECT_CONFIG.clienteId,
      spreadsheetName: spreadsheet.getName()
    });
  } catch (error) {
    return jsonResponse_({
      success: false,
      message: error.message
    });
  }
}


/**
 * Recibe solicitudes enviadas desde la invitación.
 *
 * Acciones permitidas:
 * - registrarConfirmacion
 * - registrarFirma
 *
 * @param {Object} e Evento generado por Apps Script.
 * @return {TextOutput}
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("La solicitud no contiene información.");
    }

    const data = JSON.parse(e.postData.contents);

    validarIdentificadores_(data);

    switch (data.accion) {
      case "registrarConfirmacion":
        return jsonResponse_(registrarConfirmacion_(data));

      case "registrarFirma":
        return jsonResponse_(registrarFirma_(data));

      default:
        throw new Error("La acción solicitada no es válida.");
    }
  } catch (error) {
    console.error(error);

    return jsonResponse_({
      success: false,
      message: error.message
    });
  }
}


/* ============================================================
   REGISTRO DE CONFIRMACIONES
============================================================ */

/**
 * Valida y guarda una confirmación de asistencia.
 *
 * Regla principal:
 * asistentes = adultos + niños
 *
 * @param {Object} data Información recibida.
 * @return {Object}
 */
function registrarConfirmacion_(data) {
  if (!PROJECT_CONFIG.modules.confirmations) {
    throw new Error(
      "El módulo de confirmaciones está deshabilitado."
    );
  }

  const confirmation = validarConfirmacion_(data);
  const spreadsheet = obtenerSpreadsheet_(true);
  const sheet = spreadsheet.getSheetByName(
    PROJECT_CONFIG.sheets.confirmations
  );

  if (!sheet) {
    throw new Error(
      "No existe la hoja de Confirmaciones. Ejecuta configurarProyecto()."
    );
  }

  const lock = LockService.getScriptLock();

  lock.waitLock(10000);

  try {
    sheet.appendRow([
      new Date(),
      PROJECT_CONFIG.eventoId,
      PROJECT_CONFIG.clienteId,
      confirmation.guest,
      confirmation.attendance,
      confirmation.attendees,
      confirmation.adults,
      confirmation.children
    ]);

    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  return {
    success: true,
    message: "Confirmación registrada correctamente."
  };
}


/**
 * Valida todos los campos de una confirmación.
 *
 * @param {Object} data
 * @return {Object}
 */
function validarConfirmacion_(data) {
  const guest = limpiarTexto_(
    data.invitado,
    PROJECT_CONFIG.limits.maxGuestNameLength
  );

  if (guest.length < 2) {
    throw new Error(
      "Escribe el nombre del invitado o familia."
    );
  }

  const attendance = normalizarAsistencia_(data.asiste);

  /*
   * Cuando la respuesta es No, las cantidades deben guardarse
   * automáticamente en cero.
   */
  if (attendance === "No") {
    return {
      guest: guest,
      attendance: attendance,
      attendees: 0,
      adults: 0,
      children: 0
    };
  }

  const attendees = convertirEntero_(
    data.asistentes,
    "Asistentes"
  );

  const adults = convertirEntero_(
    data.adultos,
    "Adultos"
  );

  const children = convertirEntero_(
    data.ninos,
    "Niños"
  );

  if (
    attendees < 1 ||
    attendees > PROJECT_CONFIG.limits.maxAttendees
  ) {
    throw new Error(
      "La cantidad de asistentes debe estar entre 1 y " +
      PROJECT_CONFIG.limits.maxAttendees +
      "."
    );
  }

  if (adults < 0 || children < 0) {
    throw new Error(
      "La cantidad de adultos y niños no puede ser negativa."
    );
  }

  if (adults + children !== attendees) {
    throw new Error(
      "Adultos y niños deben sumar el total de asistentes."
    );
  }

  return {
    guest: guest,
    attendance: attendance,
    attendees: attendees,
    adults: adults,
    children: children
  };
}


/* ============================================================
   REGISTRO DEL LIBRO DE FIRMAS
============================================================ */

/**
 * Valida y guarda un mensaje del libro de firmas.
 *
 * @param {Object} data Información recibida.
 * @return {Object}
 */
function registrarFirma_(data) {
  if (!PROJECT_CONFIG.modules.guestbook) {
    throw new Error(
      "El módulo del libro de firmas está deshabilitado."
    );
  }

  const name = limpiarTexto_(
    data.nombre,
    PROJECT_CONFIG.limits.maxSignatureNameLength
  );

  const message = limpiarTexto_(
    data.mensaje,
    PROJECT_CONFIG.limits.maxSignatureMessageLength,
    true
  );

  if (name.length < 2) {
    throw new Error("Escribe tu nombre.");
  }

  if (message.length < 2) {
    throw new Error("Escribe un mensaje para la festejada.");
  }

  const spreadsheet = obtenerSpreadsheet_(true);
  const sheet = spreadsheet.getSheetByName(
    PROJECT_CONFIG.sheets.guestbook
  );

  if (!sheet) {
    throw new Error(
      "No existe la hoja LibroFirmas. Ejecuta configurarProyecto()."
    );
  }

  const lock = LockService.getScriptLock();

  lock.waitLock(10000);

  try {
    sheet.appendRow([
      new Date(),
      PROJECT_CONFIG.eventoId,
      PROJECT_CONFIG.clienteId,
      name,
      message
    ]);

    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  return {
    success: true,
    message: "Mensaje guardado correctamente."
  };
}


/* ============================================================
   CONFIGURACIÓN DE LAS HOJAS
============================================================ */

/**
 * Configura la hoja Confirmaciones.
 * No borra los registros existentes.
 *
 * @param {Sheet} sheet
 */
function configurarHojaConfirmaciones_(sheet) {
  prepararEncabezados_(sheet, CONFIRMATION_HEADERS);

  sheet.setFrozenRows(1);

  sheet.getRange("A:A").setNumberFormat(
    "dd/mm/yyyy hh:mm:ss"
  );

  sheet.getRange("F:H").setNumberFormat("0");

  sheet.setColumnWidth(1, 165);
  sheet.setColumnWidth(2, 125);
  sheet.setColumnWidth(3, 105);
  sheet.setColumnWidth(4, 260);
  sheet.setColumnWidth(5, 95);
  sheet.setColumnWidths(6, 3, 95);

  aplicarFiltro_(sheet, CONFIRMATION_HEADERS.length);

  const attendanceRange = sheet.getRange(
    2,
    5,
    Math.max(sheet.getMaxRows() - 1, 1),
    1
  );

  const rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Sí")
      .setBackground("#D9EAD3")
      .setFontColor("#274E13")
      .setRanges([attendanceRange])
      .build(),

    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("No")
      .setBackground("#F4CCCC")
      .setFontColor("#990000")
      .setRanges([attendanceRange])
      .build()
  ];

  sheet.setConditionalFormatRules(rules);
}


/**
 * Configura la hoja LibroFirmas.
 * No borra los registros existentes.
 *
 * @param {Sheet} sheet
 */
function configurarHojaLibroFirmas_(sheet) {
  prepararEncabezados_(sheet, GUESTBOOK_HEADERS);

  sheet.setFrozenRows(1);

  sheet.getRange("A:A").setNumberFormat(
    "dd/mm/yyyy hh:mm:ss"
  );

  sheet.setColumnWidth(1, 165);
  sheet.setColumnWidth(2, 125);
  sheet.setColumnWidth(3, 105);
  sheet.setColumnWidth(4, 190);
  sheet.setColumnWidth(5, 500);

  sheet.getRange("E:E").setWrap(true);

  aplicarFiltro_(sheet, GUESTBOOK_HEADERS.length);
}


/**
 * Construye el Dashboard con indicadores y gráficas.
 *
 * @param {Sheet} sheet
 */
function configurarDashboard_(sheet) {
  /*
   * El Dashboard se puede reconstruir porque solamente contiene
   * títulos, fórmulas y gráficas; no almacena registros manuales.
   */
  sheet.clear();
  sheet.setConditionalFormatRules([]);

  sheet.getCharts().forEach(function(chart) {
    sheet.removeChart(chart);
  });

  sheet.getRange("A1:H1")
    .merge()
    .setValue("MIS XV KENIA - DASHBOARD")
    .setBackground("#100D24")
    .setFontColor("#F0D79C")
    .setFontFamily("Montserrat")
    .setFontSize(18)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  sheet.setRowHeight(1, 48);

  sheet.getRange("A2:H2")
    .merge()
    .setValue(
      "Cliente: " + PROJECT_CONFIG.clienteNombre +
      "   |   Evento: " + PROJECT_CONFIG.eventoId
    )
    .setBackground("#EDE4FF")
    .setFontColor("#4B3869")
    .setHorizontalAlignment("center");

  const indicators = [
    ["INDICADOR", "TOTAL"],
    ["Respuestas recibidas", "=COUNTA('Confirmaciones'!D2:D)"],
    ["Confirmados", "=COUNTIF('Confirmaciones'!E2:E,\"Sí\")"],
    ["No asistirán", "=COUNTIF('Confirmaciones'!E2:E,\"No\")"],
    ["Total de asistentes", "=SUM('Confirmaciones'!F2:F)"],
    ["Adultos", "=SUM('Confirmaciones'!G2:G)"],
    ["Niños", "=SUM('Confirmaciones'!H2:H)"],
    ["Mensajes recibidos", "=COUNTA('LibroFirmas'!D2:D)"]
  ];

  sheet.getRange(4, 1, indicators.length, 2)
    .setValues(indicators);

  sheet.getRange("A4:B4")
    .setBackground("#7D58C2")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  sheet.getRange("A5:A11")
    .setBackground("#F8F4FF")
    .setFontColor("#4B3869")
    .setFontWeight("bold");

  sheet.getRange("B5:B11")
    .setBackground("#FFFFFF")
    .setFontColor("#7D58C2")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setNumberFormat("0");

  sheet.getRange("A4:B11")
    .setBorder(
      true,
      true,
      true,
      true,
      true,
      true,
      "#DCC9FF",
      SpreadsheetApp.BorderStyle.SOLID
    );

  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 110);
  sheet.setColumnWidths(3, 6, 120);

  const attendanceChart = sheet.newChart()
    .asPieChart()
    .addRange(sheet.getRange("A6:B7"))
    .setPosition(4, 4, 0, 0)
    .setOption("title", "Confirmaciones")
    .setOption("legend", { position: "bottom" })
    .setOption("colors", ["#7D58C2", "#D8B56A"])
    .build();

  sheet.insertChart(attendanceChart);

  const attendeesChart = sheet.newChart()
    .asColumnChart()
    .addRange(sheet.getRange("A9:B10"))
    .setPosition(19, 4, 0, 0)
    .setOption("title", "Distribución de asistentes")
    .setOption("legend", { position: "none" })
    .setOption("colors", ["#B78CFF"])
    .setOption("vAxis", { minValue: 0 })
    .build();

  sheet.insertChart(attendeesChart);

  sheet.setFrozenRows(2);
}


/* ============================================================
   FUNCIONES AUXILIARES DE GOOGLE SHEETS
============================================================ */

/**
 * Obtiene el Spreadsheet configurado.
 *
 * @param {boolean} required Si es true, genera error si no existe.
 * @return {Spreadsheet|null}
 */
function obtenerSpreadsheet_(required) {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty(
    SCRIPT_PROPERTIES.spreadsheetId
  );

  if (!spreadsheetId) {
    if (required) {
      throw new Error(
        "El proyecto no está configurado. Ejecuta configurarProyecto()."
      );
    }

    return null;
  }

  try {
    return SpreadsheetApp.openById(spreadsheetId);
  } catch (error) {
    /*
     * Si el archivo fue eliminado, retira el ID anterior para que
     * configurarProyecto() pueda generar uno nuevo.
     */
    properties.deleteProperty(
      SCRIPT_PROPERTIES.spreadsheetId
    );

    if (required) {
      throw new Error(
        "El Google Sheet configurado ya no existe. " +
        "Ejecuta configurarProyecto() para crear uno nuevo."
      );
    }

    return null;
  }
}


/**
 * Obtiene una hoja existente o crea una nueva.
 *
 * @param {Spreadsheet} spreadsheet
 * @param {string} sheetName
 * @return {Sheet}
 */
function obtenerOCrearHoja_(spreadsheet, sheetName) {
  return spreadsheet.getSheetByName(sheetName) ||
    spreadsheet.insertSheet(sheetName);
}


/**
 * Coloca y formatea los encabezados sin borrar registros.
 *
 * @param {Sheet} sheet
 * @param {Array<string>} headers
 */
function prepararEncabezados_(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setBackground("#100D24")
    .setFontColor("#F0D79C")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  sheet.setRowHeight(1, 36);
}


/**
 * Aplica un filtro nuevo sobre la tabla.
 *
 * @param {Sheet} sheet
 * @param {number} columns Número de columnas de la tabla.
 */
function aplicarFiltro_(sheet, columns) {
  const existingFilter = sheet.getFilter();

  if (existingFilter) {
    existingFilter.remove();
  }

  sheet.getRange(
    1,
    1,
    Math.max(sheet.getMaxRows(), 2),
    columns
  ).createFilter();
}


/**
 * Elimina la hoja inicial vacía creada automáticamente por Google.
 *
 * @param {Spreadsheet} spreadsheet
 */
function eliminarHojaInicialVacia_(spreadsheet) {
  const defaultNames = ["Hoja 1", "Hoja1", "Sheet1"];

  defaultNames.forEach(function(name) {
    const sheet = spreadsheet.getSheetByName(name);

    if (
      sheet &&
      spreadsheet.getSheets().length > 1 &&
      sheet.getLastRow() === 0
    ) {
      spreadsheet.deleteSheet(sheet);
    }
  });
}


/* ============================================================
   FUNCIONES AUXILIARES DE VALIDACIÓN
============================================================ */

/**
 * Verifica que la solicitud pertenezca a este proyecto.
 *
 * @param {Object} data
 */
function validarIdentificadores_(data) {
  if (data.eventoId !== PROJECT_CONFIG.eventoId) {
    throw new Error("El identificador del evento no es válido.");
  }

  if (data.clienteId !== PROJECT_CONFIG.clienteId) {
    throw new Error("El identificador del cliente no es válido.");
  }
}


/**
 * Convierte Sí/No a un valor uniforme.
 *
 * @param {*} value
 * @return {string}
 */
function normalizarAsistencia_(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized === "si") {
    return "Sí";
  }

  if (normalized === "no") {
    return "No";
  }

  throw new Error("Selecciona si asistirás al evento.");
}


/**
 * Convierte un valor a entero y valida su formato.
 *
 * @param {*} value
 * @param {string} fieldName
 * @return {number}
 */
function convertirEntero_(value, fieldName) {
  const number = Number(value);

  if (!Number.isInteger(number)) {
    throw new Error(
      fieldName + " debe contener un número entero."
    );
  }

  return number;
}


/**
 * Limpia texto recibido desde formularios.
 *
 * @param {*} value Texto original.
 * @param {number} maximumLength Longitud máxima.
 * @param {boolean=} preserveLineBreaks Conserva saltos de línea.
 * @return {string}
 */
function limpiarTexto_(
  value,
  maximumLength,
  preserveLineBreaks
) {
  let text = String(value || "");

  /* Elimina caracteres de control peligrosos. */
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

  if (preserveLineBreaks) {
    text = text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } else {
    text = text.replace(/\s+/g, " ").trim();
  }

  if (text.length > maximumLength) {
    throw new Error(
      "El texto supera el máximo permitido de " +
      maximumLength +
      " caracteres."
    );
  }

  /*
   * Evita que Google Sheets interprete el texto del usuario
   * como una fórmula.
   */
  if (/^[=+\-@]/.test(text)) {
    text = "'" + text;
  }

  return text;
}


/**
 * Crea una respuesta JSON para la Web App.
 *
 * @param {Object} data
 * @return {TextOutput}
 */
function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

