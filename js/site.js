const numberRegex = /(?<!\d)-?[\d\.]+/g;
const addRegex = /(?<!\d)-?\d+[+]-?[\d\.]+/g;
const subtractRegex = /(?<!\d)-?\d+[-]-?[\d\.]+/g;
const multiplyRegex = /(?<!\d)-?\d+[*]-?[\d\.]+/g;
const divideRegex = /(?<!\d)-?\d+[\/]-?[\d\.]+/g;
const inParenthesisRegex = /\([^\)\(]+[\/*+\-\d]+\)/g;
const singleValueInParenthesisRegex = /\([\-]{0,1}[\d\.]+\)/g;
const impliedOpenOperator = /\d+\(/g;
const impliedCloseOperator = /\)\d+/g;
const separator = ": ";

let expressionArray = [];

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
        if (Number(num) === 0)
          return 'Invalid Opreation: Cannot divide by zero';

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
  let matches = expression.match(multiplyRegex);
  while (matches){
    matches.forEach(m => {
      expression = expression.replace(m, operate(m, '*'));
      console.log(expression);
    });
    matches = expression.match(multiplyRegex);
  }

  matches = expression.match(divideRegex);
  while (matches){
    matches.forEach(m => {
      expression = expression.replace(m, operate(m, '/'));
      console.log(expression);
    });
    matches = expression.match(divideRegex);
  }

  matches = expression.match(addRegex);
  while (matches){
    matches.forEach(m => {
      expression = expression.replace(m, operate(m, '+'));
      console.log(expression);
    });
    matches = expression.match(addRegex);
  }

  matches = expression.match(subtractRegex);
  while (matches){
    matches.forEach(m => {
      expression = expression.replace(m, operate(m, '-'));
      console.log(expression);
    });
    matches = expression.match(subtractRegex);
  }

  // Remove parenthesis with single values
  let singles = expression.match(singleValueInParenthesisRegex);
  if (singles){
    singles.forEach(item => {
      expression = expression.replace(item, item.replace('(', '').replace(')', ''));
      console.log(expression);
    });
  }

  return expression;
}

//-18(-4*5-2)*4+16-8/-15(-18(3*5-2)*-4+16-8/-15)
alert(calculate(prompt("Enter an expression for testing.")));
