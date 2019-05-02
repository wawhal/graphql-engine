import React from 'react';
import TodoScreen from './TodoScreen';
import MenuButton from '../components/MenuButton';

export default class PrivateTodos extends React.Component {
  static navigationOptions = {
    headerTitle: 'Private Todos',
    headerLeft: (
      <MenuButton onClick={this.openDrawer}/> 
    )
  };

  openDrawer = () => {
    console.log('opening drawer');
    this.props.navigation.toggleDrawer();
  }

  render() {
    // return TodoScreen with prop isPublic as false
    return (
      <TodoScreen isPublic={false}/> 
    );
  }
}
