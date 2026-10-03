"use strict"

import showToast from "./util/toast.js";

// Any button with data-copy-target="<id>" copies that element's text
document.querySelectorAll("[data-copy-target]").forEach(button => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.copyTarget);
    navigator.clipboard.writeText(target.textContent);
    showToast("Copiado!");
  });
});
