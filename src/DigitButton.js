import { ACTIONS } from "./App"

export default function DigitButton({ dispatch, digit}) { //this DigitButton is going to take in a single prop, our digit, and pass in the dispatch so we can call the reducer from here
    return <button 
                onClick={() => dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit } })} //essentially we'll be returning our DigitButton.  Actions have to be imported because under dispatch type, we have to specify which action is being taken.
                >
                {digit}
            </button>
}