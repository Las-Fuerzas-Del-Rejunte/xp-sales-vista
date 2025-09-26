const File = [
  {
    type: 'item',
    disable: true,
    text: 'Nuevo',
  },
  {
    type: 'item',
    disable: true,
    text: 'Abrir...',
  },
  {
    type: 'item',
    disable: true,
    text: 'Guardar',
  },
  {
    type: 'item',
    disable: true,
    text: 'Guardar como...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    disable: true,
    text: 'Page Setup...',
  },
  {
    type: 'item',
    disable: true,
    text: 'Print...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Exit',
  },
];
const Edit = [
  {
    type: 'item',
    disable: true,
    text: 'Undo...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    disable: true,
    text: 'Cut',
  },
  {
    type: 'item',
    disable: true,
    text: 'Copy',
  },
  {
    type: 'item',
    disable: true,
    text: 'Paste',
  },
  {
    type: 'item',
    disable: true,
    text: 'Delete',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    disable: true,
    text: 'Find...',
  },
  {
    type: 'item',
    disable: true,
    text: 'Find Next',
  },
  {
    type: 'item',
    disable: true,
    text: 'Replace...',
  },
  {
    type: 'item',
    disable: true,
    text: 'Go To...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    disable: true,
    text: 'Select All',
  },
  {
    type: 'item',
    text: 'Time/Date',
  },
];
const Format = [
  {
    type: 'item',
    text: 'Word Wrap',
  },
  {
    type: 'item',
    disable: true,
    text: 'Font...',
  },
];
const View = [
  {
    type: 'item',
    disable: true,
    text: 'Status Bar',
  },
];
const Help = [
  {
    type: 'item',
    disable: true,
    text: 'Help Topics',
  },
  {
    type: 'item',
    disable: true,
    text: 'About Notepad',
  },
];
export default { 
  'Archivo': File, 
  'Editar': Edit, 
  'Formato': Format, 
  'Ver': View, 
  'Ayuda': Help 
};
