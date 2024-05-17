import "./styles.css"
import logo from './logo.svg';
import './App.css';
import { useReducer } from "react"
import DigitButton from "./DigitButton";
import OperationButton from "./OperationButton";

export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete-digit',
  EVALUATE: 'evaluate'
}

// splitting the action between a type and payload b/c we know we're gonna have a bunch of diff actions, and diff types of those actions, and those actions will pass along those parameters.  
// now we just have to think of all the actions we should be able to take like 'ADD_DIGIT', clear, removing a digit, all the operators, and selecting numbers - these are handled by each of our 'cases' 
function reducer (state, {type, payload}) { 
  switch(type) { //allows for switching logic between diff types of actions 
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite) { //belongs to the overwrite in evaluation case,
        return {
          ...state, //returning new state object and then taking our current state and spreading it out 
          currentOperand: payload.digit, //we can now only influence the current thing we're typing on the calc -> 'currentOperand'.  The payload digit gets passed to the reducer.  This will create a brand new currentOperand or it'll add our digit onto the end of our currentOperand
          overwrite: false, 
        }
      }
      if (payload.digit === "0" && state.currentOperand === "0") { //handles the edge case of a user being able to enter multiple 0's following an original output of 0.
        return state
      } //makes it to where 0's can't be repeated 

      if (payload.digit === "." && state.currentOperand.includes(".")) { //handles the edge case of a user being able to enter multiple '.'s at any point in a number 
        return state
      } //so the decimal can't occur more than once in a float 

      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      }

    case ACTIONS.CHOOSE_OPERATION:
    if(state.currentOperand == null && state.previousOperand == null) { //Handles the case that a user chooses an operation without having any number selected 
        return state 
      }

    if (state.currentOperand == null) { //checks if current operand is equal to null, in the case that we select an operation we didn't mean to, we can now re-select the correct operation without wiping the output field
        return {
          ...state, 
          operation: payload.operation,
        }
      }

      if (state.previousOperand == null) { // if the previousOperand equals null, BUT our current operand is not equal to null (b/c we've already passes the first if check in this case) then we know the user has typed something without having anything else there. 
        return {
          ...state, //here we take our currentOperand, set it to previous and then set/save our operation that's selected. 
          operation: payload.operation, //setting operation to payload.operation (the thing we passed in)
          previousOperand: state.currentOperand, 
          currentOperand: null, 
        }
      } 

      return { //this is our default action 
        ...state, 
        previousOperand: evaluate(state), //previousOperand is what we want to evaluate (a function we created)
        operation: payload.operation, //instead of taking our current operand to set as the previous, we take our current and previous operand, calculate the operation via the evaluate function, then setting the sum as the previousOperand
        currentOperand: null
      }

    case ACTIONS.CLEAR:
    return {} // returns an empty state of the output field in the case that the clear button is clicked 
    case ACTIONS.DELETE_DIGIT: 
      if (state.overwrite) {
        return {
          ...state, //if state is in overwrite, we want to get rid of the currentOperand and return overwrite to false so we can continue the operation
          overwrite: false,
          currentOperand: null
        }
      }
      if (state.currentOperand == null) return state //if we don't have a current operand, we can't delete anything from it, so we return the current state 
      if (state.currentOperand.length === 1) { //this means there's only one digit left in our current operand, and we want to completely remove it
        return { ...state, currentOperand: null } //whenever we delete our final digit, we want to set it back to null so that we don't have an empty string in the output field
      }

      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1) //removes the last digit from the current operand, when there's more than one digit left
      }
    case ACTIONS.EVALUATE: //our default action 
      if (
        state.operation == null || //checking to make sure the values/info we need is present, if any is null, we'll return the current state - essentially not doing anything
        state.currentOperand == null || 
        state.previousOperand == null
      ) {
        return state 
      }

      return {
        ...state, //returns current state
        overwrite: true, //after an operation is performed, you shouldn't be able to add on numbers to the end of that sum.  This ensures that when you begin typing a new number after an evaluation, it will not tag it to the end of that sum but start another currentOperand
        previousOperand: null, 
        operation: null,
        currentOperand: evaluate(state), //sets currentOperand to the sum of the evaluation. 

      }
  }
}

function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand) //converts our strings to an actual number
  const current = parseFloat(currentOperand) //^ 
  if (isNaN(prev) || isNaN(current)) return "" //if prev or current are not a number, then we return an empty string. 
  let computation = "" //by default, our computation will result in nothing. 
  switch (operation) { //otherwise, if not = to 0, we're going to switch between different operations: 
    case "+":
      computation = prev + current
      break
    case "-":
      computation = prev - current
      break
    case "*":
      computation = prev * current
      break
    case "÷":
      computation = prev / current
      break //the break allows for the operation to take place once, as intended. 
  }

  return computation.toString() //convert back to string to display in the output field 
}

const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", { //this integer_formatter will be responsible for adding the commas 
  maximumFractionDigits: 0, //makes sure there's no fractions in this formatter so that any numbers following a decimal don't get formatted with commas or deleted if it's 0
})
function formatOperand(operand) {
  if (operand == null) return //makes sure we actually have an operant, if not then we return nothing
  const [integer, decimal] = operand.split('.') //grabs the integer and decimal portion by splitting it on the decimal
  if (decimal == null) return INTEGER_FORMATTER.format(integer) //if our decimal is = null, we don't have a decimal and all we want to do is apply the formatter to the integer. "formatOperand" must be added to the currentOperand and previousOperand in div
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}` //if there IS a decimal, this uses concatenation to apply the formatter to the integer portion, and tags the decimal value at the end with no formatting
}

function App() {
  const [ { currentOperand, previousOperand, operation }, dispatch] = useReducer( 
  reducer, 
    {}
  )
  // Your reducer will calculate and return the next state. React will store that next state, render your component with it, and update the UI. 
  // useReducer is very similar to useState , but it lets you move the state update logic from event handlers into a single function outside of your component.

  // dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: 1 }})
  return (
    <div className="calculator-grid">
      <div className="output"> {/*//output will include previous operand and current operand*/}
        <div className="previous-operand">
          {formatOperand(previousOperand)} {operation}
        </div> 
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button 
        className="span-two" 
        onClick={() => dispatch({ type: ACTIONS.CLEAR })}
      >
        AC {/* calls dispatch, passes dispatch a type, and the action will simply be clearing the output field */}
      </button>  
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>DEL</button>  
      <OperationButton operation="÷" dispatch={dispatch} /> {/* //this connects to OperationButton in a similar/same fashion as the DigitButtons */}
      <DigitButton digit="1" dispatch={dispatch} /> {/*//this dispatch is handled by DigitButton, same for the rest of the non-operatable buttons */}
      <DigitButton digit="2" dispatch={dispatch} /> 
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="*" dispatch={dispatch} />
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="+" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <button className="span-two" onClick={() => dispatch({ type: ACTIONS.EVALUATE })} //calls evaluate action, without passing in a payload as it's not necessary 
      >
        =
      </button>
    </div>
  )
}

export default App;
