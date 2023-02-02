import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, FAB, DefaultTheme, Button, Dialog, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export const AddButton = (props) => {
  return (
    <FAB
      mode="flat"
      color="white"
      icon="plus-thick"
      size="small"
      style={uiStyle.fab}
      {...props}
    />
  );
}

export const AcceptButton = (props) => {
  return (
    <FAB
      mode="flat"
      color="white"
      icon="check-bold"
      size="small"
      style={uiStyle.fab}
      {...props}
    />
  );
}

export const ActionBar = (props) => {
  const BOTTOM_APPBAR_HEIGHT = 50;
  const { bottom } = useSafeAreaInsets();

  return (
    <Appbar
      style={{
        height: BOTTOM_APPBAR_HEIGHT + bottom,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: uiTheme.colors.elevation.level2
      }}
      safeAreaInsets={{ bottom }}
    >
      { props.onRefresh && <Appbar.Action icon="refresh" onPress={props.onRefresh} /> }
      { props.onEdit && <Appbar.Action icon="pencil" onPress={!props.disabledEdit ? props.onEdit : null} color={props.disabledEdit ? "#9e9e9e" : null} /> }
      { props.onDelete && <Appbar.Action icon="delete" onPress={!props.disabledDelete ? props.onDelete : null} color={props.disabledDelete ? "#9e9e9e" : null} /> }
      { props.onFavorite && <Appbar.Action icon="star" onPress={!props.disabledFavorite ? props.onFavorite : null} color={props.disabledFavorite ? "#9e9e9e" : null} /> }
      <View style={{ flex: 1 }} />
      { props.onAdd && <AddButton onPress={props.onAdd} /> }
      { props.onAccept && <AcceptButton onPress={props.onAccept} /> }
      { props.append }
    </Appbar>
  );
}

export const MsgBox = ({visible, setVisible, title, message, onDone}) => {
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  return (
    <Dialog visible={visible} onDismiss={hideDialog}>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Content>
        <Text variant="bodyMedium">{message}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button mode="contained" onPress={hideDialog}>Cancel</Button>
        <View style={{width:10}} />
        <Button mode="contained" onPress={() => {onDone(); hideDialog()}}>Done</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export const uiStyle = StyleSheet.create({
  fab: {
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#3f51b5'
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 50
  },

  scrollView: {
    backgroundColor: '#FFF', 
    marginHorizontal: 0,
    paddingHorizontal: 10,
  },

  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 40,
    marginBottom: 40
  },

  buttonActionForm: {
    minWidth: 100,
    borderRadius: 10
  },

  defaultWidth: {
    width: '100%',
    maxWidth: 500
  },

  w100: {
    width: '100%'
  },

  indexHeader: {
    fontWeight: '500',
    fontSize: 20,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20
  }
});

//console.log("DefaultTheme",DefaultTheme);

export const uiTheme = {
  ...DefaultTheme,
  colors: {
    primary: "rgb(0, 0, 0)",
    onPrimary: "rgb(255, 255, 255)",
    primaryContainer: "rgb(151, 240, 255)",
    onPrimaryContainer: "rgb(0, 31, 36)",
    secondary: "rgb(74, 98, 103)",
    onSecondary: "rgb(255, 255, 255)",
    secondaryContainer: "rgb(205, 231, 236)",
    onSecondaryContainer: "rgb(5, 31, 35)",
    tertiary: "rgb(82, 94, 125)",
    onTertiary: "rgb(255, 255, 255)",
    tertiaryContainer: "rgb(218, 226, 255)",
    onTertiaryContainer: "rgb(14, 27, 55)",
    error: "rgb(254, 67, 54)",
    onError: "rgb(255, 255, 255)",
    errorContainer: "rgb(255, 218, 214)",
    onErrorContainer: "rgb(65, 0, 2)",
    background: "rgb(250, 253, 253)",
    onBackground: "rgb(25, 28, 29)",
    surface: "rgb(250, 253, 253)",
    onSurface: "rgb(25, 28, 29)",
    surfaceVariant: "transparent",
    onSurfaceVariant: "rgb(63, 72, 74)",
    outline: "rgb(111, 121, 122)",
    outlineVariant: "rgb(191, 200, 202)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(46, 49, 50)",
    inverseOnSurface: "rgb(239, 241, 241)",
    inversePrimary: "rgb(79, 216, 235)",
    elevation: {
      level0: "transparent",
      level1: "rgb(238, 246, 246)",
      level2: "rgb(230, 241, 242)",
      level3: "rgb(255, 255, 255)",
      level4: "rgb(220, 235, 237)",
      level5: "rgb(215, 232, 234)"
    },
    surfaceDisabled: "rgba(25, 28, 29, 0.12)",
    onSurfaceDisabled: "rgba(25, 28, 29, 0.38)",
    backdrop: "rgba(41, 50, 52, 0.4)"
  }
};
