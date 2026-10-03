"use strict"

import buildChipGroup from "./util/chips.js";

const sides = ["top", "right", "bottom", "left"];

const optionsContainer = document.getElementById("position-options");
const offsetsContainer = document.getElementById("position-offsets");
const offsetInputs = [...offsetsContainer.querySelectorAll("input[data-side]")];
const parentToggle = document.getElementById("position-parent");
const parentBox = document.getElementById("position-parent-box");
const slot = document.getElementById("position-slot");
const target = document.getElementById("position-target");
const explain = document.getElementById("position-explain");
const codeOutput = document.getElementById("position-code");

const descriptions = {
  static: "The default. The element follows the normal flow, and top / right / bottom / left have no effect.",
  relative: "Stays in the normal flow. The dashed outline is the space it still keeps, and the offsets move it away from that spot without moving the siblings.",
  absolute: "Leaves the flow, so the siblings close the gap. It's placed relative to the nearest positioned ancestor. Turn the parent's position off and it uses the page instead.",
  fixed: "Leaves the flow and is placed relative to the viewport, so it stays in place while you scroll. Here, the preview frame plays the viewport.",
  sticky: "Acts like relative until you scroll past the offset (e.g. top: 20px), then sticks, but only while its parent is still on screen. Scroll the preview to see it.",
};

let position = "relative";

const readOffsets = () => {
  const offsets = {};

  offsetInputs.forEach(input => {
    const value = parseInt(input.value, 10);
    offsets[input.dataset.side] = Number.isNaN(value) ? null : value;
  });

  return offsets;
}

const px = value => (value === 0 ? "0" : `${value}px`);

const makeCssText = offsets => {
  let css = "";

  if (position === "absolute" && parentToggle.checked) {
    css += ".parent {\n  position: relative;\n}\n\n";
  }

  const lines = [`  position: ${position};`];

  if (position !== "static") {
    sides
      .filter(side => offsets[side] !== null)
      .forEach(side => lines.push(`  ${side}: ${px(offsets[side])};`));
  }

  return `${css}.element {\n${lines.join("\n")}\n}`;
}

const render = () => {
  const offsets = readOffsets();

  target.style.position = position;
  sides.forEach(side => {
    target.style[side] = offsets[side] === null ? "auto" : `${offsets[side]}px`;
  });

  parentBox.style.position = parentToggle.checked ? "relative" : "static";
  parentBox.classList.toggle("is-positioned", parentToggle.checked);

  // The slot shows the "ghost" spot a relative element keeps in the flow.
  // Sticky needs the parent as its containing block, so the slot gets out of the way.
  slot.classList.toggle("is-ghost", position === "relative");
  slot.classList.toggle("is-transparent", position === "sticky");

  offsetsContainer.classList.toggle("is-disabled", position === "static");
  offsetInputs.forEach(input => (input.disabled = position === "static"));

  explain.textContent = descriptions[position];
  codeOutput.textContent = makeCssText(offsets);
}

buildChipGroup(optionsContainer, {
  name: "position",
  options: Object.keys(descriptions),
  value: position,
  onChange: value => {
    position = value;
    render();
  },
});

offsetInputs.forEach(input => input.addEventListener("input", render));
parentToggle.addEventListener("change", render);

render();
