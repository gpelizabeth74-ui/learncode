// ============================================================
// progreso.js — LearnCode Fase 3
// Agrega esto en TODOS los cursos para guardar progreso
// Uso: llamar initProgreso("html", 8) al cargar la página
// ============================================================

let _cursoNombre = "";
let _cursoTotal = 0;

async function initProgreso(curso, totalLecciones) {
  _cursoNombre = curso;
  _cursoTotal = totalLecciones;

  // Cargar progreso guardado y marcar lecciones completadas
  try {
    const completadas = await getProgreso(curso);
    completadas.forEach(p => {
      const el = document.querySelector(`.li:nth-child(${p.leccion})`);
      if (el && !el.classList.contains('active')) {
        el.classList.add('done');
        const ln = el.querySelector('.ln');
        if (ln) ln.textContent = '✓';
      }
    });
    actualizarBarraProgreso(completadas.length, totalLecciones);
  } catch(e) {
    console.log("Sin sesión activa — progreso no cargado");
  }
}

function actualizarBarraProgreso(completadas, total) {
  const pct = Math.round((completadas / total) * 100);
  const fill = document.getElementById('pf');
  const label = document.getElementById('pp');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = pct + '%';
}

// Llamar esta función cuando el usuario completa una lección
async function completarLeccion(leccion, puntaje = 0) {
  try {
    await guardarProgreso(_cursoNombre, leccion, puntaje);
    // Marcar visualmente como completada
    const items = document.querySelectorAll('.li');
    if (items[leccion - 1]) {
      items[leccion - 1].classList.add('done');
      items[leccion - 1].classList.remove('active');
      const ln = items[leccion - 1].querySelector('.ln');
      if (ln) ln.textContent = '✓';
    }
    // Actualizar barra
    const completadas = await getProgreso(_cursoNombre);
    actualizarBarraProgreso(completadas.length, _cursoTotal);
    mostrarToast('✓ Lección completada y guardada');
  } catch(e) {
    mostrarToast('Inicia sesión para guardar tu progreso', true);
  }
}

// Toast de notificación
function mostrarToast(msg, esError = false) {
  let t = document.getElementById('lc-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'lc-toast';
    t.style.cssText = `position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:13px;z-index:999;transition:opacity .3s;opacity:0`;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = esError ? '#f7816620' : '#3fb95020';
  t.style.border = `1px solid ${esError ? '#f7816640' : '#3fb95040'}`;
  t.style.color = esError ? '#f78166' : '#3fb950';
  t.style.opacity = '1';
  setTimeout(() => t.style.opacity = '0', 3000);
}
