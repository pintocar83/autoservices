import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { List } from 'react-native-paper';

import { db, dbCreate, dbResultData }  from './db';
dbCreate();


import NavigationBar from './NavigationBar';
import { Kilometer } from './Kilometer';
import { Automobile } from './Automobile';
import { ServiceType } from './ServiceType';
import { Service } from './Service';



const Stack = createStackNavigator();


import {View, Text, Button, StyleSheet} from 'react-native';

function HomeScreen({ navigation }) {

  const [automobiles, setAutomabiles] = React.useState([]);


  React.useEffect(() => {
    navigation.addListener('focus', () => {
      console.log('focus Home');
      db.transaction(tx => {
        let query = "SELECT * FROM automobiles";
        console.log("QUERY: "+query);
        tx.executeSql(query, null, (txObj, result) => {
          console.log("RESULT: ", result);
          setAutomabiles(dbResultData(result));
        });
      });
    });
  }, [navigation]);

  const list = () => {

    console.log("list",automobiles);
    //return (<Text>Hola</Text>);
    return automobiles.map((row, index) => {
      return (
        <List.Item
          key={row.id}
          title={row.name}
          left={props => <List.Icon {...props} icon="car" />}
        />
      );
    });
  }



  return (
    <View style={style.container}>
      <Text>Home Screen</Text>
      {list()}
      <Button
        title="Go to details"
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  );
}

function DetailsScreen() {
  return (
    <View style={style.container}>
      <Text>Details Screen</Text>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function Main() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Kilometer.Index"
        screenOptions={{
          header: (props) => <NavigationBar {...props} />,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
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
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}