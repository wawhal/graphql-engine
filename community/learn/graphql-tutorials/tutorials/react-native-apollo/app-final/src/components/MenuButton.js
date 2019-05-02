import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';

const MenuButton = ({ onClick }) => {
  console.log('onclick of menu button');
  console.log(onClick);
  return (
    <TouchableOpacity  style={{marginLeft: 20}} onClick={onClick}>
      <Icon
        name="menu"
        size={26}
        style={{ marginBottom: -3 }}
      />
    </TouchableOpacity>
  )
}

export default MenuButton;