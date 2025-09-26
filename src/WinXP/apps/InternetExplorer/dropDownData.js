export const File = [
  {
    type: 'menu',
    text: 'Nuevo',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    items: [
      {
        type: 'item',
        text: 'Ventana',
        hotkey: 'Ctrl+N',
      },
      { type: 'separator' },
      {
        type: 'item',
        text: 'Mensaje',
      },
      {
        type: 'item',
        text: 'Publicación',
      },
      {
        type: 'item',
        text: 'Contacto',
      },
      {
        type: 'item',
        text: 'Llamada por Internet',
      },
    ],
  },
  {
    type: 'item',
    text: 'Abrir...',
    hotkey: 'Ctrl+O',
  },
  {
    type: 'item',
    text: 'Editar',
    disable: true,
  },
  {
    type: 'item',
    disable: true,
    text: 'Guardar',
    hotkey: 'Ctrl+S',
  },
  {
    type: 'item',
    text: 'Guardar como...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Configurar página...',
  },
  {
    type: 'item',
    text: 'Imprimir...',
    hotkey: 'Ctrl+P',
  },
  {
    type: 'item',
    text: 'Vista previa de impresión...',
  },
  {
    type: 'separator',
  },
  {
    type: 'menu',
    text: 'Enviar',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    items: [
      {
        type: 'item',
        text: 'Página por correo electrónico...',
      },
      {
        type: 'item',
        text: 'Vínculo por correo electrónico...',
      },
      {
        type: 'item',
        text: 'Acceso directo al escritorio',
      },
    ],
  },
  {
    type: 'item',
    text: 'Importar y exportar...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Propiedades',
  },
  {
    type: 'item',
    text: 'Trabajar sin conexión',
  },
  {
    type: 'item',
    text: 'Cerrar',
  },
];

const Edit = [
  {
    type: 'item',
    disable: true,
    text: 'Cortar',
    hotkey: 'Ctrl+X',
  },
  {
    type: 'item',
    disable: true,
    text: 'Copiar',
    hotkey: 'Ctrl+C',
  },
  {
    type: 'item',
    disable: true,
    text: 'Pegar',
    hotkey: 'Ctrl+V',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Seleccionar todo',
    hotkey: 'Ctrl+A',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Buscar (en esta página)...',
    hotkey: 'Ctrl+F',
  },
];

