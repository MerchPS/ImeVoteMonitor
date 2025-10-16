// main.js
const REFRESH_MS = 5000;

let lastData = {};
let firstLoad = true;

function fmt(num) {
  // safeguard: jika bukan angka, tetap return as string
  if (typeof num !== 'number') return (num ?? '-').toString();
  return num.toLocaleString("en-US");
}

function diffSymbol(n) {
  if (typeof n !== 'number') return `<span style="color:var(--text-muted);">0</span>`;
  return n > 0 ? `<span class="up">+${n.toLocaleString()}</span>` :
         n < 0 ? `<span class="down">${n.toLocaleString()}</span>` :
         `<span style="color:var(--text-muted);">0</span>`;
}

async function fetchData() {
  const status = document.getElementById("status");
  try {
    // getApiUrl() di-override oleh apiku.js (client) -> '/apiku'
    const apiUrl = (typeof getApiUrl === 'function') ? getApiUrl() : '/apiku';
    // tambahkan cache buster
    const res = await fetch(apiUrl + (apiUrl.includes('?') ? '&' : '?') + '_=' + Date.now(), {
      cache: "no-store",
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();

    if (!json || !json.data) throw new Error("Invalid response structure");

    const data = Array.isArray(json.data) ? json.data.slice() : [];
    data.sort((a, b) => (b.votes || 0) - (a.votes || 0));

    const tbody = document.querySelector("#rankingTable tbody");
    tbody.innerHTML = "";

    data.forEach((d, i) => {
      const prev = lastData[d.id]?.votes ?? d.votes ?? 0;
      const delta = (d.votes ?? 0) - prev;

      const tr = document.createElement("tr");
      tr.className = i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : "";

      const lastUpdated = d.lastUpdated ? new Date(d.lastUpdated).toLocaleTimeString() : new Date(json.timestamp || Date.now()).toLocaleTimeString();

      tr.innerHTML = `
        <td>#${i + 1}</td>
        <td>${(d.name ?? '-')}</td>
        <td>${fmt(d.votes ?? 0)}</td>
        <td>${diffSymbol(delta)}</td>
        <td>${fmt(d.views ?? 0)}</td>
        <td>${lastUpdated}</td>
      `;
      tbody.appendChild(tr);

      lastData[d.id] = { votes: d.votes ?? 0, views: d.views ?? 0 };
    });

    const totalVotes = (json.totals && json.totals.votes) ? fmt(json.totals.votes) : "-";
    const totalViews = (json.totals && json.totals.views) ? fmt(json.totals.views) : "-";

    status.innerHTML = `<span class="status-update">✅ Updated ${new Date(json.timestamp || Date.now()).toLocaleTimeString()} — Total Votes: ${totalVotes}, Views: ${totalViews}</span>`;
    status.classList.remove("loading", "pulse");

    firstLoad = false;

  } catch (err) {
    console.error('fetchData error:', err);
    const status = document.getElementById("status");
    status.innerHTML = `<span class="status-error">❌ Gagal memuat data: ${err.message}</span>`;
    status.classList.remove("loading", "pulse");
  }
}

fetchData();
setInterval(fetchData, REFRESH_MS);
