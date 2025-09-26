import empty from 'assets/empty.png';
import backup from 'assets/windowsIcons/23(16x16).png';
import keyboard from 'assets/windowsIcons/58(16x16).png';
import cmd from 'assets/windowsIcons/56(16x16).png';
import calculator from 'assets/windowsIcons/74(16x16).png';
import utility from 'assets/windowsIcons/119(16x16).png';
import volume from 'assets/windowsIcons/120(16x16).png';
import characterMap from 'assets/windowsIcons/127(16x16).png';
import cleanDisk from 'assets/windowsIcons/128(16x16).png';
import wordPad from 'assets/windowsIcons/153(16x16).png';
import winExplorer from 'assets/windowsIcons/156(16x16).png';
import MSN from 'assets/windowsIcons/159(16x16).png';
import sync from 'assets/windowsIcons/182(16x16).png';
import security from 'assets/windowsIcons/214(16x16).png';
import access from 'assets/windowsIcons/227(16x16).png';
import wireless from 'assets/windowsIcons/234(16x16).png';
import accessibility from 'assets/windowsIcons/238(16x16).png';
import connection from 'assets/windowsIcons/309(16x16).png';
import update from 'assets/windowsIcons/322(16x16).png';
import notepad from 'assets/windowsIcons/327(16x16).png';
import networkAssistance from 'assets/windowsIcons/357(16x16).png';
import menu from 'assets/windowsIcons/358(16x16).png';
import transfer from 'assets/windowsIcons/367(16x16).png';
import defragmenter from 'assets/windowsIcons/374(16x16).png';
import catalog from 'assets/windowsIcons/392(16x16).png';
import networkConnection from 'assets/windowsIcons/404(16x16).png';
import info from 'assets/windowsIcons/505(16x16).png';
import address from 'assets/windowsIcons/554(16x16).png';
import connectionWizard from 'assets/windowsIcons/663(16x16).png';
import networkSetup from 'assets/windowsIcons/664(16x16).png';
import hyperCmd from 'assets/windowsIcons/669(16x16).png';
import painter from 'assets/windowsIcons/680(16x16).png';
import sound from 'assets/windowsIcons/690(16x16).png';
import recent from 'assets/windowsIcons/716(16x16).png';
import compatibility from 'assets/windowsIcons/747(16x16).png';
import magnifier from 'assets/windowsIcons/817(16x16).png';
import mediaPlayer from 'assets/windowsIcons/846(16x16).png';
import tour from 'assets/windowsIcons/853(32x32).png';
import outlook from 'assets/windowsIcons/887(16x16).png';
import spade from 'assets/windowsIcons/888(16x16).png';
import reversi from 'assets/windowsIcons/889(16x16).png';
import onlineHeart from 'assets/windowsIcons/890(16x16).png';
import checker from 'assets/windowsIcons/891(16x16).png';
import backgammon from 'assets/windowsIcons/892(16x16).png';
import movieMaker from 'assets/windowsIcons/894(16x16).png';
import ie from 'assets/windowsIcons/896(16x16).png';
import messenger from 'assets/windowsIcons/msn.png';
import spider from 'assets/windowsIcons/spider.png';
import freecell from 'assets/windowsIcons/freecell.png';
import heart from 'assets/windowsIcons/heart.png';
import rdp from 'assets/windowsIcons/rdp.png';
import solitaire from 'assets/windowsIcons/solitaire.png';
import narrator from 'assets/windowsIcons/narrator.ico';
import pinball from 'assets/windowsIcons/pinball.png';
import restore from 'assets/windowsIcons/restore.ico';
import mine from 'assets/minesweeper/mine-icon.png';
import userIcon from 'assets/windowsIcons/214(16x16).png';
import shopIcon from 'assets/windowsIcons/392(16x16).png';
import adminIcon from 'assets/windowsIcons/227(16x16).png';

