const toast = document.getElementById("toast");
const newsList = document.getElementById("news-list");

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1600);
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "absolute";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  }
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.getAttribute("data-copy") || "";
    const ok = await copyText(value);
    if (!ok) return showToast("Could not copy");
    const original = button.textContent;
    button.textContent = "Copied";
    button.classList.add("is-copied");
    showToast("Code copied: " + value);
    window.setTimeout(() => {
      button.textContent = original;
      button.classList.remove("is-copied");
    }, 1400);
  });
});

const feeds = [
  ["TechPowerUp", "https://www.techpowerup.com/rss/news"],
  ["PC Gamer", "https://www.pcgamer.com/rss/"]
];

function when(iso) {
  const then = new Date(iso).getTime();
  if (!then) return "";
  const hours = Math.round((Date.now() - then) / 36e5);
  if (hours < 1) return "just now";
  if (hours < 24) return hours + "h";
  return Math.round(hours / 24) + "d";
}

async function loadNews() {
  if (!newsList) return;
  try {
    const batches = await Promise.all(feeds.map(async ([source, url]) => {
      const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(url));
      const data = await res.json();
      return (data.items || []).slice(0, 4).map((item) => ({
        source,
        title: item.title,
        link: item.link,
        date: item.pubDate
      }));
    }));
    const items = batches.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
    newsList.innerHTML = items.map((item) =>
      `<li><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a><span>${item.source} · ${when(item.date)}</span></li>`
    ).join("");
  } catch {
    newsList.innerHTML = "<li><span>News feed unavailable right now.</span></li>";
  }
}

loadNews();
