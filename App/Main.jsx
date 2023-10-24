import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer, DrawerActions, useTheme } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  createDrawerNavigator
} from '@react-navigation/drawer';

import { createMaterialTopTabNavigator, MaterialTopTabBar } from '@react-navigation/material-top-tabs';



//import { StatusBar } from 'expo-status-bar';
import { List, Appbar, Drawer as DrawerPaper } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { SvgXml } from 'react-native-svg';

import { uiTheme, colorize, SvgDuotune, DSP }  from './uiComponent';
import { useAutoServiceState }  from './hooks';
import { db, dbCreate, dbResultFirst, dbResultData }  from './db';
dbCreate();


//import NavigationBar from './NavigationBar';
import { Kilometer } from './Kilometer';
import { Automobile } from './Automobile';
import { ServiceType } from './ServiceType';
import { Service } from './Service';
import { Status } from './Status';
import { Timeline } from './Timeline';
import { CameraScreen } from './CameraScreen';
import { KilometerScanCam } from './KilometerScanCam';
import { MainMenu } from './MainMenu';

global.refresh_screen = {};
global.refresh_screen["Status"] = false;
global.refresh_screen["Service"] = true;
global.automobile = { id: '', name: '', code: '', km: {} };

global.setAutomobile = (record) => {
  if(record.id)
    global.automobile.id = record.id
  if(record.code)
    global.automobile.code = record.code
  if(record.name)
    global.automobile.name = record.name
  if(record.km)
    global.automobile.code = record.km
}

global.setAutomobileFavorite = (callback) => {
  console.log("global.setAutomobileFavorite");
  db.transaction(tx => {
    let query = 'SELECT * FROM automobiles WHERE favorite=1 LIMIT 1';
    console.log(query)
    tx.executeSql(query, null, (txObj, result) => {
      let record = dbResultFirst(result);
      console.log("global.setAutomobileFavorite RECORD************* ",record)
      if (!record?.id) return;
      global.setAutomobile(record);
      callback();
    });
  });
};



const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createMaterialTopTabNavigator();


import {
  Pressable,
  Animated,
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TouchableHighlight,
  DrawerLayoutAndroid
} from 'react-native';

