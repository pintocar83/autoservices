import {createContext, useReducer, useContext} from 'react';

const defaultState = {
  automobile: {},
  filterTimelime: {},
};
const stateContext = createContext(defaultState);
const dispatchStateContext = createContext(undefined);

export const AutoServiceProvider = ({children}) => {
  const [state, dispatch] = useReducer(
    (state, newValue) => ({...state, ...newValue}),
    defaultState,
  );
  return (
    <stateContext.Provider value={state}>
      <dispatchStateContext.Provider value={dispatch}>
        {children}
      </dispatchStateContext.Provider>
    </stateContext.Provider>
  );
};

export const useAutoServiceState = () => [
  useContext(stateContext),
  useContext(dispatchStateContext),
];
