import React from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Appbar, FAB, DefaultTheme, Button, Dialog, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
//import { SvgXml } from 'react-native-svg';
import Svg, {
  SvgXml
} from 'react-native-svg';


export const formatKm = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");


export const colorize = (c) => {
  switch(c){
    case "top-primary":          return "#212121";
    case "top-primary-inactive": return "rgba(255, 255, 255, .6)";
    case "primary":              return "#009ef7";
    case "success":              return "#50cd89";
    case "info":                 return "#7239ea";
    case "warning":              return "#ffc700";
    case "danger":               return "#f1416c";
    case "white":                return "#FFFFFF";
    case "light":
    case "gray-100":             return "#f9f9f9";
    case "gray-200":             return "#f4f4f4";
    case "secondary":
    case "gray-300":             return "#e1e3ea";
    case "gray-400":             return "#b5b5c3";
    case "text-muted":
    case "muted":
    case "gray-500":             return "#a1a5b7";
    case "gray-600":             return "#7e8299";
    case "gray-700":             return "#5e6278";
    case "gray-800":             return "#3f4254";
    case "gray-900":
    case "text-dark":
    case "dark":                 return "#181c32";
    case "bg-light-default":     return "#f5f8fa";
    case "bg-light-primary":     return "#f1faff";
    case "bg-light-success":     return "#e8fff3";
    case "bg-light-info":        return "#f8f5ff";
    case "bg-light-warning":     return "#fff8dd";
    case "bg-light-danger":      return "#fff5f8";
    case "pressable-warning":    return "rgba(255, 199, 0, .1)";
  }
  return "#a1a5b7";
};

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
        backgroundColor: props.transparent ? "transparent" : uiTheme.colors.elevation.level2
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

  floatingFab: {
    position: "absolute",
    backgroundColor: colorize("top-primary"),
    bottom: 15,
    right: 15,
    borderRadius: 30
  },

  floatingDeleteFab: {
    position: "absolute",
    backgroundColor: colorize("danger"),
    bottom: 19,
    left: 19,
    borderRadius: 30
  },

  floatingFabOld: {
    position: 'absolute',
    bottom: 20,
    //right: 0,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#3f51b5',

  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 0
  },

  scrollView: {
    //backgroundColor: '#FFF', 
    marginHorizontal: 0,
    paddingHorizontal: 10
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
    //custom consts
    //topBarNavigator: "#1a1a1a",
    topBarNavigator: colorize("top-primary"),

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
    backdrop: "rgba(41, 50, 52, 0.4)",
  }
};




