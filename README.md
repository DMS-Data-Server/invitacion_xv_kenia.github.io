# Mis XV Valeria — Lilac Dreams

Proyecto completo de invitación digital con tonos lila, lavanda, azul noche y oro champagne.

## Funciones incluidas

- Pantalla inicial para abrir la invitación.
- Música de fondo.
- Portada personalizada.
- Cuenta regresiva.
- Fecha, hora, lugar y código de vestimenta.
- Google Maps.
- Agregar al calendario.
- Galería de 5 fotografías.
- Video.
- Mesa de regalos.
- Confirmación de asistencia.
- Número de acompañantes.
- Confirmación por WhatsApp.
- Libro de firmas digital.
- Integración preparada para Google Apps Script.
- Diseño adaptable a celulares y computadoras.

## Personalización rápida

Edita:

`js/config.js`

Ahí encontrarás:

- Nombre de la quinceañera.
- Fecha y hora.
- Salón y dirección.
- Google Maps.
- WhatsApp.
- Código de vestimenta.
- Mesa de regalos.
- Fotografías.
- Música.
- Video.
- Add-ons visibles.
- URL de Google Apps Script.

## Archivos multimedia

### Música

Agrega:

`assets/audio/music.mp3`

### Video

Agrega:

`assets/video/video.mp4`

### Fotografías

Puedes reemplazar:

- `assets/images/hero.jpg`
- `assets/images/gallery-1.jpg`
- `assets/images/gallery-2.jpg`
- `assets/images/gallery-3.jpg`
- `assets/images/gallery-4.jpg`
- `assets/images/gallery-5.jpg`

## Google Apps Script

En la carpeta `google-apps-script` se incluye:

`Code.gs`

Copia el código al proyecto de Apps Script del cliente `CL_0001`.

Después:

1. Coloca el ID del Google Sheet.
2. Implementa como aplicación web.
3. Copia la URL terminada en `/exec`.
4. Pégala en `js/config.js`, propiedad `appsScriptUrl`.

## GitHub Pages

Sube el contenido completo de la carpeta a la rama que publicarás.

La estructura debe conservarse:

- `index.html`
- `css/`
- `js/`
- `assets/`
