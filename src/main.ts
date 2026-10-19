// Punto de entrada: monta la pantalla principal. Las reglas viven en src/sim/.
import './style.css';
import { startApp } from './ui/app';

startApp(document.getElementById('app')!);
