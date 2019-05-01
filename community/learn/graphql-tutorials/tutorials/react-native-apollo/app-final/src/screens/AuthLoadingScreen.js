import React from 'react';
import {
  AsyncStorage,
  View,
} from 'react-native';
import CenterSpinner from './components/CenterSpinner';

console.disableYellowBox = true;

export default class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount () {
    // Find session in storage and redirect accordingly
    await this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    // Fetch token from storage
    const session = await AsyncStorage.getItem('@todo-graphql:auth0');
    // If session exists, validate it, else redirect to login screen
    if (session) {
      const sessionObj = JSON.parse(session);
      var currentTime = Math.floor(new Date().getTime() / 1000);
      if (currentTime < sessionObj.exp) {
        console.log('Navigating to main');
        console.log(this.props.navigation);
        this.props.navigation.navigate('Main');
      } else {
        console.log('Navigating to auth');
        this.props.navigation.navigate('Auth');
      }
    } else {
      console.log('Navigating to auth');
      this.props.navigation.navigate('Auth');
    }
  };

  render() {
    console.log(this.props);
    console.log('props');
    return (
      <View>
        <CenterSpinner />
      </View>
    );
  }
}

