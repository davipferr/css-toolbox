"use strict"

const sides = ["top", "right", "bottom", "left"];

const stage = document.getElementById("bm-stage");
const marginLayer = stage.querySelector(".bm-margin");
const paddingLayer = stage.querySelector(".bm-padding");
const codeOutput = document.getElementById("spacing-code");

// Smallest width (px) the content box may shrink to inside the diagram
const MIN_CONTENT_WIDTH = 80;

const groups = [...document.querySelectorAll(".side-group")].map(fieldset => ({
  prop: fieldset.dataset.prop,
  inputs: [...fieldset.querySelectorAll("input[data-side]")],
  link: fieldset.querySelector(".link-input"),
}));

const readValues = group => {
  const values = {};

  group.inputs.forEach(input => {
    const value = parseInt(input.value, 10);
    values[input.dataset.side] = Number.isNaN(value) ? 0 : Math.max(0, value);
  });

  return values;
}

// Turns {top, right, bottom, left} into the shortest valid CSS shorthand
const toShorthand = ({ top, right, bottom, left }) => {
  const px = value => (value === 0 ? "0" : `${value}px`);

  if (top === bottom && right === left) {
    return top === right ? px(top) : `${px(top)} ${px(right)}`;
  }

  if (right === left) {
    return `${px(top)} ${px(right)} ${px(bottom)}`;
  }

  return `${px(top)} ${px(right)} ${px(bottom)} ${px(left)}`;
}

const makeCssText = () => {
  const lines = groups.map(group => `  ${group.prop}: ${toShorthand(readValues(group))};`);
  return `.element {\n${lines.join("\n")}\n}`;
}

// Shrinks the diagram on narrow screens so big values still fit
const getScale = (margin, padding) => {
  const available = stage.clientWidth
    - parseFloat(getComputedStyle(stage).paddingLeft) * 2;
  const needed = margin.left + margin.right + padding.left + padding.right;

  if (needed === 0) {
    return 1;
  }

  return Math.min(1, Math.max(0, available - MIN_CONTENT_WIDTH) / needed);
}

const applyLayer = (layer, prop, values, scale) => {
  sides.forEach(side => {
    const size = values[side] * scale;
    layer.style.setProperty(`padding-${side}`, `${size}px`);

    const label = layer.querySelector(`:scope > .bm-val[data-prop="${prop}"][data-side="${side}"]`);
    label.textContent = values[side];
    label.style.setProperty("--band", `${size}px`);
    // Hide the number when its band is too thin to read
    label.classList.toggle("is-hidden", size < 14);
  });
}

const render = () => {
  const [marginGroup, paddingGroup] = groups;
  const margin = readValues(marginGroup);
  const padding = readValues(paddingGroup);
  const scale = getScale(margin, padding);

  applyLayer(marginLayer, "margin", margin, scale);
  applyLayer(paddingLayer, "padding", padding, scale);

  codeOutput.textContent = makeCssText();
}

groups.forEach(group => {
  group.inputs.forEach(input => {
    input.addEventListener("input", () => {
      if (group.link.checked) {
        group.inputs.forEach(other => (other.value = input.value));
      }
      render();
    });
  });

  group.link.addEventListener("change", () => {
    if (group.link.checked) {
      group.inputs.forEach(other => (other.value = group.inputs[0].value));
      render();
    }
  });
});

// Re-render when the stage size changes (window resize or tab becoming visible)
new ResizeObserver(render).observe(stage);

render();
