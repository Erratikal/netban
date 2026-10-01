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
  ["Gamers Nexus", "https://gamersnexus.net/rss.xml"],
  ["igor'sLAB", "https://www.igorslab.de/en/feed/"],
  ["TechSpot", "https://www.techspot.com/backend.xml"],
  ["ComputerBase", "https://www.computerbase.de/rss/news.xml"],
  ["PC Games Hardware", "https://www.pcgameshardware.de/feed/"],
  ["Hardwareluxx", "https://www.hardwareluxx.de/index.php/news.feed?type=rss"],
  ["KitGuru", "https://www.kitguru.net/feed/"],
  ["Hardware Canucks", "https://hardwarecanucks.com/feed/"],
  ["Club386", "https://www.club386.com/feed/"],
  ["Guru3D", "https://www.guru3d.com/rss.xml"],
  ["Digital Foundry", "https://www.digitalfoundry.net/feeds/latest"],
  ["SoundGuys", "https://www.soundguys.com/feed/"],
  ["Ars Technica", "https://feeds.arstechnica.com/arstechnica/index"],
  ["GSMArena", "https://www.gsmarena.com/rss-news-reviews.php3"],
  ["Android Authority", "https://www.androidauthority.com/feed/"],
  ["Droid-Life", "https://www.droid-life.com/feed/"],
  ["9to5Google", "https://9to5google.com/feed/"],
  ["Thurrott", "https://www.thurrott.com/feed"],
  ["Neowin", "https://www.neowin.net/news/rss/"],
  ["Heise", "https://www.heise.de/rss/heise-atom.xml"],
  ["WinFuture", "https://static.winfuture.de/feeds/WinFuture-News-rss2.0.xml"],
  ["Trusted Reviews", "https://www.trustedreviews.com/feed"]
];

function when(iso) {
  const then = new Date(iso).getTime();
  if (!then) return "";
  const hours = Math.round((Date.now() - then) / 36e5);
  if (hours < 1) return "just now";
  if (hours < 24) return hours + "h";
  return Math.round(hours / 24) + "d";
}

async function oneFeed(source, url) {
  const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(url));
  const data = await res.json();
  const item = (data.items || [])[0];
  if (!item) return null;
  return { source, title: item.title, link: item.link, date: item.pubDate };
}

async function loadNews() {
  if (!newsList) return;
  const key = "netban-news";
  const cached = sessionStorage.getItem(key);
  if (cached) {
    const saved = JSON.parse(cached);
    if (Date.now() - saved.at < 30 * 60 * 1000) return render(saved.items);
  }
  const results = await Promise.all(feeds.map(([source, url]) => oneFeed(source, url).catch(() => null)));
  const items = results.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  if (!items.length) {
    newsList.innerHTML = "<li><span>News feed unavailable right now.</span></li>";
    return;
  }
  sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), items }));
  render(items);
}

function render(items) {
  newsList.innerHTML = items.map((item) =>
    `<li><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a><span>${item.source} · ${when(item.date)}</span></li>`
  ).join("");
}

loadNews();
