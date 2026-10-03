// Builds a labelled row of radio "chips" for picking one CSS value
const buildChipGroup = (container, { name, options, value, onChange }) => {
  const row = document.createElement("div");
  row.className = "option-row";

  const label = document.createElement("span");
  label.className = "option-name";
  label.textContent = name;

  const group = document.createElement("div");
  group.className = "chip-group";
  group.setAttribute("role", "radiogroup");
  group.setAttribute("aria-label", name);

  options.forEach(option => {
    const chip = document.createElement("label");
    chip.className = "chip";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = `${container.id}-${name}`;
    input.value = option;
    input.checked = option === value;
    input.addEventListener("change", () => onChange(option));

    const text = document.createElement("span");
    text.textContent = option;

    chip.append(input, text);
    group.append(chip);
  });

  row.append(label, group);
  container.append(row);
}

export default buildChipGroup;
