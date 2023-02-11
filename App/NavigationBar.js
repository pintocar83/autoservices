import React from 'react';
import { Appbar, Menu } from 'react-native-paper';
import { dbDelete, dbBackup, dbBackupJSON, dbRestoreJSON }  from './db';

export default function NavigationBar({ navigation, back }) {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Appbar.Header>
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
          <Menu.Item onPress={() => {closeMenu(); navigation.navigate('Status.Index')}} title="Status" />
          <Menu.Item onPress={() => {closeMenu(); navigation.navigate('Kilometer.Index')}} title="Kilometers" />
          <Menu.Item onPress={() => {closeMenu(); navigation.navigate('Service.Index')}} title="Services" />
          <Menu.Item onPress={() => {closeMenu(); navigation.navigate('ServiceType.Index')}} title="Service Types" />
          <Menu.Item onPress={() => {closeMenu(); navigation.navigate('Automobile.Index')}} title="Automobiles" />
          { false && <Menu.Item onPress={() => {closeMenu(); dbDelete()}} title="Database Restart" /> }
          { false && <Menu.Item onPress={() => {closeMenu(); dbBackup()}} title="Database Backup" /> }
          <Menu.Item onPress={() => {closeMenu(); dbBackupJSON()}} title="Database Backup JSON" />
          <Menu.Item onPress={() => {closeMenu(); dbRestoreJSON()}} title="Database Restore JSON" />
        </Menu>
      ) : null}
    </Appbar.Header>
  );
}
