// ==== GitHub Seting ====
const GITHUB_REPO = "Rafka-Developer/database8";
const DATA_FILE   = "data.json";
const GITHUB_TOKEN = "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";

async function getData() {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_FILE}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    if (!res.ok) throw new Error("Fetch gagal");
    const json = await res.json();
    const content = atob(json.content);
    return { data: JSON.parse(content), sha: json.sha };
  } catch (e) {
    console.error("Error getData:", e);
    return { data: { tokens: [] }, sha: null };
  }
}

async function saveData(newData, sha) {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_FILE}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Update data.json",
        content: btoa(unescape(encodeURIComponent(JSON.stringify(newData, null, 2)))),
        sha
      })
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("GitHub API Error:", err);
      alert("Gagal update: " + (err.message || res.statusText));
    }
  } catch (e) {
    console.error("Error saveData:", e);
  }
}

async function renderTokens() {
  const { data, sha } = await getData();
  const list = document.getElementById("tokenList");
  const empty = document.getElementById("emptyState");
  const total = document.getElementById("totalTokens");

  list.innerHTML = "";

  if (!data.tokens || data.tokens.length === 0) {
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
    data.tokens.forEach(t => {
      const li = document.createElement("li");
      li.className = "token-item";

      const span = document.createElement("span");
      span.className = "token-txt";
      span.textContent = t;

      const delBtn = document.createElement("button");
      delBtn.className = "btn danger";
      delBtn.textContent = "Hapus";
      delBtn.onclick = async () => {
        const newTokens = data.tokens.filter(x => x !== t);
        await saveData({ tokens: newTokens }, sha);
        renderTokens();
      };

      li.appendChild(span);
      li.appendChild(delBtn);
      list.appendChild(li);
    });
  }
  total.textContent = data.tokens ? data.tokens.length : 0;
}

async function addToken(e) {
  e.preventDefault();
  const input = document.getElementById("tokenInput");
  const token = input.value.trim();
  if (!token) return alert("Token kosong!");

  const { data, sha } = await getData();
  if (!data.tokens.includes(token)) {
    data.tokens.push(token);
    await saveData(data, sha);
  } else {
    alert("Token sudah ada!");
  }
  input.value = "";
  renderTokens();
}

document.addEventListener("DOMContentLoaded", () => {
  renderTokens();
  document.getElementById("addForm").addEventListener("submit", addToken);

  const sidebar = document.getElementById("sidebar");
  document.getElementById("openSidebar").onclick = () => sidebar.classList.add("open");
  document.getElementById("closeSidebar").onclick = () => sidebar.classList.remove("open");

  document.querySelectorAll(".menu-item").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".page").forEach(p => p.classList.remove("page-active"));
      document.getElementById(btn.dataset.target).classList.add("page-active");
      document.querySelectorAll(".menu-item").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  setInterval(() => {
    document.getElementById("clock").textContent = new Date().toLocaleTimeString();
  }, 1000);
});