import { decryptPage } from "./crypto.js";

const form = document.querySelector("#unlock-form");
const input = document.querySelector("#passphrase");
const status = document.querySelector("#status");
const button = document.querySelector("#open-button");
const visibility = document.querySelector("#visibility");

visibility.addEventListener("click", () => {
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  visibility.textContent = show ? "Hide" : "Show";
  visibility.setAttribute("aria-label", show ? "Hide passphrase" : "Show passphrase");
  visibility.setAttribute("aria-pressed", String(show));
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (button.disabled) return;
  status.className = "";
  if (!crypto.subtle) {
    status.textContent = "Please open this page over HTTPS in an up-to-date browser.";
    return;
  }
  button.disabled = true;
  form.setAttribute("aria-busy", "true");
  status.textContent = "Opening the explainer…";
  let payload;
  try {
    const response = await fetch("content.enc.json", { cache: "no-store", credentials: "omit" });
    if (!response.ok) throw new Error("Download failed");
    payload = await response.json();
  } catch {
    status.className = "error";
    status.textContent = "The explainer could not be loaded. Check your connection and try again.";
    button.disabled = false;
    form.removeAttribute("aria-busy");
    return;
  }
  let plaintext;
  try {
    plaintext = await decryptPage(payload, input.value);
  } catch {
    status.className = "error";
    status.textContent = "That passphrase didn’t work. Please try again.";
    input.setAttribute("aria-invalid", "true");
    button.disabled = false;
    form.removeAttribute("aria-busy");
    input.focus();
    input.select();
    return;
  }
  input.value = "";
  // Restore the exact self-contained export in this document so its bundled
  // scripts and DOMContentLoaded hooks run as they do in the original file.
  document.open();
  document.write(new TextDecoder().decode(plaintext));
  document.close();
  window.scrollTo(0, 0);
});