/*
const DrawerNavigatorItem = (props) => {
  const color = '#3f4254';
  return (
    <TouchableOpacity onPress={props.onPress} style={{flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingTop: 10, paddingBottom: 10}}>
      <Icon name={props.icon} size={30} color={colorize('gray-700')} style={{}} />
      <Text style={{flex: 1, paddingLeft: 10, fontWeight: 'bold', fontSize: 16, color: colorize('gray-700')}}>{props.label}</Text>
    </TouchableOpacity>
  );
};

const LeftMenuBar = (props) => {
  let color_header = '#78909c';

  return (
    <SafeAreaView style={{flex: 1}}>
      <DrawerContentScrollView {...props} style={{marginTop: 0, backgroundColor: 'white', paddingBottom: 0}}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingLeft: 0, paddingRight: 10, backgroundColor: '#e1e3ea', marginTop: -5, marginBottom: 20, paddingTop: 20, paddingBottom: 20}}>
          <Icon name="car-wrench" size={42} color={color_header} style={{}} />
          <Text style={{fontSize: 22, fontWeight: '600', paddingLeft: 10, color: "#455a64"}}>Auto Services</Text>
        </View>
        <DrawerNavigatorItem icon="home" label="Status" onPress={() => props.navigation.navigate('Status.Index')} />
        <DrawerNavigatorItem icon="gauge" label="Kilometers" onPress={() => props.navigation.navigate('Kilometer.Index')} />
        <DrawerNavigatorItem icon="car-wrench" label="Services" onPress={() => props.navigation.navigate('Service.Index')} />
        <DrawerNavigatorItem icon="car-estate" label="Automobiles" onPress={() => props.navigation.navigate('Automobile.Index')} />
        <DrawerNavigatorItem icon="account-wrench" label="Service Types" onPress={() => props.navigation.navigate('ServiceType.Index')} />
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};

function NavigationBar({ navigation, back, options, drawer }) {
  //console.log("NAVEGATYION", props);
  //const [visible, setVisible] = React.useState(false);
 // const openMenu = () => setVisible(true);
  //const closeMenu = () => setVisible(false);

  //const state = props.navigation.getState();
  //console.log("STATE",state);

  //const option = navigation.getOption();
  console.log("OPTION",options);

  let leftAction = null;
  if(back)
    leftAction = <Appbar.BackAction color="white" onPress={navigation.goBack} />;
  else
    leftAction = <Appbar.Action icon="menu" color="white" onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} />;

  return (
    <Appbar.Header style={{
        backgroundColor: '#1a1a1a'
        }} >
      { leftAction }
      <Appbar.Content
        title={options.title}
        color="white"
        />
    </Appbar.Header>
  );
}

const MainScreen = (props) => {
  return (
    <Stack.Navigator
      initialRouteName="Status.Index"
      screenOptions={{
        header: (props) => <NavigationBar {...props} />,
        headerStyle: {
          backgroundColor: '#1a1a1a',
          //color: '#FFFFFF'
        },
        headerTitleStyle: {
          color: '#FFFFFF'
        },
        //headerLeft: (p) => {
        //  return (
        //    p.canGoBack ?
        //      <TouchableOpacity onPress={props.navigation.goBack}><Icon name="arrow-left" color="#FFFFFF" size={32} style={{marginLeft: 15, marginRight: 0}} /></TouchableOpacity> :
        //      <TouchableOpacity onPress={() => props.navigation.dispatch(DrawerActions.toggleDrawer())}><Icon name="menu" color="#FFFFFF" size={32} style={{marginLeft: 15, marginRight: 0}} /></TouchableOpacity>
        //  );
        //}
      }}
      >

      <Stack.Screen name="Status.Index" component={Status.Index} options={{title: 'Status'}} />
      <Stack.Screen name="Kilometer.Index" component={Kilometer.Index} />
      <Stack.Screen name="Kilometer.Form" component={Kilometer.Form} />
      <Stack.Screen name="Automobile.Index" component={Automobile.Index} />
      <Stack.Screen name="Automobile.List" component={Automobile.List} />
      <Stack.Screen name="Automobile.Form" component={Automobile.Form} />
      <Stack.Screen name="ServiceType.Index" component={ServiceType.Index} />
      <Stack.Screen name="ServiceType.List" component={ServiceType.List} />
      <Stack.Screen name="ServiceType.Form" component={ServiceType.Form} />
      <Stack.Screen name="Service.Index" component={Service.Index} />
      <Stack.Screen name="Service.Form" component={Service.Form} />
      <Stack.Screen name="CameraScreen.Index" component={CameraScreen.Index} />
    </Stack.Navigator>
  );
};



export default function Main(props) {
  return (
    <NavigationContainer>
      <StatusBar
        animated={true}
        backgroundColor="#1a1a1a"
      />
      <Drawer.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false
        }}
        drawerContent={props => <LeftMenuBar {...props} />}>
        <Stack.Screen name="Main" component={MainScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

*/

/*
function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home!</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
    </View>
  );
}



export default function Main() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}*/


function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
    </View>
  );
}

const DrawerNavigatorItem = (props) => {
  const color = '#3f4254';
  return (
    <TouchableOpacity onPress={props.onPress} style={{flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingTop: 10, paddingBottom: 10}}>
      <Icon name={props.icon} size={30} color={colorize('gray-700')} style={{}} />
      <Text style={{flex: 1, paddingLeft: 10, fontWeight: 'bold', fontSize: 16, color: colorize('gray-700')}}>{props.label}</Text>
    </TouchableOpacity>
  );
};

