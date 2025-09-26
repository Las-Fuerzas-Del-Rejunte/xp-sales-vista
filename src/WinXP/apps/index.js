import InternetExplorer from './InternetExplorer';
import Minesweeper from './Minesweeper';
import ErrorBox from './ErrorBox';
import MyComputer from './MyComputer';
import Notepad from './Notepad';
import Winamp from './Winamp';
import Auth from './Auth';
import Catalog from './Catalog';
import Admin from './Admin';
import Paint from './Paint';
import iePaper from 'assets/windowsIcons/ie-paper.png';
import ie from 'assets/windowsIcons/ie.png';
import mine from 'assets/minesweeper/mine-icon.png';
import error from 'assets/windowsIcons/897(16x16).png';
import computer from 'assets/windowsIcons/676(16x16).png';
import computerLarge from 'assets/windowsIcons/676(32x32).png';
import notepad from 'assets/windowsIcons/327(16x16).png';
import notepadLarge from 'assets/windowsIcons/327(32x32).png';
import winamp from 'assets/windowsIcons/winamp.png';
import paintLarge from 'assets/windowsIcons/680(32x32).png';
import paint from 'assets/windowsIcons/680(16x16).png';
import userIcon from 'assets/windowsIcons/214(16x16).png';
import shopIcon from 'assets/windowsIcons/392(16x16).png';
import adminIcon from 'assets/windowsIcons/227(16x16).png';

