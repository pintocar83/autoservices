import React from 'react';
import moment from 'moment';
import { View, Text, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import { DataTable, Divider, TextInput, RadioButton, Switch, HelperText, List, Appbar, FAB, useTheme, IconButton, MD3Colors } from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db, dbResultData }  from './db';
import { ActionBar, AddButton, MsgBox, uiStyle }  from './uiComponent';


export const Kilometer = {
  header: <Text style={uiStyle.indexHeader}>Kilometers</Text>,
  formatKm: (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),

  Index: ({ navigation }) => {
    console.log("navigation",navigation);
    console.log("navigation canGoBack",navigation.canGoBack());
    console.log("navigation getParent",navigation.getParent());
    const me = Kilometer;
    const [data, setData] = React.useState(null);
    const [selection, setSelection] = React.useState("");
    const [visibleMsgBox, setVisibleMsgBox] = React.useState(false);

    React.useEffect(() => {
      navigation.addListener('focus', () => {
        console.log('FOCUS: Kilometer');
        onRefresh();
      });
    }, [navigation]);
    console.log("selection", selection);

    const onRefresh = () => {
      setSelection("");
      console.log("onRefresh");
      db.transaction(tx => {
        let query = "SELECT K.*, A.name automobile_name, A.code automobile_code FROM kilometers K INNER JOIN automobiles A ON K.automobile_id=A.id ORDER BY register_date DESC";
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
      navigation.navigate('Kilometer.Form', record);
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
        let query = "DELETE FROM kilometers WHERE id=?";
        console.log("QUERY: "+query);
        tx.executeSql(query, [selection], (txObj, result) => {});
        global.refresh_screen["Status"] = true;
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

      return (
        <List.Item
          key={row.id}
          title={
            <View style={{flexDirection: 'row', flexWrap: 'wrap', width: '100%'}}>
              <Text style={{color: color, flex: 1, fontWeight: 'bold'}}>{me.formatKm(row.value) + " km  -  "}</Text>
              <Text style={{color: color}}>{moment(row.register_date).format('DD/MM/YYYY hh:mma')}</Text>
            </View>
          }
          description={row.automobile_name}
          onPress={() => setSelection(row.id)}
          left={() => <List.Icon icon={icon} color={color} style={{marginLeft: 8}}/>}
          titleStyle={{color: color}}
          descriptionStyle={{color: color}}
          style={{backgroundColor: backgroundColor}}
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
          onAdd={() => navigation.navigate('Kilometer.Form')}
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
    console.log("navigation",navigation);
    console.log("navigation canGoBack",navigation.canGoBack());
    console.log("navigation getParent",navigation.getParent());

    const me = Kilometer;
    const params = route.params;
    const id = params && params.id ? params.id : "";
    const [date, setDate] = React.useState(params && params.register_date ? moment(params.register_date,"YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY") : moment().format("DD/MM/YYYY"));
    const [time, setTime] = React.useState(params && params.register_date ? moment(params.register_date,"YYYY-MM-DD HH:mm:ss").format("hh:mm a") : moment().format("hh:mm a"));
    const [value, setValue] = React.useState(params && params.value ? String(params.value) : "");
    const [automobile, setAutomobile] = React.useState({id: params?.automobile_id, name: params?.automobile_name});

    const [valueEmpty, setValueEmpty] = React.useState(false);
    const [dateEmpty, setDateEmpty] = React.useState(false);
    const [timeEmpty, setTimeEmpty] = React.useState(false);
    const [automobileEmpty, setAutomobileEmpty] = React.useState(false);

    const [displayDatePicker, setDisplayDatePicker] = React.useState(false);
    const [displayTimePicker, setDisplayTimePicker] = React.useState(false);

    const onDismissDatePicker = React.useCallback(() => {
      setDisplayDatePicker(false);
    }, [setDisplayDatePicker]);

    const onConfirmDatePicker = React.useCallback(
      (params) => {
        setDisplayDatePicker(false);
        setDateEmpty(false);
        setDate(moment(params.date).format("DD/MM/YYYY"));
      },
      [setDisplayDatePicker, setDate]
    );

    const onDismissTimePicker = React.useCallback(() => {
      setDisplayTimePicker(false)
    }, [setDisplayTimePicker])

    const onConfirmTimePicker = React.useCallback(
      ({ hours, minutes }) => {
        setDisplayTimePicker(false);
        setTimeEmpty(false);
        setTime(moment((hours<10?"0"+hours:hours)+":"+(minutes<10?"0"+minutes:minutes),"HH:mm").format("hh:mm a"));
      },
      [setDisplayTimePicker]
    );

    React.useEffect(() => {
      if(route.params?.automobile) {
        console.log("useEffect route.params?.automobil", route.params?.automobile);
        setAutomobile({
          id: route.params?.automobile.id,
          name: route.params?.automobile.name
        });
        setAutomobileEmpty(false);
      }
    },[route.params?.automobile]);

    const onSave = () => {
      console.log("onSave");

      if(!automobile?.id){
        setAutomobileEmpty(true);
        return;
      }

      if(!date.trim()){
        setDateEmpty(true);
        return;
      }

      if(!moment(date, "DD/MM/YYYY", true).isValid()){
        setDateEmpty(true);
        return;
      }

      if(!time.trim()){
        setTimeEmpty(true);
        return;
      }

      if(!value.trim()){
        setValueEmpty(true);
        return;
      }

      db.transaction(tx => {
        let query;
        let values;
        if(!date) return;

        let register_date = moment(date, "DD/MM/YYYY").format("YYYY-MM-DD");
        if(time)
          register_date+=" "+moment(time,"hh:mm a").format("HH:mm:ss");
        else
          register_date+=" 00:00:00";

        if(id){
          query="UPDATE kilometers SET automobile_id=?, register_date=?, value=? WHERE id=?";
          values=[automobile?.id, register_date, value, id];
        }
        else{
          query="INSERT INTO kilometers(automobile_id,register_date,value) VALUES(?,?,?)";
          values=[automobile?.id, register_date, value];
        }
        console.log("QUERY",query,values);

        tx.executeSql(query, values, (txObj, result) => {});
        global.refresh_screen["Status"] = true;
        //navigation.navigate('Kilometer.Index');
        navigation.goBack();
      });
    }

    const onListAutomobile = () => {
      navigation.navigate('Automobile.List', {screen: 'Kilometer.Form'});
    }

    const onCamera = () => {
      navigation.navigate('CameraScreen.Index', {screen: 'Kilometer.Form'});
    }

    return (
      <ScrollView style = {{...uiStyle.scrollView, backgroundColor: "white"}} >
        <View style = {{alignItems: "center"}} >
          {me.header}

          <TextInput
            label="Automobile"
            value={automobile?.name}
            error={automobileEmpty}
            editable={false}
            style={uiStyle.defaultWidth}
            right={<TextInput.Icon
              icon="magnify"
              onPress={() => onListAutomobile()}
            />}
          />
          {automobileEmpty && <HelperText type="error" style={uiStyle.defaultWidth}>
            Field required!
          </HelperText>}

          <TextInput
            label="Date"
            value={date}
            error={dateEmpty}
            //editable={false}
            onChangeText={v => {setDate(v); setDateEmpty(!v || !moment(v, "DD/MM/YYYY", true).isValid() ? true : false);}}
            style={uiStyle.defaultWidth}
            right={<TextInput.Icon
              icon="calendar"
              onPress={() => setDisplayDatePicker(true)}
            />}
          />
          {dateEmpty && <HelperText type="error" style={uiStyle.defaultWidth}>
            {!date.trim() ? "Field required!" : "Invalid value (Example: "+moment().format("DD/MM/YYYY")+")" }
          </HelperText>}
          <DatePickerModal
            mode="single"
            visible={displayDatePicker}
            onDismiss={onDismissDatePicker}
            date={new Date(date ? moment(date, "DD/MM/YYYY").format("YYYY-MM-DD")+" 00:00:00" : moment().format("YYYY-MM-DD")+" 00:00:00")}
            onConfirm={onConfirmDatePicker}
          />

          <TextInput
            label="Time"
            value={time}
            error={timeEmpty}
            //editable={false}
            onChangeText={v => {setTime(v); setTimeEmpty(!v || !moment(v, "hh:mm a", true).isValid() ? true : false);}}
            style={uiStyle.defaultWidth}
            right={<TextInput.Icon
              icon="clock"
              onPress={() => setDisplayTimePicker(true)}
            />}
          />
          {timeEmpty && <HelperText type="error" style={uiStyle.defaultWidth}>
            {!time.trim() ? "Field required!" : "Invalid value (Example: "+moment().format("hh:mm a")+")" }
          </HelperText>}
          <TimePickerModal
            visible={displayTimePicker}
            onDismiss={onDismissTimePicker}
            onConfirm={onConfirmTimePicker}
            hours={time.trim()?moment(time,"hh:mm a").format("HH"):"00"}
            minutes={time.trim()?moment(time,"hh:mm a").format("mm"):"00"}
          />

          <TextInput
            label="Kilometers"
            value={value}
            error={valueEmpty}
            onChangeText={v => {setValue(v); setValueEmpty(!v ? true : false);}}
            style={uiStyle.defaultWidth}
            keyboardType='numeric'
            right={<TextInput.Icon
              icon="camera"
              onPress={() => onCamera()}
            />}
          />
          {valueEmpty && <HelperText type="error" style={uiStyle.defaultWidth}>
            Field required!
          </HelperText>}

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
        </View>
      </ScrollView>
    );
  }
}
