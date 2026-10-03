"use strict"

const preview = document.getElementById("grid-preview");
const colsInput = document.getElementById("grid-cols");
const rowsInput = document.getElementById("grid-rows");
const colGapInput = document.getElementById("grid-col-gap");
const rowGapInput = document.getElementById("grid-row-gap");
const clearButton = document.getElementById("grid-clear");
const codeOutput = document.getElementById("grid-code");

// Items use 1-based, inclusive cell coordinates
let items = [
  { colStart: 1, rowStart: 1, colEnd: 2, rowEnd: 1 },
  { colStart: 4, rowStart: 1, colEnd: 4, rowEnd: 3 },
];

let drag = null;

const clamp = (value, min, max, fallback) => {
  const number = parseInt(value, 10);
  return Number.isNaN(number) ? fallback : Math.min(max, Math.max(min, number));
}

const readSettings = () => ({
  cols: clamp(colsInput.value, 1, 12, 1),
  rows: clamp(rowsInput.value, 1, 12, 1),
  colGap: clamp(colGapInput.value, 0, 64, 0),
  rowGap: clamp(rowGapInput.value, 0, 64, 0),
});

const px = value => (value === 0 ? "0" : `${value}px`);

// Normalizes a drag (which can go in any direction) into start/end cells
const toArea = (a, b) => ({
  colStart: Math.min(a.col, b.col),
  colEnd: Math.max(a.col, b.col),
  rowStart: Math.min(a.row, b.row),
  rowEnd: Math.max(a.row, b.row),
});

const placeOnGrid = (element, area) => {
  element.style.gridColumn = `${area.colStart} / ${area.colEnd + 1}`;
  element.style.gridRow = `${area.rowStart} / ${area.rowEnd + 1}`;
}

const makeCssText = () => {
  const { cols, rows, colGap, rowGap } = readSettings();
  const gap = colGap === rowGap ? px(colGap) : `${px(rowGap)} ${px(colGap)}`;

  let css = [
    ".container {",
    "  display: grid;",
    `  grid-template-columns: repeat(${cols}, 1fr);`,
    `  grid-template-rows: repeat(${rows}, 1fr);`,
    `  gap: ${gap};`,
    "}",
  ].join("\n");

  items.forEach((area, i) => {
    css += `\n\n.item-${i + 1} {\n`
      + `  grid-column: ${area.colStart} / ${area.colEnd + 1};\n`
      + `  grid-row: ${area.rowStart} / ${area.rowEnd + 1};\n}`;
  });

  return css;
}

// Drops items that no longer fit and trims the ones that partly fit
const fitItems = (cols, rows) => {
  items = items
    .filter(area => area.colStart <= cols && area.rowStart <= rows)
    .map(area => ({
      ...area,
      colEnd: Math.min(area.colEnd, cols),
      rowEnd: Math.min(area.rowEnd, rows),
    }));
}

const render = () => {
  const { cols, rows, colGap, rowGap } = readSettings();
  fitItems(cols, rows);

  preview.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  preview.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  preview.style.columnGap = `${colGap}px`;
  preview.style.rowGap = `${rowGap}px`;
  preview.style.minHeight = `${Math.max(260, rows * 64)}px`;
  preview.replaceChildren();

  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= cols; col++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.dataset.col = col;
      cell.dataset.row = row;
      placeOnGrid(cell, { colStart: col, colEnd: col, rowStart: row, rowEnd: row });
      preview.append(cell);
    }
  }

  items.forEach((area, i) => {
    const item = document.createElement("div");
    item.className = "grid-item";
    item.style.setProperty("--hue", ((i + 1) * 47 + 250) % 360);
    placeOnGrid(item, area);

    const label = document.createElement("span");
    label.textContent = `.item-${i + 1}`;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "grid-remove";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove item ${i + 1}`);
    remove.addEventListener("pointerdown", event => event.stopPropagation());
    remove.addEventListener("click", () => {
      items.splice(i, 1);
      render();
    });

    item.append(label, remove);
    preview.append(item);
  });

  codeOutput.textContent = makeCssText();
}

// Items sit on top of cells, so look through them for the cell under the pointer
const cellAt = (x, y) => {
  const cell = document.elementsFromPoint(x, y)
    .find(element => element.classList.contains("grid-cell"));

  return cell ? { col: Number(cell.dataset.col), row: Number(cell.dataset.row) } : null;
}

const showSelection = () => {
  let selection = preview.querySelector(".grid-selection");

  if (!selection) {
    selection = document.createElement("div");
    selection.className = "grid-selection";
    preview.append(selection);
  }

  placeOnGrid(selection, toArea(drag.start, drag.end));
}

preview.addEventListener("pointerdown", event => {
  const cell = cellAt(event.clientX, event.clientY);

  if (!cell) {
    return;
  }

  event.preventDefault();
  drag = { start: cell, end: cell };
  preview.setPointerCapture(event.pointerId);
  showSelection();
});

preview.addEventListener("pointermove", event => {
  if (!drag) {
    return;
  }

  const cell = cellAt(event.clientX, event.clientY);

  if (cell) {
    drag.end = cell;
    showSelection();
  }
});

const finishDrag = () => {
  if (!drag) {
    return;
  }

  items.push(toArea(drag.start, drag.end));
  drag = null;
  render();
}

preview.addEventListener("pointerup", finishDrag);
preview.addEventListener("pointercancel", () => {
  drag = null;
  render();
});

clearButton.addEventListener("click", () => {
  items = [];
  render();
});

[colsInput, rowsInput, colGapInput, rowGapInput].forEach(input => {
  input.addEventListener("input", render);
});

render();
