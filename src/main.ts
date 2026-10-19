// Pantalla provisional mientras se decide el diseño con Mikel (docs/FEEDBACK.md).
// Las reglas del juego irán en src/sim/ (TypeScript puro, sin DOM); aquí solo se dibuja.
import './style.css';

const app = document.getElementById('app')!;
app.innerHTML = `
  <main class="splash">
    <p class="studio">ZENIT STUDIO</p>
    <h1>Chatarrero</h1>
    <p class="status">En diseño. El juego aparecerá aquí en cuanto se apruebe.</p>
    <p class="build">Versión ${import.meta.env.VITE_COMMIT?.slice(0, 7) ?? 'local'}</p>
  </main>
`;
