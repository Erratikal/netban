const toast = document.getElementById("toast");

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 1600);
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
    if (!ok) {
      showToast("Could not copy");
      return;
    }
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
