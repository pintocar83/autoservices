import React from 'react';
import { Appbar, Menu } from 'react-native-paper';
import { dbDelete }  from './db';

export default function NavigationBar({ navigation, back }) {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Appbar.Header
      style={{
          backgroundColor: '#ffff80'
        }}
      >
      {back ? <Appbar.BackAction color="#000000" onPress={navigation.goBack} /> : null}
      <Appbar.Content
        title="Auto Services"
        color="#000000"
        />
      {!back ? (
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <Appbar.Action icon="menu" color="#000000" onPress={openMenu} />
          }>
          <Menu.Item onPress={() => {closeMenu(); navigation.navigate('Automobile.Index')}} title="Automobiles" />
          <Menu.Item onPress={() => {closeMenu(); navigation.navigate('ServiceType.Index')}} title="Service Types" />
          <Menu.Item onPress={() => {closeMenu(); navigation.navigate('Kilometer.Index')}} title="Kilometers Traveled" />
          <Menu.Item onPress={() => {closeMenu(); navigation.navigate('Service.Index')}} title="Services" />
          <Menu.Item onPress={() => {closeMenu(); dbDelete()}} title="Database Restart" />
        </Menu>
      ) : null}
    </Appbar.Header>
  );
}
