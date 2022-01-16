const numberRegex = /(?<!\d)-?[\d\.]+/g;
const inParenthesisRegex = /\([^\)\(]+[\/*+\-\d]+\)/g;
const singleValueInParenthesisRegex = /\([\-]{0,1}[\d\.]+\)/g;
const impliedOpenOperator = /\d+\(/g;
const impliedCloseOperator = /\)\d+/g;
const operatorRegex = /[\/\*\-\+]/g;
const syntaxError = "Syntax Error";

const multiplyDivideRegex = /(?<!\d)-?[\d\.]+[\*\/]-?[\d\.]+/g;
const additionSubtractionRegex = /(?<!\d)-?[\d\.]+[\+\-]-?[\d\.]+/g;

let advancedFeaturesEnabled = false;

function operate(expression, operator){
  let numbers = expression.match(numberRegex);

  switch(operator){
    case '+':
      return numbers.reduce((total, num) => {
    	   return total + Number(num);
      }, 0); // Default value of numeric value so the string concatenation does not happen inadvertently.
      break;
    case '-':
      return numbers.reduce((total, num) => {
         return total - Number(num);
      });
      break;
    case '*':
      return numbers.reduce((total, num) => {
         return total * Number(num);
      });
      break;
    case '/':
      return numbers.reduce((total, num) => {
        if (Number(num) === 0){
          throw 'Invalid Operation: Cannot divide by zero';
        }

         return total / Number(num);
      });
      break;
  }
}

function setImpliedValues(expression){
  // Add necessary implied operators
  let implied = expression.match(impliedOpenOperator);
  if (implied){
    implied.forEach(i => {
      let newVal = i.replace("(", "*(");
      expression = expression.replace(i, newVal);
    });
  }

  implied = expression.match(impliedCloseOperator);
  if (implied){
    implied.forEach(i => {
      let newVal = i.replace(")", ")*");
      expression = expression.replace(i, newVal);
    });
  }

  return expression;
}

function calculate(expression){
  console.log(expression);
  expression = setImpliedValues(expression);
  // Everything between parenthesis.
  let l1 = expression.match(inParenthesisRegex);
  if (l1){
    let matches;
    l1.forEach(item => {
      expression = expression.replace(item, processOperations(item));
    });
  }
  else {
    let inValidResultRegex = /[^\-\d\.e]+/g;

    let result = processOperations(expression);

    if (result.match(inValidResultRegex))
      throw syntaxError;

      return result;
  }

  // Recursive call
  return calculate(expression);
}

function processOperations(expression){
  let matches = expression.match(multiplyDivideRegex);
  // Multiplication and division
  while (matches){
    matches.forEach(m => {
      expression = expression.replace(m, operate(m, m.includes('*') ? '*' : '/'));
      console.log(expression);
    });
    matches = expression.match(multiplyDivideRegex);
  }
  // Addition and subtraction
  matches = expression.match(additionSubtractionRegex);
  while (matches){
    matches.forEach(m => {
      expression = expression.replace(m, operate(m, m.includes('+') ? '+' : '-'));
      console.log(expression);
    });
    matches = expression.match(additionSubtractionRegex);
  }

  // Remove parenthesis from around single values
  let singles = expression.match(singleValueInParenthesisRegex);
  if (singles){
    singles.forEach(item => {
      expression = expression.replace(item, item.replace('(', '').replace(')', ''));
      console.log(expression);
    });
  }

  return expression;
}
/*
//-18(-4*5-2)*4+16-8/-15(-18(3*5-2)*-4+16-8/-15)
alert(calculate(prompt("Enter an expression for testing.")));
*/

function setError(err){
  let display = getByClass('display');

  if (err){
    let error = document.createElement('p');
    error.classList.add('error');
    error.innerText = err;
    display.appendChild(error);
  }
  else {
    let err = display.querySelector('.error:last-child');
    if (err)
      display.removeChild(err);
  }
}

function initialize(){
  document.addEventListener('keydown', keyDown);

  for(const btn of document.querySelectorAll("input[type='button'], button")){
    if (btn.classList.contains('option')){
      btn.addEventListener('click', optionClicked);
    }
    else {
      btn.addEventListener('click', btnClicked);
    }
  };
}

function getByClass(n){
  let elements = document.getElementsByClassName(n);
  return elements.length ? elements[0] : null;
}

function clearScreen(){
  getByClass('display').innerHTML = null;
}

function addExpressionElement(){
  // get the display screen and add a new div
  let display = getByClass('display');

  let previousExpression = getByClass('currentExpression');
  if (previousExpression)
    previousExpression.classList.remove('currentExpression');

  let currentExpression = document.createElement('p');
  currentExpression.classList.add('expression', 'currentExpression');
  display.appendChild(currentExpression);
}

function addResultElement(val){
  // get the display screen and add a new div
  let display = getByClass('display');

  let previousResult = getByClass('currentResult');
  if (previousResult)
    previousResult.classList.remove('currentResult');

  let currentResult = document.createElement('p');
  currentResult.classList.add('result', 'currentResult');

  display.appendChild(currentResult);

  return currentResult;
}

function scrollToBottom(){
  let e = getCurrentDisplayElement();
  if (e){
    e.scrollIntoView(false);
  }
}

function getCurrentExpressionElement(){
  let cde = getCurrentDisplayElement();
  if (!cde || !cde.classList.contains('currentExpression')){
    addExpressionElement();
  }

  return getByClass('currentExpression');
}

function getCurrentDisplayElement(){
  return getByClass('display').lastElementChild;
}

function calculateDisplay(exp){
  try {
    let result = calculate(exp);
    addResultElement().innerText = result;
    scrollToBottom();
  } catch (e) {
    setError(e);
  }
}

function keyDown(e){
  // testing press the correct button to process the action
  let val = e.key == 'Backspace' ? 'Delete' : e.key;
  let btn = document.getElementById(val);
  if (!btn)
    return;

  document.activeElement = null;
  transform(btn);
  btn.click();
}

function btnClicked(e){
  if (e.currentTarget)
    process(e.currentTarget.value);
}

function transform(e){
  e.classList.add('transform');
  let timer = setTimeout(function () {
    e.classList.remove('transform');
    clearTimeout(timer);
  }, 200);
}

function getExpression(val){
  return !getByClass('currentResult') ? val.innerText : val.innerText.replace('ans', getByClass('currentResult').innerText);
}

function process(inputValue){
  try{
    setError(null);

    let display = getCurrentExpressionElement();
    let currentResult = getByClass('currentResult');

    // Calculate the expression in the display
    if (inputValue === 'Enter'){
      if (display.innerText.length <= 0)
        return;

      // if not properly closed expression throw
      let isValid = display.innerText.match(/[\d\)]+$/g);
      if (isValid){
        calculateDisplay(getExpression(display));
      }
      else{
        setError(syntaxError);
      }
      return;
    }

    // Clear the display
    if (inputValue === 'Escape'){
      clearScreen();
      return;
    }

    let validSingleExpressionRegex = /[[^\/\*\-\+]\d*\.?\d+|ans][\/\*\-\+]+\d*\.?\d+$/g;

    if (!advancedFeaturesEnabled && display.innerText.match(validSingleExpressionRegex) && inputValue.match(/[\/\*\-\+]/g)){
      calculateDisplay(getExpression(display));

      // add 'ans' prefix
      appendDisplayValue(getCurrentExpressionElement(), 'ans' + inputValue);
      return;
    }

    let validKeyRegex = advancedFeaturesEnabled ? /[\d\.\*\+\-\/\(\)]+/g : /[\d\.\*\+\-\/]+/g;

    let keyIsValid = inputValue.match(validKeyRegex);
    let isBackspace = inputValue === 'Backspace' || inputValue === 'Delete';

    if(keyIsValid || isBackspace){
      processKey(display, inputValue, isBackspace);
      return true;
    }
  }
  finally {
      scrollToBottom();
  }
}

function processKey(display, key, isBackspace){
  if(isBackspace){
    // Remove the previously entered character
    if (display.innerText)
      display.innerText = display.innerText.slice(0, -1);
  }
  else {
    let newVal = display.innerText + key;
    // if not a valid expression do not add the character.
    let invalidExpressionRegex = /[\.\/\*\+]{2,}|\(\)|\d*\.\d+\.|[\/\*\-\+]\-{2,}|-[\/\*\+]/g;
    if (newVal.match(invalidExpressionRegex))
      return;

    let addToExistingAnswer = display.innerText.length <= 0 && getByClass('currentResult');
    if(addToExistingAnswer && key.match(operatorRegex))
      key = 'ans' + key;

    appendDisplayValue(display, key);
  }
}

function appendDisplayValue(display, val){
  display.innerText += val;
}

function optionClicked(e){
  let element = e.currentTarget;
  if (!element.classList.contains('active-option')){
    let options = document.getElementsByClassName('active-option');
    for (let o of options){
      o.classList.remove('active-option');
    }

    element.classList.add('active-option');
  }

  advancedFeaturesEnabled = element.id === 'advanced';
  let advanced = document.getElementsByClassName('advanced-feature');
  for (let a of advanced){
    a.disabled = element.id !== 'advanced';
  }
}

initialize();