export const SvgDuotune = {
  Find: (color) => {
    //let color = colorize(c);
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.7 18.9L18.6 15.8C17.9 16.9 16.9 17.9 15.8 18.6L18.9 21.7C19.3 22.1 19.9 22.1 20.3 21.7L21.7 20.3C22.1 19.9 22.1 19.3 21.7 18.9Z" fill="`+color+`"/>
        <path opacity="0.3" d="M11 20C6 20 2 16 2 11C2 6 6 2 11 2C16 2 20 6 20 11C20 16 16 20 11 20ZM11 4C7.1 4 4 7.1 4 11C4 14.9 7.1 18 11 18C14.9 18 18 14.9 18 11C18 7.1 14.9 4 11 4ZM8 11C8 9.3 9.3 8 11 8C11.6 8 12 7.6 12 7C12 6.4 11.6 6 11 6C8.2 6 6 8.2 6 11C6 11.6 6.4 12 7 12C7.6 12 8 11.6 8 11Z" fill="`+color+`"/>
      </svg>
    `;
  },

  Gauge: (color) => {
    //let color = colorize(c);
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.3" d="M22.0318 8.59998C22.0318 10.4 21.4318 12.2 20.0318 13.5C18.4318 15.1 16.3318 15.7 14.2318 15.4C13.3318 15.3 12.3318 15.6 11.7318 16.3L6.93177 21.1C5.73177 22.3 3.83179 22.2 2.73179 21C1.63179 19.8 1.83177 18 2.93177 16.9L7.53178 12.3C8.23178 11.6 8.53177 10.7 8.43177 9.80005C8.13177 7.80005 8.73176 5.6 10.3318 4C11.7318 2.6 13.5318 2 15.2318 2C16.1318 2 16.6318 3.20005 15.9318 3.80005L13.0318 6.70007C12.5318 7.20007 12.4318 7.9 12.7318 8.5C13.3318 9.7 14.2318 10.6001 15.4318 11.2001C16.0318 11.5001 16.7318 11.3 17.2318 10.9L20.1318 8C20.8318 7.2 22.0318 7.59998 22.0318 8.59998Z" fill="`+color+`"/>
        <path d="M4.23179 19.7C3.83179 19.3 3.83179 18.7 4.23179 18.3L9.73179 12.8C10.1318 12.4 10.7318 12.4 11.1318 12.8C11.5318 13.2 11.5318 13.8 11.1318 14.2L5.63179 19.7C5.23179 20.1 4.53179 20.1 4.23179 19.7Z" fill="`+color+`"/>
      </svg>
    `;
  },

  Pin: (color) => {
    //let color = colorize(c);
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.3" d="M5.78001 21.115L3.28001 21.949C3.10897 22.0059 2.92548 22.0141 2.75004 21.9727C2.57461 21.9312 2.41416 21.8418 2.28669 21.7144C2.15923 21.5869 2.06975 21.4264 2.0283 21.251C1.98685 21.0755 1.99507 20.892 2.05201 20.7209L2.886 18.2209L7.22801 13.879L10.128 16.774L5.78001 21.115Z" fill="`+color+`"/>
        <path d="M21.7 8.08899L15.911 2.30005C15.8161 2.2049 15.7033 2.12939 15.5792 2.07788C15.455 2.02637 15.3219 1.99988 15.1875 1.99988C15.0531 1.99988 14.92 2.02637 14.7958 2.07788C14.6717 2.12939 14.5589 2.2049 14.464 2.30005L13.74 3.02295C13.548 3.21498 13.4402 3.4754 13.4402 3.74695C13.4402 4.01849 13.548 4.27892 13.74 4.47095L14.464 5.19397L11.303 8.35498C10.1615 7.80702 8.87825 7.62639 7.62985 7.83789C6.38145 8.04939 5.2293 8.64265 4.332 9.53601C4.14026 9.72817 4.03256 9.98855 4.03256 10.26C4.03256 10.5315 4.14026 10.7918 4.332 10.984L13.016 19.667C13.208 19.859 13.4684 19.9668 13.74 19.9668C14.0115 19.9668 14.272 19.859 14.464 19.667C15.3575 18.77 15.9509 17.618 16.1624 16.3698C16.374 15.1215 16.1932 13.8383 15.645 12.697L18.806 9.53601L19.529 10.26C19.721 10.452 19.9814 10.5598 20.253 10.5598C20.5245 10.5598 20.785 10.452 20.977 10.26L21.7 9.53601C21.7952 9.44108 21.8706 9.32825 21.9221 9.2041C21.9737 9.07995 22.0002 8.94691 22.0002 8.8125C22.0002 8.67809 21.9737 8.54505 21.9221 8.4209C21.8706 8.29675 21.7952 8.18392 21.7 8.08899Z" fill="`+color+`"/>
      </svg>
    `;
  },

  Exclamation: (color) => {
    //let color = colorize(c);
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect opacity="0.3" x="2" y="2" width="20" height="20" rx="10" fill="`+color+`"/>
        <rect x="11" y="14" width="7" height="2" rx="1" transform="rotate(-90 11 14)" fill="`+color+`"/>
        <rect x="11" y="17" width="2" height="2" rx="1" transform="rotate(-90 11 17)" fill="`+color+`"/>
      </svg>
    `;
  },

  Apps: (color) => {
    //let color = colorize(c);
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 2H10C10.6 2 11 2.4 11 3V10C11 10.6 10.6 11 10 11H3C2.4 11 2 10.6 2 10V3C2 2.4 2.4 2 3 2Z" fill="`+color+`"/>
        <path opacity="0.3" d="M14 2H21C21.6 2 22 2.4 22 3V10C22 10.6 21.6 11 21 11H14C13.4 11 13 10.6 13 10V3C13 2.4 13.4 2 14 2Z" fill="`+color+`"/>
        <path opacity="0.3" d="M3 13H10C10.6 13 11 13.4 11 14V21C11 21.6 10.6 22 10 22H3C2.4 22 2 21.6 2 21V14C2 13.4 2.4 13 3 13Z" fill="`+color+`"/>
        <path opacity="0.3" d="M14 13H21C21.6 13 22 13.4 22 14V21C22 21.6 21.6 22 21 22H14C13.4 22 13 21.6 13 21V14C13 13.4 13.4 13 14 13Z" fill="`+color+`"/>
      </svg>
    `;
  },

  Menu: (color) => {
    //let color = colorize(c);
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 7H3C2.4 7 2 6.6 2 6V4C2 3.4 2.4 3 3 3H21C21.6 3 22 3.4 22 4V6C22 6.6 21.6 7 21 7Z" fill="`+color+`"/>
        <path opacity="0.3" d="M21 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14ZM22 20V18C22 17.4 21.6 17 21 17H3C2.4 17 2 17.4 2 18V20C2 20.6 2.4 21 3 21H21C21.6 21 22 20.6 22 20Z" fill="`+color+`"/>
      </svg>
    `;
  },

  CheckboxMarked: (color) => {
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect opacity="0.3" x="2" y="2" width="20" height="20" rx="5" fill="`+color+`"/>
        <path d="M10.4343 12.4343L8.75 10.75C8.33579 10.3358 7.66421 10.3358 7.25 10.75C6.83579 11.1642 6.83579 11.8358 7.25 12.25L10.2929 15.2929C10.6834 15.6834 11.3166 15.6834 11.7071 15.2929L17.25 9.75C17.6642 9.33579 17.6642 8.66421 17.25 8.25C16.8358 7.83579 16.1642 7.83579 15.75 8.25L11.5657 12.4343C11.2533 12.7467 10.7467 12.7467 10.4343 12.4343Z" fill="`+color+`"/>
      </svg>
    `;
  },

  CheckboxBlank: (color) => {
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect opacity="0.3" x="2" y="2" width="20" height="20" rx="5" fill="`+color+`"/>
      </svg>
    `;
  },
};

