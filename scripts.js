// ============================================================
// CONFIGURAÇÃO DA API
// 1. Acesse https://crudcrud.com e copie o seu endpoint.
// 2. Cole abaixo, mantendo "/clientes" no final.
//    Exemplo: https://crudcrud.com/api/abc123.../clientes
// Obs.: o endpoint do CrudCrud expira em 24h; gere outro quando precisar.
// ============================================================
const API_URL = "https://crudcrud.com/api/COLE_SEU_ENDPOINT_AQUI/clientes";

// ---------- Elementos ----------
const form = document.getElementById("clientForm");
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const saveBtn = document.getElementById("saveBtn");
const clientList = document.getElementById("clientList");
const emptyState = document.getElementById("emptyState");
const counter = document.getElementById("counter");
const message = document.getElementById("message");

// ---------- Utilidades ----------
function showMessage(text, type = "") {
  message.textContent = text;
  message.className = "message " + type;
}

function endpointConfigurado() {
  return !API_URL.includes("COLE_SEU_ENDPOINT_AQUI");
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------- GET: buscar e listar ----------
async function carregarClientes() {
  if (!endpointConfigurado()) {
    showMessage("Configure o endpoint do CrudCrud em scripts.js.", "error");
    renderizarClientes([]);
    return;
  }

  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error("Erro ao buscar clientes (" + resposta.status + ")");

    const clientes = await resposta.json();
    console.log("GET clientes:", clientes);
    renderizarClientes(clientes);
  } catch (erro) {
    console.log("Erro no GET:", erro);
    showMessage("Não foi possível carregar os clientes. Verifique o endpoint.", "error");
  }
}

// ---------- Renderização no DOM ----------
function renderizarClientes(clientes) {
  clientList.innerHTML = "";
  counter.textContent = clientes.length;
  emptyState.hidden = clientes.length > 0;

  clientes.forEach((cliente) => {
    const li = document.createElement("li");
    li.className = "client-item";

    const info = document.createElement("div");
    info.className = "client-info";

    const nome = document.createElement("strong");
    nome.textContent = cliente.nome; // textContent evita injeção de HTML

    const email = document.createElement("span");
    email.textContent = cliente.email;

    info.append(nome, email);

    const btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.className = "btn btn-danger";
    btnExcluir.textContent = "Excluir";
    btnExcluir.addEventListener("click", () => excluirCliente(cliente._id, btnExcluir));

    li.append(info, btnExcluir);
    clientList.appendChild(li);
  });
}

// ---------- POST: cadastrar ----------
async function cadastrarCliente(event) {
  event.preventDefault();

  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();

  if (!nome || !email) {
    showMessage("Preencha nome e e-mail.", "error");
    return;
  }
  if (!emailValido(email)) {
    showMessage("Digite um e-mail válido.", "error");
    return;
  }
  if (!endpointConfigurado()) {
    showMessage("Configure o endpoint do CrudCrud em scripts.js.", "error");
    return;
  }

  saveBtn.disabled = true;
  showMessage("Salvando...");

  try {
    const resposta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email }),
    });
    if (!resposta.ok) throw new Error("Erro ao salvar (" + resposta.status + ")");

    const criado = await resposta.json();
    console.log("POST criado:", criado);

    form.reset();
    nomeInput.focus();
    showMessage("Cliente cadastrado com sucesso!", "ok");
    await carregarClientes();
  } catch (erro) {
    console.log("Erro no POST:", erro);
    showMessage("Não foi possível salvar o cliente.", "error");
  } finally {
    saveBtn.disabled = false;
  }
}

// ---------- DELETE: excluir ----------
async function excluirCliente(id, botao) {
  botao.disabled = true;

  try {
    const resposta = await fetch(API_URL + "/" + id, { method: "DELETE" });
    if (!resposta.ok) throw new Error("Erro ao excluir (" + resposta.status + ")");

    console.log("DELETE ok, id:", id); // o CrudCrud responde sem corpo
    showMessage("Cliente excluído.", "ok");
    await carregarClientes();
  } catch (erro) {
    console.log("Erro no DELETE:", erro);
    showMessage("Não foi possível excluir o cliente.", "error");
    botao.disabled = false;
  }
}

form.addEventListener("submit", cadastrarCliente);
carregarClientes();

// ============================================================
// TEMA CLARO / ESCURO
// ============================================================
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");

function aplicarTema(tema) {
  root.setAttribute("data-theme", tema);
  themeIcon.textContent = tema === "dark" ? "☀️" : "🌙";
  themeLabel.textContent = tema === "dark" ? "Tema claro" : "Tema escuro";
  try { localStorage.setItem("tema", tema); } catch (e) { /* ignora */ }
}

let temaSalvo = null;
try { temaSalvo = localStorage.getItem("tema"); } catch (e) { /* ignora */ }
const prefereEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
aplicarTema(temaSalvo || (prefereEscuro ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  aplicarTema(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

// ============================================================
// EFEITO 3D: parallax do fundo + inclinação dos painéis
// ============================================================
const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduzMovimento) {
  const world = document.getElementById("world");

  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    world.style.setProperty("--rx", x * 8 + "deg");
    world.style.setProperty("--ry", -y * 6 + "deg");
  });

  document.querySelectorAll(".tilt").forEach((painel) => {
    painel.addEventListener("mousemove", (e) => {
      const r = painel.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      painel.style.setProperty("--ty", px * 7 + "deg");
      painel.style.setProperty("--tx", -py * 7 + "deg");
    });
    painel.addEventListener("mouseleave", () => {
      painel.style.setProperty("--ty", "0deg");
      painel.style.setProperty("--tx", "0deg");
    });
  });
}