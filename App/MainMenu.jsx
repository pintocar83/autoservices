import React from 'react';
import { ScrollView, View } from 'react-native';
import { uiStyle, colorize, DSP }  from './uiComponent';
import { dbBackupJSON, dbRestoreJSON  } from './db';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const MainMenu = ( {navigation,...props}) => {
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
        <View style = {{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 50, paddingBottom: 50 }}>
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

          <DSP.ButtonDescription
            label="Backup"
            description="Database"
            color={color}
            icon={({ color, size }) => <Icon name="database-export" size={size} color={color} /> }
            onPress={() => dbBackupJSON()} 
            style={style} />

          <DSP.ButtonDescription
            disabled={false}
            label="Restore"
            description="Database"
            color={color}
            icon={({ color, size }) => <Icon name="database-import" size={size} color={color} /> }
            onPress={() => dbRestoreJSON()} 
            style={style} />
        </View>
      </ScrollView>
  );
};