export const Badge = (props) => {
  let color = bg = "";
  if(props?.theme){
    if(props?.theme.substring(0,6)=="light-"){
      let theme=props?.theme.substring(6);
      color = theme;
      bg = "bg-light-"+theme;
    }
    else {
      color = 'white';
      bg = props?.theme;
    }
  }


  return (
    <View style={{
      ...props.style,
      backgroundColor: props?.theme ? colorize(bg) : props.backgroundColor,
      borderRadius: 5,
    }}>
      <Text style={{
        color: props?.theme ? colorize(color) : props.color,
        fontSize: 11,
        fontWeight: 'bold',
        paddingTop:1,
        paddingBottom: 1,
        paddingRight: 3,
        paddingLeft: 3,
      }}>{props.children}</Text>
    </View>
  );
};

export const Card = (props) => {
  return (
    <View {...props} style={{
      backgroundColor: 'white',
      width: '100%',
      flex: 1,
      paddingTop: 20,
      marginBottom: 65,
      ...props?.style
      }}>
      {/*HEADER*/}
      <View style={{
        flexDirection: "row", 
        alignItems: "center",
        paddingLeft: 15,
        paddingRight: 15,
        paddingBottom: 10
        }}>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={{fontWeight: 'bold', fontSize: 15}}>{props?.title}</Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={{color: '#b5b5c3', fontSize: 12}}>{props?.description}</Text>
        </View>
        <View>
          {props?.onFind &&
            <TouchableOpacity onPress={props?.onFind}>
              <View style={{backgroundColor: colorize('bg-light-default'), borderRadius: 5, padding: 5}}>
                <SvgXml xml={SvgDuotune.Find(colorize('dark'))} width="28" height="28" />
              </View>
            </TouchableOpacity>
          }
        </View>
      </View>
      {/*BODY*/}
      <View>
        {props.children}
      </View>

    </View>
  );
};

export const Divider = (props) => {
  return (
    <View {...props} style={{
      ...props?.style,
      height: 0,
      borderBottomWidth: 1,
      borderBottomColor: '#e4e6ef',
      borderStyle: 'dashed'
    }}/>
  );
}

export const ButtonDescription = (props) => {

  return (
    <Pressable
      android_ripple={{color: 'rgba(255, 255, 255, .2)', borderless: false}}
      {...props}
      style={{
        paddingTop: 14,
        paddingBottom: 14,
        paddingLeft: 14,
        paddingRight: 14,
        flexDirection: 'row',
        alignItems: "center",
        borderRadius: 8,
        ...props.style,
      }}
      >
      { props.icon && <View style={{marginRight: 12}}>{props.icon({ color: props.color, size: 32 })}</View> }
      <View style={{flexDirection: 'column', flex: 1}}>
        <Text style={{color: props.color, fontSize: 18, fontWeight: 'bold'}}>{props.label}</Text>
        <Text style={{color: props.color, fontSize:11, fontWeight: 600}}>{props.description}</Text>
      </View>
    </Pressable>
  );
}

export const DSP = {
  Card,
  Divider,
  Badge,
  ButtonDescription
};