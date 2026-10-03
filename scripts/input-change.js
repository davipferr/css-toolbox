const inputs = document.querySelectorAll(`#change-css input`);

const boxRadius = document.querySelectorAll(".box-radius");

inputs.forEach(input => {
  input.addEventListener("input", function () {
    // id = css property
    let id = this.id;
    let value = this.value;
    changeCssProps(id, value);
  });
});
const changeCssProps = (id, value) => {
  value = value.toString();
  value += '%';

  let styleProp = toStyleProp(id);

  boxRadius[0].style[styleProp] = value;
}

const toStyleProp = (cssStyle) => {
  let formatedText = "";

  for (let i = 0; i < cssStyle.length; i++)
  {
    if (cssStyle[i] === '-') {

      formatedText += cssStyle[i+1].toUpperCase();

      i += 2;
    }

    formatedText += cssStyle[i];
  }

  return formatedText;
}
