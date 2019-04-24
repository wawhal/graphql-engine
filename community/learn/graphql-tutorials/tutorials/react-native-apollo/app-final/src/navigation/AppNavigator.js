import React from 'react';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import AuthScreen from '../screens/AuthScreen';
import App from './DrawerNavigator';

const Navigator = createSwitchNavigator(
  {
    // For authentication
    Auth: AuthScreen,
    // For fetching and validating session
    Loading: AuthLoadingScreen,
    // Main app
    Main: ({navigation}) => <App screenProps={{rootNavigation: navigation}} />
  },
  {
    initialRouteName: 'Loading'
  } 
);

export default createAppContainer(Navigator);