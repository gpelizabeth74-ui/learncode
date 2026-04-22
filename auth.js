// ============================================================
// auth.js — LearnCode Fase 3
// Módulo de autenticación y progreso con Supabase
// ============================================================

const SUPABASE_URL = "https://ygrtintkbureopukharu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncnRpbnRrYnVyZW9wdWtoYXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDM3NTQsImV4cCI6MjA5MjM3OTc1NH0.wGfBliABjLhZTM0yoeNzBtATipc23wNIHwurrA9dN40";

let _sb = null;

async function getSB() {
  if (_sb) return _sb;
  await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  return _sb;
}

function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

// ── REGISTRO ─────────────────────────────────────────────────
async function registrar(email, password, nombre) {
  const sb = await getSB();
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { data: { nombre } }
  });
  if (error) throw error;
  return data;
}

// ── LOGIN ─────────────────────────────────────────────────────
async function login(email, password) {
  const sb = await getSB();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// ── LOGOUT ────────────────────────────────────────────────────
async function logout() {
  const sb = await getSB();
  await sb.auth.signOut();
  window.location.href = "index.html";
}

// ── OBTENER USUARIO ACTUAL ────────────────────────────────────
async function getUsuario() {
  const sb = await getSB();
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

// ── GUARDAR PROGRESO ──────────────────────────────────────────
async function guardarProgreso(curso, leccion, puntaje = 0) {
  const sb = await getSB();
  const user = await getUsuario();
  if (!user) return;
  const { error } = await sb.from("progreso").upsert({
    user_id: user.id,
    curso,
    leccion,
    completado: true,
    puntaje,
    fecha: new Date().toISOString()
  }, { onConflict: "user_id,curso,leccion" });
  if (error) console.error("Error guardando progreso:", error);
}

// ── OBTENER PROGRESO ──────────────────────────────────────────
async function getProgreso(curso) {
  const sb = await getSB();
  const user = await getUsuario();
  if (!user) return [];
  const { data, error } = await sb
    .from("progreso")
    .select("*")
    .eq("user_id", user.id)
    .eq("curso", curso)
    .eq("completado", true);
  if (error) return [];
  return data || [];
}

// ── OBTENER TODO EL PROGRESO ──────────────────────────────────
async function getTodoProgreso() {
  const sb = await getSB();
  const user = await getUsuario();
  if (!user) return [];
  const { data } = await sb
    .from("progreso")
    .select("*")
    .eq("user_id", user.id)
    .eq("completado", true);
  return data || [];
}

// ── ESCUCHAR CAMBIOS DE SESIÓN ────────────────────────────────
async function onAuthChange(callback) {
  const sb = await getSB();
  sb.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
}
