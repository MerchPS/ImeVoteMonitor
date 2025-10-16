const REFRESH_MS = 5000;
let lastData = {};
let firstLoad = true;

function fmt(num) {
  return num.toLocaleString("en-US");
}

function diffSymbol(n) {
  return n > 0 ? `<span class="up">+${n}</span>` :
         n < 0 ? `<span class="down">${n}</span>` :
         `<span style="color:var(--text-muted);">0</span>`;
}

async function fetchData() {
  const status = document.getElementById("status");
  try {
    const res = await fetch("/api/apiku?_=" + Date.now(), { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();

    if (!json.success || !json.data) throw new Error("Invalid response");

    const data = json.data.sort((a,b) => b.votes - a.votes);
    const tbody = document.querySelector("#rankingTable tbody");
    tbody.innerHTML = "";

    data.forEach((d, i) => {
      const prev = lastData[d.id]?.votes ?? d.votes;
      const delta = d.votes - prev;

      const tr = document.createElement("tr");
      tr.className = i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : "";

      tr.innerHTML = `
        <td>#${i + 1}</td>
        <td>${d.name}</td>
        <td>${fmt(d.votes)}</td>
        <td>${diffSymbol(delta)}</td>
        <td>${fmt(d.views)}</td>
        <td>${new Date(d.lastUpdated).toLocaleTimeString()}</td>
      `;
      tbody.appendChild(tr);

      lastData[d.id] = { votes: d.votes, views: d.views };
    });

    status.innerHTML = `<span class="status-update">✅ Updated ${new Date(json.timestamp).toLocaleTimeString()}</span>`;
    status.classList.remove("loading", "pulse");

    firstLoad = false;

  } catch (err) {
    console.error(err);
    status.innerHTML = `<span class="status-error">❌ Gagal memuat data: ${err.message}</span>`;
    status.classList.remove("loading", "pulse");
  }
}

fetchData();
setInterval(fetchData, REFRESH_MS);
