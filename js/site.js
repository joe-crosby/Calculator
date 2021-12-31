const numberRegex = /(?<!\d)-?[\d\.]+/g;
const addRegex = /(?<!\d)-?[\d\.]+[\+]-?[\d\.]+/g;
const subtractRegex = /(?<!\d)-?[\d\.]+[\-]-?[\d\.]+/g;
const inParenthesisRegex = /\([^\)\(]+[\/*+\-\d]+\)/g;
const singleValueInParenthesisRegex = /\([\-]{0,1}[\d\.]+\)/g;
const impliedOpenOperator = /\d+\(/g;
const impliedCloseOperator = /\)\d+/g;
const separator = ": ";

const multiplyDivideRegex = /(?<!\d)-?[\d\.]+[\*\/]-?[\d\.]+/g;
const additionSubtractionRegex = /(?<!\d)-?[\d\.]+[\+\-]-?[\d\.]+/g;

let displayIsCalculated = false;

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
    return processOperations(expression);
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

function setError(val){
  document.getElementById('errors').innerText = val;
}

function initialize(){
  document.addEventListener('keydown', keyDown);

  for(const btn of document.querySelectorAll("input[type='button'], button")){
    btn.addEventListener('click', btnClicked);
  };
}

function getByClass(n){
  let elements = document.getElementsByClassName(n);
  return elements.length ? elements[0] : null;
}

function clearScreen(){
  getByClass('display').innerHTML = null;
}

function addExpression(){
  // get the display screen and add a new div
  let display = getByClass('display');

  let previousExpression = getByClass('currentExpression');
  if (previousExpression)
    previousExpression.classList.remove('currentExpression');

  let currentExpression = document.createElement('p');
  currentExpression.classList.add('expression', 'currentExpression');
  display.appendChild(currentExpression);
}

function addResult(val){
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
  e.scrollIntoView(false);
}

function getCurrentExpression(){
  let cde = getCurrentDisplayElement();
  if (!cde || !cde.classList.contains('currentExpression')){
    addExpression();
  }

  return getByClass('currentExpression');
}

function getCurrentDisplayElement(){
  return getByClass('display').lastElementChild;
}

function calculateDisplay(exp){
  try {
    addResult().innerText = calculate(exp);
    scrollToBottom();
  } catch (e) {
    setError(e);
  }
}

function keyDown(e){
  if(process(e.key))
    e.preventDefault();
}

function btnClicked(e){
  if (e.currentTarget)
    process(e.currentTarget.value);
}

function process(inputValue){
  setError(null);

  let display = getCurrentExpression();

  // Calculate the expression in the display
  if (inputValue === 'Enter'){
    // if not properly closed expression throw
    let isValid = display.innerText.match(/[\d\)]+$/g);
    if (isValid){
      let cr = getByClass('currentResult');
      let exp = !cr ? display.innerText : display.innerText.replace('ans', getByClass('currentResult').innerText);
      calculateDisplay(exp);
    }
    else{
      setError('The end of the expression is invalid.');
    }
    return;
  }

  // Clear the display
  if (inputValue === 'Escape'){
    clearScreen();
    return;
  }

  let validKeyRegex = /[\d\.\*\+\-\/\(\)]+/g;

  let keyIsValid = inputValue.match(validKeyRegex);
  let isBackspace = inputValue === 'Backspace' || inputValue === 'Delete';

  if(keyIsValid || isBackspace){
    processKey(display, inputValue, isBackspace);
    return true;
  }

  scrollToBottom();
}

function processKey(display, key, isBackspace){
  if(isBackspace){
    // Remove the previously entered character
    if (display.innerText)
      display.innerText = display.innerText.slice(0, -1);
  }
  else {
    if (!validateKey(display, key))
      return;

    display.innerText += key;
  }
}

function addPrefix(display, val){
  display.innerText += val;
}

function validateKey(display, key){
  let operatorRegex = /[\.\*\+\-\/]/g;
  let lastInstanceContainsDotRegex = /[\/\*\-\+]*\d*\.+\d*$/g;
  let lastChar = display.innerText.length >= 1 ? display.innerText.charAt(display.innerText.length - 1) : null;
  let secondLastChar = display.innerText.length >= 2 ? display.innerText.charAt(display.innerText.length - 2) : null;
  let lastCharIsOperator = lastChar ? lastChar.match(operatorRegex) : null;
  let secondLastCharIsOperator = secondLastChar ? secondLastChar.match(operatorRegex) : null;
  let keyIsOperator = key.match(operatorRegex);

  // Do not allow empty parenthesis
  if (lastChar === '(' && key === ')'){
    return;
  }

  // Do not allow closing parenthesis after an operator character
  if (lastCharIsOperator && key === ')'){
    return;
  }

  // TODO :: put this in a function so we can prevent calculation when the opening and closing lengths are not equal.
  
  // Do not allow closing parenthesis if parenthesis are not open
  let open = display.innerText.match(/\(/g);
  let close = display.innerText.match(/\)/g);
  let openLen = open ? open.length : 0;
  let closeLen = close ? close.length : 0;
  let isOpen = Number(openLen) > Number(closeLen);

  if (!isOpen && key === ')'){
    return;
  }

  // Do not allow multiple operator characters in a row
  if (keyIsOperator && lastCharIsOperator && key !== '-') {
    return;
  }

  // When a negative symbol is used for a number, do not allow more than 2 operators
  if (keyIsOperator && secondLastCharIsOperator && lastCharIsOperator){
    return;
  }

  // Do not allow operators after an open parenthesis, unless it is a negative number operator
  if (keyIsOperator && lastChar === '(' && key !== '-' && key !== '('){
    return;
  }

  // Allow operators before an open parenthesis
  if (keyIsOperator && lastCharIsOperator && secondLastChar === '('){
    return;
  }

  // Do not allow more than 1 decimal point per number
  if (display.innerText.match(lastInstanceContainsDotRegex) && key === '.'){
    return;
  }

  if (keyIsOperator && !display.innerText){
    // add 'ans' prefix
    addPrefix(display, 'ans');
  }

  return true;
}

initialize();
