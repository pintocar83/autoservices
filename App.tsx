import React from 'react';
import { Provider } from 'react-native-paper';

import { uiTheme } from './App/uiComponent';
import Main from './App/Main';


function App(): JSX.Element {
  return (
    <Provider theme={uiTheme}>
      <Main />
    </Provider>
  );
}

export default App;
