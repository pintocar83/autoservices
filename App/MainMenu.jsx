import React from 'react';
import {
  Pressable,
  ScrollView,
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

import { SvgXml } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { uiTheme, uiStyle, colorize, SvgDuotune, DSP }  from './uiComponent';



export const MainMenu = ( {navigation,...props}) => {
  //icon={({ color, size }) => <SvgXml xml={SvgDuotune.Find(color)} width={size} height={size} /> }

  const style = {
    width: 200,
    backgroundColor: colorize("primary"),
    marginBottom: 20,
    marginLeft: 10,
    marginRight: 10,
  };
  const color = colorize("white");

  return (

      <ScrollView
        style = {{ ...uiStyle.scrollView, width: '100%', paddingHorizontal: 0 }}
        >
        <View style = {{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 50 }}>
          <DSP.ButtonDescription
            label="Automobiles"
            description="Administrator"
            color={color}
            icon={({ color, size }) => <Icon name="car-estate" size={size} color={color} /> }
            onPress={() => navigation.navigate('Automobile.Index')} 
            style={style} />

          <DSP.ButtonDescription
            label="Service Types"
            description="Administrator"
            color={color}
            icon={({ color, size }) => <Icon name="account-wrench" size={size} color={color} /> }
            onPress={() => navigation.navigate('ServiceType.Index')} 
            style={style} />

          <DSP.ButtonDescription
            label="Services"
            description="Administrator"
            color={color}
            icon={({ color, size }) => <Icon name="car-wrench" size={size} color={color} /> }
            onPress={() => navigation.navigate('Service.Index')} 
            style={style} />

          <DSP.ButtonDescription
            label="Kilometers"
            description="Administrator"
            color={color}
            icon={({ color, size }) => <Icon name="gauge" size={size} color={color} /> }
            onPress={() => navigation.navigate('Kilometer.Index')} 
            style={style} />
        </View>
      </ScrollView>



  );
};