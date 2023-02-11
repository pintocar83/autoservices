import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer, DrawerActions } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  createDrawerNavigator
} from '@react-navigation/drawer';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';


//import { StatusBar } from 'expo-status-bar';
import { List, Appbar, Drawer as DrawerPaper } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { SvgXml } from 'react-native-svg';

import { colorize, SvgDuotune, DSP }  from './uiComponent';
import { db, dbCreate, dbResultData }  from './db';
dbCreate();


//import NavigationBar from './NavigationBar';
import { Kilometer } from './Kilometer';
import { Automobile } from './Automobile';
import { ServiceType } from './ServiceType';
import { Service } from './Service';
import { Status } from './Status';
import { CameraScreen } from './CameraScreen';



const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createMaterialTopTabNavigator();


import {View, Text, Button, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, TouchableHighlight, DrawerLayoutAndroid} from 'react-native';

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
        //height: 50,
        backgroundColor: '#1a1a1a'
        }} >
      { leftAction }
      <Appbar.Content
        title={options.title ? options.title : "Auto Services"}
        color="white"
        />
    </Appbar.Header>
  );
}


function TabScreen() {
  return (
    <Tab.Navigator 
      screenOptions={{
        tabBarLabelStyle: { fontWeight: 600, textTransform: 'none' },
        tabBarItemStyle: { width: 100 },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: colorize("gray-500"),
        tabBarStyle: { backgroundColor: '#1a1a1a' },
        tabBarIndicatorStyle: { 
          borderBottomColor: '#FFFFFF',
          borderBottomWidth: 3,
          display: 'flex'
        }
      }}
      >
      <Tab.Screen name="Status" component={Status.Index} options={{
          tabBarLabel: 'Status',
          //tabBarShowIcon: true,
          //tabBarShowLabel: false,
          //tabBarIcon: ({ color, size }) => (
          //  <SvgXml xml={SvgDuotune.Pin('white')} width={size} height={size} />
          //),
        }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
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

      <Stack.Screen name="TabScreen" component={TabScreen} />
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