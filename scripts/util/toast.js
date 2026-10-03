let hideTimer = null;

const showToast = (message, duration = 3000) => {
  const span = document.getElementById("copy-message");
  span.textContent = message;

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    span.textContent = "";
  }, duration);
}

export default showToast;
