"use strict"

import buildChipGroup from "./util/chips.js";

const preview = document.getElementById("flex-preview");
const optionsContainer = document.getElementById("flex-options");
const gapInput = document.getElementById("flex-gap");
const countInput = document.getElementById("flex-count");
const codeOutput = document.getElementById("flex-code");

const MAX_ITEMS = 12;

// Different sizes make align-items and wrapping easy to see
const ITEM_HEIGHTS = [56, 88, 40, 72, 64];
const ITEM_WIDTHS = [64, 48, 96, 56, 80];

const options = {
  "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
  "justify-content": ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"],
  "align-items": ["stretch", "flex-start", "center", "flex-end", "baseline"],
  "flex-wrap": ["nowrap", "wrap", "wrap-reverse"],
};

const state = {
  "flex-direction": "row",
  "justify-content": "flex-start",
  "align-items": "stretch",
  "flex-wrap": "nowrap",
  growing: new Set(),
};

const clamp = (value, min, max, fallback) => {
  const number = parseInt(value, 10);
  return Number.isNaN(number) ? fallback : Math.min(max, Math.max(min, number));
}

const readGap = () => clamp(gapInput.value, 0, 64, 0);
const readCount = () => clamp(countInput.value, 1, MAX_ITEMS, 1);

const makeCssText = () => {
  const gap = readGap();
  const containerLines = [
    "  display: flex;",
    ...Object.keys(options).map(prop => `  ${prop}: ${state[prop]};`),
    `  gap: ${gap === 0 ? "0" : `${gap}px`};`,
  ];

  let css = `.container {\n${containerLines.join("\n")}\n}`;

  [...state.growing]
    .filter(index => index <= readCount())
    .sort((a, b) => a - b)
    .forEach(index => {
      css += `\n\n.item-${index} {\n  flex-grow: 1;\n}`;
    });

  return css;
}

const buildItems = () => {
  const count = readCount();
  preview.replaceChildren();

  for (let index = 1; index <= count; index++) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "flex-item";
    item.textContent = index;
    item.style.setProperty("--hue", (index * 37 + 250) % 360);
    item.style.minHeight = `${ITEM_HEIGHTS[(index - 1) % ITEM_HEIGHTS.length]}px`;
    item.style.minWidth = `${ITEM_WIDTHS[(index - 1) % ITEM_WIDTHS.length]}px`;
    item.setAttribute("aria-pressed", state.growing.has(index));
    item.title = "Toggle flex-grow: 1";

    item.addEventListener("click", () => {
      if (state.growing.has(index)) {
        state.growing.delete(index);
      } else {
        state.growing.add(index);
      }
      render();
      // Items are rebuilt on render, so keep keyboard focus on the same one
      preview.children[index - 1].focus();
    });

    preview.append(item);
  }
}

const render = () => {
  Object.keys(options).forEach(prop => preview.style.setProperty(prop, state[prop]));
  preview.style.gap = `${readGap()}px`;

  buildItems();
  [...preview.children].forEach((item, i) => {
    item.style.flexGrow = state.growing.has(i + 1) ? 1 : "";
  });

  codeOutput.textContent = makeCssText();
}

Object.entries(options).forEach(([prop, values]) => {
  buildChipGroup(optionsContainer, {
    name: prop,
    options: values,
    value: state[prop],
    onChange: value => {
      state[prop] = value;
      render();
    },
  });
});

gapInput.addEventListener("input", render);
countInput.addEventListener("input", render);

render();
