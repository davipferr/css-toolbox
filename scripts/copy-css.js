
import getOneElement from "./util/filterNodeList.js";
import showToast from "./util/toast.js";

const button = document.getElementById("copy-button");

const borderProperties = [
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
]

button.addEventListener("click", function () {

  let spans = [];
  let inputs = [];

  borderProperties.forEach(cssStyle => {
    let getSpan = getOneElement("id", cssStyle, "SPAN");
    let getInput = getOneElement("id", cssStyle, "INPUT");
  
    if (getSpan) {
      spans.push(getSpan);
    }
    
    if (getInput){
      inputs.push(getInput);
    }
  });

  let cssText = makeCssText(spans, inputs);
  copyToClipboard(cssText);
})

const makeCssText = (arrayOfTexts, arrayOfvalues) => {
  let result = "";

  for (let i = 0; i < arrayOfTexts.length; i++)
  {
    result += `${arrayOfTexts[i].textContent} ${arrayOfvalues[i].value}%;\n`;
  }
  
  return result;
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  showToast("Copiado!");
}
