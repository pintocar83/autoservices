import React from 'react';
import { Provider } from 'react-native-paper';
import { uiTheme } from './App/uiComponent';
import { AutoServiceProvider }  from './App/hooks';
import Main from './App/Main';

function App(): JSX.Element {
  return (
    <AutoServiceProvider>
      <Provider theme={uiTheme}>
        <Main />
      </Provider>
    </AutoServiceProvider>
  );
}

export default App;
