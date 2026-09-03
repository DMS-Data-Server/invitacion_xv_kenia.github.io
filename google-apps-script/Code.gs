/**
 * ============================================================
 * GOOGLE APPS SCRIPT - EJEMPLO DE API
 * ============================================================
 *
 * 1. Crea una hoja de cálculo con las pestañas:
 *    - Confirmaciones
 *    - LibroFirmas
 *
 * 2. Sustituye SPREADSHEET_ID.
 *
 * 3. Implementa como aplicación web:
 *    Ejecutar como: Tú
 *    Acceso: Cualquier usuario
 *
 * 4. Copia la URL /exec en js/config.js:
 *    appsScriptUrl: "TU_URL"
 */

const SPREADSHEET_ID = "PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET";

function doGet() {
  return jsonResponse({
    success: true,
    message: "API StudioICrea activa"
  });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");

    switch (data.accion) {
      case "registrarConfirmacion":
        return registrarConfirmacion(data);

      case "registrarFirma":
        return registrarFirma(data);

      default:
        return jsonResponse({
          success: false,
          message: "Acción no reconocida"
        });
    }
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.message
    });
  }
}

function registrarConfirmacion(data) {
  const sheet = getSheet("Confirmaciones");

  sheet.appendRow([
    new Date(),
    data.eventoId,
    data.clienteId,
    data.invitado,
    data.asiste,
    data.asistentes,
    data.comentarios
  ]);

  return jsonResponse({
    success: true,
    message: "Confirmación registrada"
  });
}

function registrarFirma(data) {
  const sheet = getSheet("LibroFirmas");

  sheet.appendRow([
    new Date(),
    data.eventoId,
    data.clienteId,
    data.nombre,
    data.mensaje
  ]);

  return jsonResponse({
    success: true,
    message: "Firma registrada"
  });
}

function getSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`No existe la hoja: ${sheetName}`);
  }

  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
