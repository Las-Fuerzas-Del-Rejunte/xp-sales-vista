export const File = [
  {
    type: 'item',
    text: 'Crear acceso directo',
    disable: true,
  },
  {
    type: 'item',
    text: 'Eliminar',
    disable: true,
  },
  {
    type: 'item',
    text: 'Cambiar nombre',
    disable: true,
  },
  {
    type: 'item',
    disable: true,
    text: 'Propiedades',
  },
  {
    type: 'separator',
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
    text: 'Deshacer',
    hotkey: 'Ctrl+Z',
  },
  {
    type: 'separator',
  },
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
    type: 'item',
    disable: true,
    text: 'Pegar acceso directo',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Copiar a carpeta...',
    disable: true,
  },
  {
    type: 'item',
    text: 'Mover a carpeta...',
    disable: true,
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
    type: 'item',
    text: 'Invertir selección',
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
    type: 'item',
    text: 'Thumbnails',
  },
  {
    type: 'item',
    text: 'Tiles',
    symbol: 'circle',
  },
  {
    type: 'item',
    text: 'Icons',
  },
  {
    type: 'item',
    text: 'List',
  },
  {
    type: 'item',
    text: 'Details',
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
    text: 'Arrange Icons by',
    items: [
      {
        type: 'item',
        text: 'Name',
      },
      {
        type: 'item',
        text: 'Type',
        symbol: 'circle',
      },
      {
        type: 'item',
        text: 'Total Size',
      },
      {
        type: 'item',
        text: 'Free Space',
      },
      {
        type: 'item',
        text: 'Comments',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        text: 'Show in Groups',
        symbol: 'check',
      },
      {
        type: 'item',
        text: 'Auto Arrange',
      },
      {
        type: 'item',
        text: 'Align to Grid',
      },
    ],
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Choose Details...',
  },
  {
    type: 'menu',
    position: {
      left: 'calc(100% - 4px)',
      top: '-3px',
    },
    text: 'Go to',
    items: [
      {
        type: 'item',
        disable: true,
        text: 'Back',
        hotkey: 'Alt+Left Arrow',
      },
      {
        type: 'item',
        disable: true,
        text: 'Forward',
        hotkey: 'Alt+Right Arrow',
      },
      {
        type: 'item',
        text: 'Up One Level',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        text: 'Home Page',
        hotkey: 'Alt+Home',
      },
      {
        type: 'separator',
      },
      {
        type: 'item',
        text: 'Abstract Computer',
        symbol: 'check',
      },
    ],
  },
  {
    type: 'item',
    text: 'Refresh',
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
    text: 'Links',
    items: [
      {
        type: 'item',
        text: 'Customize Links',
        symbol: 'ie-paper',
      },
      {
        type: 'item',
        text: 'Free Hotmail',
        symbol: 'ie-paper',
      },
      {
        type: 'item',
        text: 'Windows',
        symbol: 'ie-paper',
      },
      {
        type: 'item',
        text: 'Windows Marketplace',
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
    text: 'Radio Station Guide',
    symbol: 'ie-paper',
  },
];
const Tools = [
  {
    type: 'item',
    text: 'Conectar unidad de red...',
  },
  {
    type: 'item',
    text: 'Desconectar unidad de red...',
  },
  {
    type: 'item',
    text: 'Sincronizar...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Opciones de carpeta...',
  },
];
const Help = [
  {
    type: 'item',
    text: 'Centro de ayuda y soporte técnico',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: '¿Es legal esta copia de Windows?',
  },
  {
    type: 'item',
    text: 'Acerca de Windows',
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