const View = [
  {
    type: 'menu',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: 'Barras de herramientas',
    items: [
      {
        type: 'item',
        symbol: 'check',
        text: 'Botones estándar',
      },
      {
        type: 'item',
        symbol: 'check',
        text: 'Barra de direcciones',
      },
      {
        type: 'item',
        symbol: 'check',
        text: 'Vínculos',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        symbol: 'check',
        text: 'Bloquear las barras de herramientas',
      },
      {
        type: 'item',
        text: 'Personalizar...',
      },
    ],
  },
  {
    type: 'item',
    symbol: 'check',
    text: 'Barra de estado',
  },
  {
    type: 'menu',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: 'Barra del explorador',
    items: [
      {
        type: 'item',
        text: 'Buscar',
        hotkey: 'Ctrl+E',
      },
      {
        type: 'item',
        text: 'Favoritos',
        hotkey: 'Ctrl+I',
      },
      {
        type: 'item',
        text: 'Historial',
        hotkey: 'Ctrl+H',
      },
      {
        type: 'item',
        text: 'Carpetas',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        text: 'Consejo del día',
      },
    ],
  },
  {
    type: 'separator',
  },
  {
    type: 'menu',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: 'Ir a',
    items: [
      {
        type: 'item',
        disable: true,
        text: 'Atrás',
        hotkey: 'Alt+Left Arrow',
      },
      {
        type: 'item',
        disable: true,
        text: 'Adelante',
        hotkey: 'Alt+Right Arrow',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        text: 'Página principal',
        hotkey: 'Alt+Home',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        text: 'No se puede encontrar el servidor',
        symbol: 'check',
      },
    ],
  },
  {
    type: 'item',
    text: 'Detener',
    hotkey: 'Esc',
  },
  {
    type: 'item',
    text: 'Actualizar',
    hotkey: 'F5',
  },
  {
    type: 'separator',
  },
  {
    type: 'menu',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: 'Tamaño del texto',
    items: [
      {
        type: 'item',
        text: 'Más grande',
      },
      {
        type: 'item',
        text: 'Más grande',
      },
      {
        type: 'item',
        text: 'Mediano',
        symbol: 'circle',
      },
      {
        type: 'item',
        text: 'Más pequeño',
      },
      {
        type: 'item',
        text: 'Más pequeño',
      },
    ],
  },
  {
    type: 'menu',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: 'Codificación',
    items: [
      {
        type: 'item',
        text: 'Selección automática',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        text: 'Europeo occidental (Windows)',
        symbol: 'circle',
      },
      {
        type: 'menu',
        position: {
          left: 'calc(100% - 4px)',
          top: '-3px',
        },
        text: 'Más',
        items: [
          {
            type: 'item',
            text: 'Arabic(ASMO 708)',
          },
          {
            type: 'separator',
          },
          {
            type: 'item',
            text: 'Chino tradicional',
          },
        ],
      },
    ],
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Código fuente',
  },
  {
    type: 'item',
    disable: true,
    text: 'Informe de privacidad...',
  },
  {
    type: 'item',
    text: 'Pantalla completa',
    hotkey: 'F11',
  },
];
const Favorites = [
  {
    type: 'item',
    text: 'Agregar a favoritos...',
  },
  {
    type: 'item',
    text: 'Organizar favoritos...',
  },
  {
    type: 'separator',
  },
  {
    type: 'menu',
    symbol: 'folder',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: 'Vínculos',
    items: [
      {
        type: 'item',
        text: 'Personalizar vínculos',
        symbol: 'ie-paper',
      },
      {
        type: 'item',
        text: 'Hotmail gratuito',
        symbol: 'ie-paper',
      },
      {
        type: 'item',
        text: 'Windows',
        symbol: 'ie-paper',
      },
      {
        type: 'item',
        text: 'Marketplace de Windows',
        symbol: 'ie-book',
      },
      {
        type: 'item',
        text: 'Windows Media',
        symbol: 'ie-paper',
      },
    ],
  },
  {
    type: 'item',
    text: 'MSN.com',
    symbol: 'ie-paper',
  },
  {
    type: 'item',
    text: 'Guía de estaciones de radio',
    symbol: 'ie-paper',
  },
];
const Tools = [
  {
    type: 'menu',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: 'Correo y noticias',
    items: [
      {
        type: 'item',
        text: 'Leer correo',
      },

      {
        type: 'item',
        text: 'Nuevo mensaje...',
      },
      {
        type: 'item',
        text: 'Enviar vínculo...',
      },
      {
        type: 'item',
        text: 'Enviar página...',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        text: 'Leer noticias',
      },
    ],
  },
  {
    type: 'menu',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: 'Bloqueador de ventanas emergentes',
    items: [
      {
        type: 'item',
        text: 'Desactivar bloqueador de ventanas emergentes',
      },

      {
        type: 'item',
        text: 'Configuración del bloqueador de ventanas emergentes...',
      },
    ],
  },
  {
    type: 'item',
    text: 'Administrar complementos...',
  },
  {
    type: 'item',
    text: 'Sincronizar...',
  },
  {
    type: 'item',
    text: 'Actualización de Windows',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Windows Messenger',
  },
  {
    type: 'item',
    text: 'Diagnosticar problemas de conexión...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Opciones de Internet...',
  },
];
const Help = [
  {
    type: 'item',
    text: 'Contenido e índice',
  },
  {
    type: 'item',
    text: 'Consejo del día',
  },
  {
    type: 'item',
    text: 'Para usuarios de Netscape',
  },
  {
    type: 'item',
    text: 'Soporte en línea',
  },
  {
    type: 'item',
    text: 'Enviar comentarios',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Acerca de Internet Explorer',
  },
];
export default { 
  'Archivo': File, 
  'Editar': Edit, 
  'Ver': View, 
  'Favoritos': Favorites, 
  'Herramientas': Tools, 
  'Ayuda': Help 
};
