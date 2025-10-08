// App.tsx
import 'react-native-gesture-handler';
import './src/lib/firebase'; // <<< ensure initializeAuth runs before screens

import React from 'react';
// App.tsx / index.ts
import "./global.css";

import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';

import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </Provider>
  );
}