const LeftMenuBar = (props) => {
  let color_header = '#78909c';
  return (
    <SafeAreaView style={{flex: 1}}>
      <DrawerContentScrollView {...props} style={{marginTop: 0, backgroundColor: 'white', paddingBottom: 0}}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingLeft: 0, paddingRight: 10, backgroundColor: '#e1e3ea', marginTop: -5, marginBottom: 20, paddingTop: 20, paddingBottom: 20}}>
          <Icon name="car-wrench" size={42} color={color_header} style={{}} />
          <Text style={{fontSize: 22, fontWeight: '600', paddingLeft: 10, color: "#455a64"}}>Auto Services</Text>
        </View>
        <DrawerNavigatorItem icon="home" label="Status" onPress={() => props.navigation.navigate('Status.Index')} />
        <DrawerNavigatorItem icon="gauge" label="Kilometers" onPress={() => props.navigation.navigate('Kilometer.Index')} />
        <DrawerNavigatorItem icon="car-wrench" label="Services" onPress={() => props.navigation.navigate('Service.Index')} />
        <DrawerNavigatorItem icon="car-estate" label="Automobiles" onPress={() => props.navigation.navigate('Automobile.Index')} />
        <DrawerNavigatorItem icon="account-wrench" label="Service Types" onPress={() => props.navigation.navigate('ServiceType.Index')} />
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};

function NavigationBar({ navigation, back, options, drawer }) {
  //console.log("Main->NavigationBar->options", options);
  let leftAction = null;
  if(back)
    leftAction = <Appbar.BackAction color="white" onPress={navigation.goBack} />;

  let subtitle = null;
  if(options.subtitle){
    subtitle = <Text style={{ color: colorize('white'), fontSize:14, fontWeight: 500, letterSpacing: 0.5, paddingLeft: 5,}}>{options.subtitle}</Text>;
  }

  let subtitle_icon = null;
  if(options.icon){
    subtitle_icon = <Icon name={options.icon} size={20} color="white" />
  }

  let title = <View style={{flexDirection: 'row', alignItems: 'center', height: 60}}>
    <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 700, flex:1}}>Auto Services</Text>
    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingRight: 10, paddingBottom: 8, alignSelf: 'flex-end'}}>{subtitle_icon}{subtitle}</View>
  </View>;

  return (
    <Appbar.Header style={{
        height: 60,
        backgroundColor: uiTheme.colors.topBarNavigator
        }} >
      { leftAction }
      <Appbar.Content
        title={options.title ? options.title : title}
        />
    </Appbar.Header>
  );
}