export const MyRecentDocuments = [
  {
    type: 'item',
    icon: empty,
    text: '(Vacío)',
  },
];
export const ConnectTo = [
  {
    type: 'item',
    icon: MSN,
    text: 'MSN',
  },
  {
    type: 'item',
    icon: connection,
    text: 'Mostrar todas las conexiones',
  },
];
export const AllPrograms = [
  {
    type: 'item',
    icon: access,
    text: 'Establecer acceso y valores predeterminados de programa',
  },
  {
    type: 'item',
    icon: catalog,
    text: 'Catálogo de Windows',
  },
  {
    type: 'item',
    icon: update,
    text: 'Actualización de Windows',
  },
  {
    type: 'separator',
  },
  {
    type: 'menu',
    icon: menu,
    text: 'Accesorios',
    items: [
      {
        type: 'menu',
        icon: menu,
        text: 'Accesibilidad',
        bottom: 'initial',
        items: [
          {
            type: 'item',
            icon: accessibility,
            text: 'Asistente para accesibilidad',
          },
          {
            type: 'item',
            icon: magnifier,
            text: 'Lupa',
          },
          {
            type: 'item',
            icon: narrator,
            text: 'Narrador',
          },
          {
            type: 'item',
            icon: keyboard,
            text: 'Teclado en pantalla',
          },
          {
            type: 'item',
            icon: utility,
            text: 'Administrador de utilidades',
          },
        ],
      },
      {
        type: 'menu',
        icon: menu,
        text: 'Communications',
        bottom: 'initial',
        items: [
          {
            type: 'item',
            icon: hyperCmd,
            text: 'HyperTerminal',
          },
          {
            type: 'item',
            icon: networkConnection,
            text: 'Network Connections',
          },
          {
            type: 'item',
            icon: networkSetup,
            text: 'Network Setup Wizard',
          },
          {
            type: 'item',
            icon: connectionWizard,
            text: 'New Connection Wizard',
          },
          {
            type: 'item',
            icon: wireless,
            text: 'Wireless Network Setup Wizard',
          },
        ],
      },
      {
        type: 'menu',
        icon: menu,
        text: 'Entertainment',
        bottom: 'initial',
        items: [
          {
            type: 'item',
            icon: sound,
            text: 'Sound Recorder',
          },
          {
            type: 'item',
            icon: volume,
            text: 'Volume Control',
          },
          {
            type: 'item',
            icon: mediaPlayer,
            text: 'Windows Media Player',
          },
        ],
      },
      {
        type: 'menu',
        icon: menu,
        text: 'Herramientas del sistema',
        bottom: 'initial',
        items: [
          {
            type: 'item',
            icon: backup,
            text: 'Copia de seguridad',
          },
          {
            type: 'item',
            icon: characterMap,
            text: 'Mapa de caracteres',
          },
          {
            type: 'item',
            icon: cleanDisk,
            text: 'Liberador de espacio en disco',
          },
          {
            type: 'item',
            icon: defragmenter,
            text: 'Desfragmentador de disco',
          },
          {
            type: 'item',
            icon: transfer,
            text: 'Asistente para transferir archivos y configuraciones',
          },
          {
            type: 'item',
            icon: recent,
            text: 'Tareas programadas',
          },
          {
            type: 'item',
            icon: security,
            text: 'Centro de seguridad',
          },
          {
            type: 'item',
            icon: info,
            text: 'Información del sistema',
          },
          {
            type: 'item',
            icon: restore,
            text: 'Restaurar sistema',
          },
        ],
      },
      {
        type: 'item',
        icon: address,
        text: 'Libreta de direcciones',
      },
      {
        type: 'item',
        icon: cmd,
        text: 'Símbolo del sistema',
      },
      {
        type: 'item',
        icon: notepad,
        text: 'Bloc de notas',
      },
      {
        type: 'item',
        icon: painter,
        text: 'Paint',
      },
      {
        type: 'item',
        icon: calculator,
        text: 'Calculadora',
      },
      {
        type: 'item',
        icon: compatibility,
        text: 'Asistente de compatibilidad de programas',
      },
      {
        type: 'item',
        icon: rdp,
        text: 'Conexión a Escritorio remoto',
      },
      {
        type: 'item',
        icon: sync,
        text: 'Sincronizar',
      },
      {
        type: 'item',
        icon: tour,
        text: 'Recorrido por Windows XP',
      },
      {
        type: 'item',
        icon: winExplorer,
        text: 'Explorador de Windows',
      },
      {
        type: 'item',
        icon: wordPad,
        text: 'WordPad',
      },
    ],
  },
  {
    type: 'menu',
    icon: menu,
    text: 'Juegos',
    items: [
      {
        type: 'item',
        icon: freecell,
        text: 'FreeCell',
      },
      {
        type: 'item',
        icon: heart,
        text: 'Corazones',
      },
      {
        type: 'item',
        icon: backgammon,
        text: 'Backgammon de Internet',
      },
      {
        type: 'item',
        icon: checker,
        text: 'Damas de Internet',
      },
      {
        type: 'item',
        icon: onlineHeart,
        text: 'Corazones de Internet',
      },
      {
        type: 'item',
        icon: reversi,
        text: 'Reversi de Internet',
      },
      {
        type: 'item',
        icon: spade,
        text: 'Picas de Internet',
      },
      {
        type: 'item',
        icon: mine,
        text: 'Buscaminas',
      },
      {
        type: 'item',
        icon: pinball,
        text: 'Pinball',
      },
      {
        type: 'item',
        icon: solitaire,
        text: 'Solitario',
      },
      {
        type: 'item',
        icon: spider,
        text: 'Solitario Spider',
      },
    ],
  },
  {
    type: 'menu',
    icon: menu,
    text: 'Tienda',
    items: [
      { type: 'item', icon: shopIcon, text: 'Catálogo' },
      { type: 'item', icon: adminIcon, text: 'Admin' },
      { type: 'item', icon: userIcon, text: 'Auth' },
    ],
  },
  {
    type: 'menu',
    icon: menu,
    text: 'Inicio',
    items: [
      {
        type: 'item',
        icon: empty,
        text: '(Vacío)',
      },
    ],
  },
  {
    type: 'item',
    icon: ie,
    text: 'Internet Explorer',
  },
  {
    type: 'item',
    icon: outlook,
    text: 'Outlook Express',
  },
  {
    type: 'item',
    icon: networkAssistance,
    text: 'Asistencia remota',
  },
  {
    type: 'item',
    icon: mediaPlayer,
    text: 'Windows Media Player',
  },
  {
    type: 'item',
    icon: messenger,
    text: 'Windows Messenger',
  },
  {
    type: 'item',
    icon: movieMaker,
    text: 'Windows Movie Maker',
  },
];

export default {
  AllPrograms,
};