const gen = () => {
  let id = -1;
  return () => {
    id += 1;
    return id;
  };
};
const genId = gen();
const genIndex = gen();
export const defaultAppState = [
  {
    component: InternetExplorer,
    header: {
      title: 'The Chrome Explorer',
      icon: iePaper,
    },
    defaultSize: {
      width: 700,
      height: 500,
    },
    defaultOffset: {
      x: 130,
      y: 20,
    },
    resizable: true,
    minimized: false,
    maximized: window.innerWidth < 800,
    id: genId(),
    zIndex: genIndex(),
  },
  {
    component: Minesweeper,
    header: {
      title: 'Minesweeper',
      icon: mine,
    },
    defaultSize: {
      width: 0,
      height: 0,
    },
    defaultOffset: {
      x: 180,
      y: 170,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    id: genId(),
    zIndex: genIndex(),
  },
  {
    component: Winamp,
    header: {
      title: 'Winamp',
      icon: winamp,
      invisible: true,
    },
    defaultSize: {
      width: 0,
      height: 0,
    },
    defaultOffset: {
      x: 0,
      y: 0,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    id: genId(),
    zIndex: genIndex(),
  },
  {
    component: MyComputer,
    header: {
      title: 'Mi PC',
      icon: computer,
    },
    defaultSize: {
      width: 660,
      height: 500,
    },
    defaultOffset: {
      x: 250,
      y: 40,
    },
    resizable: true,
    minimized: false,
    maximized: window.innerWidth < 800,
    id: genId(),
    zIndex: genIndex(),
  },
];

export const defaultIconState = [
  {
    id: 0,
    icon: ie,
    title: 'The Chrome Explorer',
    component: InternetExplorer,
    isFocus: false,
  },
  {
    id: 1,
    icon: shopIcon,
    title: 'Catálogo',
    component: Catalog,
    isFocus: false,
  },
  {
    id: 2,
    icon: adminIcon,
    title: 'Panel Admin',
    component: Admin,
    isFocus: false,
  },
  {
    id: 3,
    icon: mine,
    title: 'Minesweeper',
    component: Minesweeper,
    isFocus: false,
  },
  {
    id: 4,
    icon: computerLarge,
    title: 'Mi PC',
    component: MyComputer,
    isFocus: false,
  },
  {
    id: 5,
    icon: notepadLarge,
    title: 'Notepad',
    component: Notepad,
    isFocus: false,
  },
  {
    id: 6,
    icon: winamp,
    title: 'Winamp',
    component: Winamp,
    isFocus: false,
  },
  {
    id: 7,
    icon: paintLarge,
    title: 'Paint',
    component: Paint,
    isFocus: false,
  },
  {
    id: 8,
    icon: userIcon,
    title: 'Auth',
    component: Auth,
    isFocus: false,
  },
];

export const appSettings = {
  'The Chrome Explorer': {
    header: {
      icon: iePaper,
      title: 'The InternetExplorer',
    },
    component: InternetExplorer,
    defaultSize: {
      width: 700,
      height: 500,
    },
    defaultOffset: {
      x: 140,
      y: 30,
    },
    resizable: true,
    minimized: false,
    maximized: window.innerWidth < 800,
    multiInstance: true,
  },
  Minesweeper: {
    header: {
      icon: mine,
      title: 'Minesweeper',
    },
    component: Minesweeper,
    defaultSize: {
      width: 0,
      height: 0,
    },
    defaultOffset: {
      x: 190,
      y: 180,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  Error: {
    header: {
      icon: error,
      title: 'C:\\',
      buttons: ['close'],
      noFooterWindow: true,
    },
    component: ErrorBox,
    defaultSize: {
      width: 380,
      height: 0,
    },
    defaultOffset: {
      x: window.innerWidth / 2 - 190,
      y: window.innerHeight / 2 - 60,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Abstract Computer': {
    header: {
      icon: computer,
      title: 'Mi PC',
    },
    component: MyComputer,
    defaultSize: {
      width: 660,
      height: 500,
    },
    defaultOffset: {
      x: 260,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: window.innerWidth < 800,
    multiInstance: false,
  },
  AdminPanel: {
    header: {
      icon: adminIcon,
      title: 'Panel Admin',
    },
    component: Admin,
    defaultSize: { width: 1000, height: 550 },
    defaultOffset: { 
      x: Math.max(0, (window.innerWidth - 1000) / 2), 
      y: Math.max(0, (window.innerHeight - 550) / 2) 
    },
    resizable: true,
    minimized: false,
    maximized: window.innerWidth < 1100,
    multiInstance: false,
  },
  Notepad: {
    header: {
      icon: notepad,
      title: 'Untitled - Notepad',
    },
    component: Notepad,
    defaultSize: {
      width: 660,
      height: 500,
    },
    defaultOffset: {
      x: 270,
      y: 60,
    },
    resizable: true,
    minimized: false,
    maximized: window.innerWidth < 800,
    multiInstance: true,
  },
  Winamp: {
    header: {
      icon: winamp,
      title: 'Winamp',
      invisible: true,
    },
    component: Winamp,
    defaultSize: {
      width: 0,
      height: 0,
    },
    defaultOffset: {
      x: 0,
      y: 0,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  Paint: {
    header: {
      icon: paint,
      title: 'Untitled - Paint',
    },
    component: Paint,
    defaultSize: {
      width: 660,
      height: 500,
    },
    defaultOffset: {
      x: 280,
      y: 70,
    },
    resizable: true,
    minimized: false,
    maximized: window.innerWidth < 800,
    multiInstance: true,
  },
  Auth: {
    header: {
      icon: userIcon,
      title: 'Autenticación',
    },
    component: Auth,
    defaultSize: { width: 420, height: 0 },
    defaultOffset: { x: 300, y: 100 },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  Catálogo: {
    header: {
      icon: shopIcon,
      title: 'Catálogo',
    },
    component: Catalog,
    defaultSize: { width: 900, height: 550 },
    defaultOffset: { 
      x: Math.max(0, (window.innerWidth - 900) / 2), 
      y: Math.max(0, (window.innerHeight - 550) / 2) 
    },
    resizable: true,
    minimized: false,
    maximized: window.innerWidth < 1000,
    multiInstance: false,
  },
  Admin: {
    header: {
      icon: adminIcon,
      title: 'Panel Admin',
    },
    component: Admin,
    defaultSize: { width: 1000, height: 550 },
    defaultOffset: { 
      x: Math.max(0, (window.innerWidth - 1000) / 2), 
      y: Math.max(0, (window.innerHeight - 550) / 2) 
    },
    resizable: true,
    minimized: false,
    maximized: window.innerWidth < 1100,
    multiInstance: false,
  },
};

export { InternetExplorer, Minesweeper, ErrorBox, MyComputer, Notepad, Winamp };