function MyTabBar({ state, descriptors, navigation, ...rest }) {
  const { colors } = useTheme();
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.card,
        height: 40,
        ...focusedOptions.tabBarStyle,
        elevation: 15
      }}
      >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        let style={
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 0,
          paddingBottom: 0,
          ...options.tabBarItemStyle,
        };

        let color = isFocused ? focusedOptions.tabBarActiveTintColor : focusedOptions.tabBarInactiveTintColor;
        let tabBarIndicatorStyle = {};
        if(focusedOptions.tabBarIndicatorStyle) {
          if(isFocused) {
            tabBarIndicatorStyle = focusedOptions.tabBarIndicatorStyle;
          }
          else {
            if(focusedOptions.tabBarIndicatorStyle?.borderBottomColor){
              tabBarIndicatorStyle = {...focusedOptions.tabBarIndicatorStyle, borderBottomColor: 'transparent'}
            }
          }
        }

        return (
          <Pressable
            android_ripple={{color: 'rgba(255, 255, 255, .1)', borderless: true}}
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={style}
          >
            <View style={{
              flex: 1,
              paddingLeft: 5,
              paddingRight: 5,
              width: "100%",
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              ...tabBarIndicatorStyle
              }}>
              { options.tabBarShowIcon !== false  && options.tabBarIcon && options.tabBarIcon({ color, size: 24 }) }
              { options.tabBarShowLabel!==false && <Text style={{ fontWeight: "600", color: color, paddingLeft: (options.tabBarShowIcon !== false  && options.tabBarIcon ? 5: null) }}>
                {label}
              </Text> }
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function TabScreen() {
  return (
    <Tab.Navigator
      tabBar={props => <MyTabBar {...props} />}
      initialRouteName="Status"
      screenOptions={{
        tabBarLabelStyle: { fontWeight: 600, textTransform: 'none' },
        tabBarItemStyle: { flex: 1 },
        tabBarActiveTintColor: '#ffffff',
        //tabBarInactiveTintColor: colorize("gray-500"),
        tabBarInactiveTintColor: colorize("top-primary-inactive"),
        tabBarStyle: { backgroundColor: uiTheme.colors.topBarNavigator },
        tabBarIndicatorStyle: { 
          borderBottomColor: '#FFFFFF',
          borderBottomWidth: 3
        },
      }}
      >
      <Tab.Screen name="Menu" component={MainMenu} options={{
          tabBarShowIcon: true,
          tabBarShowLabel: false,
          tabBarItemStyle: {
            //maxWidth: 80
          },
          tabBarIcon: ({ color, size }) => {
            return <SvgXml xml={SvgDuotune.Apps(color)} width="24" height="24" />;
          },
        }} />
      <Tab.Screen name="Status" component={Status.Index} options={{
          tabBarShowIcon: true,
          tabBarShowLabel: false,
          tabBarItemStyle: {
            //maxWidth: 80
          },
          tabBarIcon: ({ color, size }) => {
            return <Icon name='heart-pulse' size={32} color={color} />;
            //return <SvgXml xml={SvgDuotune.Health(color)} width="32" height="32" />;
          },
          tabBarLabel: 'Status',
          subtitle: 'Status',
        }} />
      <Tab.Screen name="Timeline" component={Timeline.Index} options={{
          tabBarShowIcon: true,
          tabBarShowLabel: false,
          tabBarItemStyle: {
            //maxWidth: 80
          },
          tabBarLabel: 'Timeline',
          tabBarIcon: ({ color, size }) => {
            return <Icon name='history' size={28} color={color} />;
          },
        }}
        initialParams={{viewTab: true}} />
      { false && <Tab.Screen name="Services" component={Service.Index} options={{
          //tabBarItemStyle:  {width: 'auto'},
        //tabBarLabelStyle: {
          //width: 300
        //}
      }} />}
    </Tab.Navigator>
  );
}

const MainScreen = (props) => {
  return (
    <Stack.Navigator
      initialRouteName="TabScreen"
      screenOptions={{
        header: (props) => <NavigationBar {...props} />,
        headerStyle: {
          backgroundColor: uiTheme.colors.topBarNavigator,
        },
        headerTitleStyle: {
          color: '#FFFFFF'
        },
      }}
      >

      <Stack.Screen name="TabScreen" component={TabScreen} />
      <Stack.Screen name="Status.Index" component={Status.Index} />
      <Stack.Screen name="Timeline.Index" component={Timeline.Index} />
      <Stack.Screen name="Kilometer.Index" component={Kilometer.Index} options={{subtitle: 'Kilometers', icon: 'gauge'}} />
      <Stack.Screen name="Kilometer.Form" component={Kilometer.Form} options={{subtitle: 'Kilometers', icon: 'gauge'}} />
      <Stack.Screen name="Automobile.Index" component={Automobile.Index} />
      <Stack.Screen name="Automobile.List" component={Automobile.List} />
      <Stack.Screen name="Automobile.Form" component={Automobile.Form} />
      <Stack.Screen name="ServiceType.Index" component={ServiceType.Index} />
      <Stack.Screen name="ServiceType.List" component={ServiceType.List} />
      <Stack.Screen name="ServiceType.Form" component={ServiceType.Form} />
      <Stack.Screen name="Service.Index" component={Service.Index} options={{subtitle: 'Services', icon: 'car-wrench'}} />
      <Stack.Screen name="Service.Form" component={Service.Form} options={{subtitle: 'Services', icon: 'car-wrench'}} />
      <Stack.Screen name="CameraScreen.Index" component={CameraScreen.Index} />
      <Stack.Screen name="KilometerScanCam" component={KilometerScanCam} />
    </Stack.Navigator>
  );
};



export default function Main(props) {
  /*const [globalState, setGlobalState] = useAutoServiceState();

  React.useEffect(()=>{
    console.log("USE useEffect MAIN")
    global.setAutomobileFavorite(()=>{
      setGlobalState({automobile: global.automobile})
    });
  }, []);*/
  const disabledLeftMenuBar = false;
  return (
    <NavigationContainer>
      <StatusBar
        animated={true}
        backgroundColor={uiTheme.colors.topBarNavigator}
      />
      { disabledLeftMenuBar ? <Drawer.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false
        }}
        drawerContent={props => <LeftMenuBar {...props} />}>
        <Stack.Screen name="Main" component={MainScreen} />
      </Drawer.Navigator> : <MainScreen />}
    </NavigationContainer>
  );
}

