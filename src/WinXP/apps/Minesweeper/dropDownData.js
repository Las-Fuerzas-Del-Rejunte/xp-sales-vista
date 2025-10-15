export const Game = [
  {
    type: 'item',
    text: 'Nuevo',
    hotkey: 'F2',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Principiante',
  },
  {
    type: 'item',
    text: 'Intermedio',
  },
  {
    type: 'item',
    text: 'Experto',
  },
  {
    type: 'item',
    text: 'Custom...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Marks (?)',
    symbol: 'check',
  },
  {
    type: 'item',
    text: 'Color',
    symbol: 'check',
  },
  {
    type: 'item',
    text: 'Sound',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Best Times...',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'Exit',
  },
];

const Help = [
  {
    type: 'item',
    text: 'Contents',
    hotkey: 'F1',
  },
  {
    type: 'item',
    text: 'Search for Help on...',
  },
  {
    type: 'item',
    text: 'Using Help',
  },
  {
    type: 'separator',
  },
  {
    type: 'item',
    text: 'About Minesweeper',
  },
];
export default { 
  'Juego': Game, 
  'Ayuda': Help 
};
