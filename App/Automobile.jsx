import React from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import { DataTable, Divider, TextInput, HelperText, List, Appbar, FAB, useTheme, IconButton, MD3Colors } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db, dbResultData }  from './db';
import { ActionBar, AddButton, MsgBox, uiStyle }  from './uiComponent';


export const Automobile = {
  header: <Text style={uiStyle.indexHeader}>Automobiles</Text>,

  List: ({ route, navigation }) => {
    const me = Automobile;
    const params = route.params;
    const [data, setData] = React.useState(null);
    const [selection, setSelection] = React.useState("");

    React.useEffect(() => {
      navigation.addListener('focus', () => {
        onRefresh();
      });
    }, [navigation]);

    const onRefresh = () => {
      setSelection("");
      db.transaction(tx => {
        let query = "SELECT * FROM automobiles WHERE status=1 ORDER BY name";
        console.log("QUERY: "+query);
        tx.executeSql(query, null, (txObj, result) => {
          console.log("RESULT: ", result);
          setData(dbResultData(result));
        });
      });
    }

    const onAccept = () => {
      if(!selection) return;
      if(!params?.screen) return;

      const record = data.find(element => element.id == selection);

      //global.refresh_screen["Status"] = true;
      //navigation.goBack();

      navigation.navigate({
        name: params?.screen,
        params: {automobile: record},
        merge: true
      });
    }

    const ListItems = data && data.map((row, index) => {
      let color = "gray";
      let backgroundColor = null;
      let icon = "checkbox-blank-outline";

      if(selection === row.id){
        color = "#3f51b5";
        backgroundColor = "#fafafa";
        icon = "checkbox-marked";
      }

      let rightIcon=null;
      if(row.favorite)
        rightIcon = () => <List.Icon icon="star" color="#ffeb3b" />
      else
        rightIcon = () => <List.Icon icon="star" color="#eeeeee" />

      return (
        <List.Item
          key={row.id}
          title={row.code}
          description={row.name}
          onPress={() => setSelection(row.id)}
          left={() => <List.Icon icon={icon} color={color} style={{marginLeft: 8}}/>}
          right={rightIcon}
          titleStyle={{color: color}}
          descriptionStyle={{color: color}}
          style={{backgroundColor: backgroundColor, width: '100%', flex: 1}}
        />
      );
    });

    return (
      <View style={uiStyle.container}>
        <ScrollView style={{...uiStyle.scrollView, width: '100%'}}>
          {me.header}
          <List.Section style={uiStyle.defaultWidth}>
            {ListItems}
          </List.Section>
          {data && data.length===0 && <Text variant="bodyLarge">No result</Text>}
        </ScrollView>
        <ActionBar
          onAccept={onAccept}
          onRefresh={onRefresh}
          disabledAccept={!selection}
        />
      </View>
    );
  },

  Index: ({ navigation }) => {
    const me = Automobile;
    const [data, setData] = React.useState(null);
    const [selection, setSelection] = React.useState("");
    const [visibleMsgBox, setVisibleMsgBox] = React.useState(false);

    React.useEffect(() => {
      navigation.addListener('focus', () => {
        console.log('FOCUS: Automobile');
        onRefresh();
      });
    }, [navigation]);
    console.log("selection", selection);

    const onRefresh = () => {
      setSelection("");
      console.log("onRefresh");
      db.transaction(tx => {
        let query = "SELECT * FROM automobiles WHERE status=1 ORDER BY favorite DESC, code, name";
        console.log("QUERY: "+query);
        tx.executeSql(query, null, (txObj, result) => {
          console.log("RESULT: ", result);
          setData(dbResultData(result));
        });
      });
    }

    const onEdit = () => {
      if(!selection) return;
      const record = data.find(element => element.id == selection);
      console.log("onEdit", record);
      navigation.navigate('Automobile.Form', record);
    }

    const onDelete = () => {
      if(!selection) return;
      console.log("onDelete",selection);
      setVisibleMsgBox(true);
    }

    const onDeleteDone = () => {
      if(!selection) return;
      const index = data.findIndex(element => element.id == selection);
      console.log("onDeleteDone",selection);

      db.transaction(tx => {
        let query = "UPDATE automobiles SET status=0 WHERE id=?";
        console.log("QUERY: "+query);
        tx.executeSql(query, [selection], (txObj, result) => {});
        if(data[index].favorite && data.length>1){
          let query = "UPDATE automobiles SET favorite=1 WHERE id = ?";
          let next_id = data[index+1].id;
          tx.executeSql(query, [next_id], (txObj, result) => {});
        }

        onRefresh();
      });
    }

    const onFavorite = () => {
      if(!selection) return;
      console.log("onFavorite",selection);
      db.transaction(tx => {
        let query = "UPDATE automobiles SET favorite=(CASE WHEN id=? THEN 1 ELSE 0 END)";
        console.log("QUERY: "+query);
        tx.executeSql(query, [selection], (txObj, result) => {
          onRefresh();
        });
      });
    }

    const isFavorite = () => {
      if(!selection) return false;
      const record = data.find(element => element.id == selection);
      return record.favorite ? true : false;
    }

    const ListItems = data && data.map((row, index) => {
      let color = "gray";
      let backgroundColor = null;
      let icon = "checkbox-blank-outline";

      if(selection === row.id){
        color = "#3f51b5";
        backgroundColor = "#fafafa";
        icon = "checkbox-marked";
      }

      let rightIcon=null;
      if(row.favorite)
        rightIcon = () => <List.Icon icon="star" color="#ffeb3b" />
      else
        rightIcon = () => <List.Icon icon="star" color="#eeeeee" />

      return (
        <List.Item
          key={row.id}
          title={row.code}
          description={row.name}
          onPress={() => setSelection(row.id)}
          left={() => <List.Icon icon={icon} color={color} style={{marginLeft: 8}}/>}
          right={rightIcon}
          titleStyle={{color: color}}
          descriptionStyle={{color: color}}
          style={{backgroundColor: backgroundColor, width: '100%', flex: 1}}
        />
      );
    });

    return (
      <View style={uiStyle.container}>
        <ScrollView style={{...uiStyle.scrollView, width: '100%'}}>
          {me.header}
          <List.Section style={uiStyle.defaultWidth}>
            {ListItems}
          </List.Section>
          {data && data.length===0 && <Text variant="bodyLarge">No result</Text>}
        </ScrollView>
        <ActionBar
          onAdd={() => navigation.navigate('Automobile.Form')}
          onRefresh={onRefresh}
          onEdit={onEdit}
          onDelete={onDelete}
          onFavorite={onFavorite}
          disabledEdit={!selection}
          disabledDelete={!selection}
          disabledFavorite={!selection || isFavorite()}
          />
        {visibleMsgBox && <MsgBox visible={visibleMsgBox} setVisible={setVisibleMsgBox} title="Delete" message="Do you want to do it?" onDone={onDeleteDone} />}
      </View>
    );
  },

  Form: ({ route, navigation }) => {
    const me = Automobile;
    const params = route.params;
    const id = params && params.id ? params.id : "";
    const [code, setCode] = React.useState(params && params.code ? params.code : "");
    const [name, setName] = React.useState(params && params.name ? params.name : "");
    const [codeEmpty, setCodeEmpty] = React.useState(false);

    const onSave = () => {
      console.log("onSave");

      if(!code.trim()){
        setCodeEmpty(true);
        return;
      }

      db.transaction(tx => {
        let query;
        let values;
        if(id){
          query="UPDATE automobiles SET code=?, name=? WHERE id=?";
          values=[code, name, id];
        }
        else{
          query="INSERT INTO automobiles(code,name) VALUES(?,?)";
          values=[code, name];
        }

        tx.executeSql(query, values, (txObj, resultSet) => {});

        if(!id){
          query="SELECT count(*) n FROM automobiles WHERE status=1";
          tx.executeSql(query, null, (txObj, result) => {
            let data=dbResultData(result);
            if(data && data[0] && data[0].n === 1){
              let query = "UPDATE automobiles SET favorite=1 WHERE status=1";
              tx.executeSql(query, null, (txObj, resultSet) => {});
            }
          });
        }

        navigation.goBack();
      });
    }

    return (
      <ScrollView style={uiStyle.scrollView}>
        {me.header}
        <TextInput
          label="Number"
          value={code}
          error={codeEmpty}
          onChangeText={value => {setCode(value); setCodeEmpty(!value ? true : false);}}
          style={uiStyle.defaultWidth}
        />
        {codeEmpty && <HelperText type="error" style={uiStyle.defaultWidth}>
          Number field is required!
        </HelperText>}
        <TextInput
          label="Name"
          value={name}
          onChangeText={value => setName(value)}
          style={uiStyle.defaultWidth}
        />
        <View style={uiStyle.buttonContainer}>
          <Button
            mode="contained"
            title="Cancel"
            style={uiStyle.buttonActionForm}
            contentStyle={uiStyle.buttonActionForm}
            onPress={() => navigation.goBack()}
          />
          <View style={{width: 20}} />
          <Button
            mode="contained"
            title="Done"
            style={uiStyle.buttonActionForm}
            contentStyle={uiStyle.buttonActionForm}
            labelStyle={uiStyle.buttonActionForm}
            onPress={onSave}
          />
        </View>
      </ScrollView>
    );
  }
}
