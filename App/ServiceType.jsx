import React from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import { DataTable, Divider, TextInput, RadioButton, Switch, HelperText, List, Appbar, FAB, useTheme, IconButton, MD3Colors } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db, dbResultData }  from './db';
import { ActionBar, AddButton, MsgBox, uiStyle }  from './uiComponent';


const labelTimeType = (v) => {
  if(v=="D")
    return "days";
  if(v=="M")
    return "months";
  if(v=="Y")
    return "years";
  return "";
}


export const ServiceType = {
  header: <Text style={uiStyle.indexHeader}>Service Types</Text>,

  List: ({ route, navigation }) => {
    const me = ServiceType;
    const params = route.params;
    const [data, setData] = React.useState(null);
    const [selection, setSelection] = React.useState("");

    React.useEffect(() => {
      navigation.addListener('focus', () => {
        console.log('FOCUS: ServiceType');
        onRefresh();
      });
    }, [navigation]);
    console.log("selection", selection);

    const onRefresh = () => {
      setSelection("");
      console.log("onRefresh");
      db.transaction(tx => {
        let query = "SELECT * FROM service_types WHERE status=1 ORDER BY name";
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

      navigation.navigate({
        name: params?.screen,
        params: {serviceType: record},
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

      let description = [];
      if(row.alert_km>0)
        description.push(row.alert_km+" Km");
      if(row.alert_time>0)
        description.push(row.alert_time+" "+labelTimeType(row.alert_time_type));

      return (
        <List.Item
          key={row.id}
          title={row.name}
          description={description.join(" / ")}
          onPress={() => setSelection(row.id)}
          left={() => <List.Icon icon={icon} color={color} style={{marginLeft: 8}}/>}
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
    const me = ServiceType;
    const [data, setData] = React.useState(null);
    const [selection, setSelection] = React.useState("");
    const [visibleMsgBox, setVisibleMsgBox] = React.useState(false);

    React.useEffect(() => {
      navigation.addListener('focus', () => {
        console.log('FOCUS: ServiceType');
        onRefresh();
      });
    }, [navigation]);
    console.log("selection", selection);

    const onRefresh = () => {
      setSelection("");
      console.log("onRefresh");
      db.transaction(tx => {
        let query = "SELECT * FROM service_types WHERE status=1 ORDER BY name";
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
      navigation.navigate('ServiceType.Form', record);
    }

    const onDelete = () => {
      if(!selection) return;
      console.log("onDelete",selection);
      setVisibleMsgBox(true);
    }

    const onDeleteDone = () => {
      if(!selection) return;
      console.log("onDeleteDone",selection);

      db.transaction(tx => {
        let query = "UPDATE service_types SET status=0 WHERE id=?";
        console.log("QUERY: "+query);
        tx.executeSql(query, [selection], (txObj, result) => {});

        onRefresh();
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

      let description = [];
      if(row.alert_km>0)
        description.push(row.alert_km+" Km");
      if(row.alert_time>0)
        description.push(row.alert_time+" "+labelTimeType(row.alert_time_type));

      return (
        <List.Item
          key={row.id}
          title={row.name}
          description={description.join(" / ")}
          onPress={() => setSelection(row.id)}
          left={() => <List.Icon icon={icon} color={color} style={{marginLeft: 8}}/>}
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
          onAdd={() => navigation.navigate('ServiceType.Form')}
          onRefresh={onRefresh}
          onEdit={onEdit}
          onDelete={onDelete}
          disabledEdit={!selection}
          disabledDelete={!selection}
          />
        {visibleMsgBox && <MsgBox visible={visibleMsgBox} setVisible={setVisibleMsgBox} title="Delete" message="Do you want to do it?" onDone={onDeleteDone} />}
      </View>
    );
  },

  Form: ({ route, navigation }) => {
    const me = ServiceType;
    const params = route.params;
    const id = params && params.id ? params.id : "";
    const [name, setName] = React.useState(params && params?.name ? params.name : "");
    const [alertKm, setAlertKm] = React.useState(params && params?.alert_km ? String(params.alert_km) : "");
    const [alertTime, setAlertTime] = React.useState(params && params?.alert_time ? String(params.alert_time) : "");
    const [alertTimeType, setAlertTimeType] = React.useState(params && params?.alert_time_type ? params.alert_time_type : "D");
    const [isSwitchOnAlertKm, setIsSwitchOnAlertKm] = React.useState(params && params?.alert_km > 0 ? true : false);
    const [isSwitchOnAlertTime, setIsSwitchOnAlertTime] = React.useState(params && params?.alert_time > 0 ? true : false);
    const [nameEmpty, setNameEmpty] = React.useState(false);

    let labelAlertTime="Time";
    let labelAlertTimeType=labelTimeType(alertTimeType);
    if(labelAlertTimeType)
      labelAlertTime+=" ("+labelAlertTimeType+")";

    const onSave = () => {
      console.log("onSave");

      if(!name.trim()){
        setNameEmpty(true);
        return;
      }

      db.transaction(tx => {
        let query;
        let values;
        if(id){
          query="UPDATE service_types SET name=?, alert_km=?, alert_time=?, alert_time_type=? WHERE id=?";
          values=[name, alertKm, alertTime, alertTimeType, id];
        }
        else{
          query="INSERT INTO service_types(name,alert_km,alert_time,alert_time_type) VALUES(?,?,?,?)";
          values=[name, alertKm, alertTime, alertTimeType];
        }

        tx.executeSql(query, values, (txObj, result) => {});

        navigation.goBack();
      });
    }

    return (
      <ScrollView style={uiStyle.scrollView}>
        {me.header}
        <TextInput
          label="Name"
          value={name}
          error={nameEmpty}
          onChangeText={value => {setName(value); setNameEmpty(!value ? true : false);}}
          style={uiStyle.defaultWidth}
        />
        {nameEmpty && <HelperText type="error" style={uiStyle.defaultWidth}>
          Field required!
        </HelperText>}

        <Text style={{...uiStyle.defaultWidth, fontSize: 16, paddingLeft: 0, marginTop: 20, fontWeight: '500'}}>Alerts Interval</Text>
        <View style={{...uiStyle.defaultWidth, flexDirection: 'row', alignItems: 'flex-end'}}>
          <Switch value={isSwitchOnAlertKm} onValueChange={value => {setAlertKm(value?"0":""); setIsSwitchOnAlertKm(value)}} style={{marginRight: 10, marginBottom: 8}} />
          <TextInput
            label="Kilometers"
            value={alertKm}
            editable={isSwitchOnAlertKm}
            onChangeText={value => {setAlertKm(value)}}
            style={{flex: 1}}
            keyboardType='numeric'
          />
        </View>

        <View style={{...uiStyle.defaultWidth, flexDirection: 'row', alignItems: 'flex-end'}}>
          <Switch value={isSwitchOnAlertTime} onValueChange={value => {setAlertTime(value?"0":""); setIsSwitchOnAlertTime(value)}} style={{marginRight: 10, marginBottom: 8}} />
          <TextInput
            label={labelAlertTime}
            value={alertTime}
            editable={isSwitchOnAlertTime}
            onChangeText={value => {setAlertTime(value)}}
            style={{flex: 1}}
            keyboardType='numeric'
          />
        </View>

        <View style={{...uiStyle.defaultWidth, flexDirection: 'row', alignItems: 'flex-end'}}>
          <View style={{width: 150}}>
            <RadioButton.Group
              value={alertTimeType}
              onValueChange={value => setAlertTimeType(value)}
              >
              <RadioButton.Item labelVariant="bodyMedium" value="D" disabled={!isSwitchOnAlertTime} style={{paddingBottom: 0}} label="Days" />
              <RadioButton.Item labelVariant="bodyMedium" value="M" disabled={!isSwitchOnAlertTime} style={{paddingBottom: 0, paddingTop: 0}} label="Months" />
              <RadioButton.Item labelVariant="bodyMedium" value="Y" disabled={!isSwitchOnAlertTime} style={{paddingBottom: 0, paddingTop: 0}} label="Years" />
            </RadioButton.Group>
          </View>
        </View>

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
