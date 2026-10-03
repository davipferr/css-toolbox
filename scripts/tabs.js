"use strict"

const tabs = [...document.querySelectorAll('[role="tab"]')];

// On narrow screens the tab bar scrolls, so keep the active tab visible
const scrollTabIntoView = (tab, behavior = "smooth") => {
  const bar = tab.parentElement;
  bar.scrollTo({
    left: tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2,
    behavior,
  });
}

const selectTab = (tab, { focus = false, updateHash = true } = {}) => {
  tabs.forEach(other => {
    const isActive = other === tab;
    other.setAttribute("aria-selected", isActive);
    other.tabIndex = isActive ? 0 : -1;
    document.getElementById(other.getAttribute("aria-controls")).hidden = !isActive;
  });

  if (focus) {
    tab.focus();
  }

  scrollTabIntoView(tab);

  if (updateHash) {
    history.replaceState(null, "", `#${tab.dataset.hash}`);
  }
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectTab(tab));

  tab.addEventListener("keydown", event => {
    const moves = { ArrowRight: 1, ArrowLeft: -1 };
    const step = moves[event.key];

    if (!step) {
      return;
    }

    event.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length];
    selectTab(next, { focus: true });
  });
});

// Open the tab named in the URL (e.g. .../#spacing) so tools can be linked directly
const initialTab = tabs.find(tab => `#${tab.dataset.hash}` === location.hash);

if (initialTab) {
  selectTab(initialTab, { updateHash: false });
  // Tab widths change once the web font loads, so re-center after that
  document.fonts.ready.then(() => scrollTabIntoView(initialTab, "instant"));
}
