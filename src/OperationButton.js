import { ACTIONS } from "./App"

export default function OperationButton({ dispatch, operation}) {
    return <button 
                onClick={() => dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation } })} //instead of add_digit, we'll be specifying the operation we've chosen here 
                >
                {operation}
            </button>
}