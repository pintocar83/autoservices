import React from 'react';
import moment from 'moment';
import { View, Text, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import { DataTable, Divider, TextInput, RadioButton, Switch, HelperText, List, Appbar, FAB, useTheme, IconButton, MD3Colors } from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db, dbResultData }  from './db';
import { ActionBar, AddButton, MsgBox, uiStyle }  from './uiComponent';


export const Service = {
  header: <Text style={uiStyle.indexHeader}>Services</Text>,
  formatKm: (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
  formatTimePeriod: (months, days) => {
    let v=[];
    if(months>0)
      v.push(months+" months");
    if(days>0)
      v.push(days+" days");
    return v.join(" / ");
  },

  Index: ({ navigation }) => {
    const me = Service;
    const [data, setData] = React.useState(null);
    const [selection, setSelection] = React.useState("");
    const [visibleMsgBox, setVisibleMsgBox] = React.useState(false);

    React.useEffect(() => {
      navigation.addListener('focus', () => {
        console.log('FOCUS: Service');
        onRefresh();
      });
    }, [navigation]);
    console.log("selection", selection);

    const onRefresh = () => {
      setSelection("");
      console.log("onRefresh");
      db.transaction(tx => {
        let query = `
          SELECT
            S.*,
            ST.name service_type_name,
            A.code automobile_code,
            A.name automobile_name
          FROM
            services S
              INNER JOIN service_types ST ON S.service_type_id = ST.id
              INNER JOIN automobiles A    ON S.automobile_id = A.id
          ORDER BY 
            S.service_date DESC`;
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
      navigation.navigate('Service.Form', record);
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
        let query = "DELETE FROM services WHERE id=?";
        console.log("QUERY: "+query, "selection: "+selection);
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

      let time_periodo = me.formatTimePeriod(row.time_months, row.time_days);

      return (
        <List.Item
          key={row.id}
          title={moment(row.service_date).format('DD/MM/YYYY hh:mma') + " - " + row.service_type_name}
          description={
            <View style={{flexDirection: 'column', flexWrap: 'wrap', width: '100%'}}>
              <Text style={{color: color}}>{me.formatKm(row.km) + " km" + (row.km_diff > 0 ? " ~ " + me.formatKm(row.km_diff) + " km" : "")+(time_periodo ? " / " + time_periodo : "")}</Text>
              <Text style={{flex: 1, fontSize: 12, color: color}}>{row.details}</Text>
            </View>
          }
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
        <ActionBar
          onAdd={() => navigation.navigate('Service.Form')}
          onRefresh={onRefresh}
          onEdit={onEdit}
          onDelete={onDelete}
          disabledEdit={!selection}
          disabledDelete={!selection}
          />
        {me.header}
        <ScrollView style={{...uiStyle.scrollView, width: '100%'}}>
          <List.Section style={uiStyle.defaultWidth}>
            {ListItems}
          </List.Section>
        </ScrollView>
        {data && data.length===0 && <Text variant="bodyLarge">No result</Text>}
        {visibleMsgBox && <MsgBox visible={visibleMsgBox} setVisible={setVisibleMsgBox} title="Delete" message="Do you want to do it?" onDone={onDeleteDone} />}
      </View>
    );
  },

  Form: ({ route, navigation }) => {
    const me = Service;
    const params = route.params;
    //console.log("params.serviceType",params?.serviceType);
    const id = params && params.id ? params.id : "";
    const [date, setDate] = React.useState(params && params.service_date ? moment(params.service_date,"YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY") : moment().format("DD/MM/YYYY"));
    const [time, setTime] = React.useState(params && params.service_date ? moment(params.service_date,"YYYY-MM-DD HH:mm:ss").format("hh:mm a") : moment().format("hh:mm a"));
    const [serviceType, setServiceType] = React.useState({id: params?.service_type_id, name: params?.service_type_name});
    const [servicePrevious, setServicePrevious] = React.useState({id: '', km: '', service_date: ''});
    const [kmCurrent, setKmCurrent] = React.useState(params?.km ? String(params?.km) : '');
    const [kmPrevious, setKmPrevious] = React.useState(params?.km_previous ? String(params?.km_previous) : '');
    const [kmDiff, setKmDiff] = React.useState(params?.km_diff ? String(params?.km_diff) : '');
    const [details, setDetails] = React.useState(params?.details ? params?.details : '');
    const [timePrevious, setTimePrevious] = React.useState({months: params?.time_months, days: params?.days});
    const [automobile, setAutomobile] = React.useState({id: params?.automobile_id, name: params?.automobile_name});
    //const [serviceType, setServiceType] = React.useState({id: params?.serviceType?.id, name: params?.serviceType?.name});
    //const serviceType = useNavigationState(state => state.routes.serviceType);


    const [timeEmpty, setTimeEmpty] = React.useState(false);
    const [dateEmpty, setDateEmpty] = React.useState(false);
    const [serviceTypeEmpty, setServiceTypeEmpty] = React.useState(false);
    const [kmCurrentEmpty, setKmCurrentEmpty] = React.useState(false);
    const [automobileEmpty, setAutomobileEmpty] = React.useState(false);

    const [displayDatePicker, setDisplayDatePicker] = React.useState(false);
    const [displayTimePicker, setDisplayTimePicker] = React.useState(false);
    const [displayKmPrevious, setDisplayKmPrevious] = React.useState(false);


    const findKilometerServiceType = () => {
      if(!date.trim())
        return;

      if(!time.trim())
        return;

      if(!serviceType?.id)
        return;

      let service_date = getServiceDate();

      console.log("findKilometerServiceType");

      db.transaction(tx => {
        let query = "SELECT * FROM services WHERE service_type_id = ? AND service_date < ? AND id <> ? ORDER BY service_date DESC LIMIT 1";
        let values = [serviceType?.id, service_date, id];
        console.log("QUERY: "+query, values);
        tx.executeSql(query, values , (txObj, result) => {
          console.log("RESULT: ", result);
          let previous_service = dbResultData(result);
          console.log("previous_service",previous_service);
          if(previous_service.length > 0){
            setServicePrevious({
              id: previous_service[0].id,
              km: previous_service[0].km,
              service_date: previous_service[0].service_date
            });
            setKmPrevious(String(previous_service[0].km));
            setKmDiff(String(kmCurrent-kmPrevious));

            //updateTimePrevious();
            setDisplayKmPrevious(true);
          }

        });
      });
    };


    React.useEffect(() => {
      if(route.params?.automobile) {
        setAutomobile({
          id: route.params?.automobile.id,
          name: route.params?.automobile.name
        });
        setAutomobileEmpty(false);
      }
    },[route.params?.automobile]);


    React.useEffect(() => {
      if(route.params?.serviceType) {
        //console.log("useEffect route.params?.serviceType");
        setServiceType({
          id: route.params?.serviceType.id, 
          name: route.params?.serviceType.name
        });
        setServiceTypeEmpty(false);
      }
    },[route.params?.serviceType]);

    React.useEffect(() => {
      //console.log("useEffect serviceType");
      findKilometerServiceType();
    },[date, serviceType]);

    React.useEffect(() => {
      updateTimePrevious();
    },[servicePrevious]);


    //console.log("serviceType",serviceType);

    const getServiceDate = () => {
      if(!date.trim())
        return "";

      if(!time.trim())
        return "";

      let service_date = moment(date, "DD/MM/YYYY").format("YYYY-MM-DD");
      if(time)
        service_date+=" "+moment(time,"hh:mm a").format("HH:mm:ss");
      else
        service_date+=" 00:00:00";
      return service_date;
    };

    const updateTimePrevious = () => {
      let service_date = getServiceDate();
      let service_date_previous = servicePrevious.service_date;

      if(!service_date || !service_date_previous){
        return;
      }

      console.log("service_date", service_date);
      console.log("service_date_previous", service_date_previous);

      service_date = moment(service_date, "YYYY-MM-DD HH:mm:ss");
      service_date_previous = moment(service_date_previous, "YYYY-MM-DD HH:mm:ss");

      let months = service_date.diff(service_date_previous, 'months');
      console.log("months",months);
      service_date_previous.add(months, 'months');
      let days = service_date.diff(service_date_previous, 'days');
      console.log("days",days);

      setTimePrevious({
        months: months,
        days: days
      });
    };
    

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

      if(!serviceType?.id){
        setServiceTypeEmpty(true);
        return;
      }

      if(!kmCurrent.trim()){
        setKmCurrentEmpty(true);
        return;
      }

      db.transaction(tx => {
        let query;
        let values;
        if(!date) return;
        if(!serviceType?.id) return;
        if(!kmCurrent) return;

        let service_date = moment(date, "DD/MM/YYYY").format("YYYY-MM-DD");
        if(time)
          service_date+=" "+moment(time,"hh:mm a").format("HH:mm:ss");
        else
          service_date+=" 00:00:00";

        if(id){
          query="UPDATE services SET automobile_id=?, service_type_id=?, service_date=?, km=?, km_previous=?, km_diff=?, time_months=?, time_days=?, details=? WHERE id=?";
          values=[automobile?.id, serviceType?.id, service_date, kmCurrent, kmPrevious, kmDiff, timePrevious?.months, timePrevious?.days, details, id];
        }
        else{
          query="INSERT INTO services(automobile_id, service_type_id, service_date, km, km_previous, km_diff, time_months, time_days, details) VALUES(?,?,?,?,?,?,?,?,?)";
          values=[automobile?.id, serviceType?.id, service_date, kmCurrent, kmPrevious, kmDiff, timePrevious?.months, timePrevious?.days, details];
        }
        console.log("QUERY",query,values);

        tx.executeSql(query, values, (txObj, result) => {});


        //delete old kilometer insert kilometers
        query = "DELETE FROM kilometers WHERE register_date=?";
        values = [service_date];
        tx.executeSql(query, values, (txObj, result) => {});

        query = "INSERT INTO kilometers(automobile_id, register_date, value) VALUES(?,?,?)";
        values = [automobile?.id, service_date, kmCurrent];
        tx.executeSql(query, values, (txObj, result) => {});

        navigation.navigate('Service.Index');
      });
    }

    const onAcceptListServiceType = (record) => {

      console.log("onAcceptListServiceType",record);
      setServiceType(record);
    }

    const onListServiceType = () => {
      //navigation.navigate('ServiceType.List', {onAccept: (record) => onAcceptListServiceType(record)});
      navigation.navigate('ServiceType.List', {screen: 'Service.Form'});
    }

    const onChangeKilometers = (value) => {
      value = value.replace(/[^0-9]/g, '');
      setKmCurrent(value); 
      setKmCurrentEmpty(!value ? true : false);
      if(displayKmPrevious){
        setKmDiff(value-kmPrevious);
      }
    }

    const timePreviousFormat = () => {
      let v=[];
      if(timePrevious?.months)
        v.push(timePrevious?.months+" months");
      if(timePrevious?.days)
        v.push(timePrevious?.days+" days");
      return v.join(" / ");
    };

    const onListAutomobile = () => {
      navigation.navigate('Automobile.List', {screen: 'Service.Form'});
    }

    return (
      <ScrollView style={uiStyle.scrollView}>
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
          use24HourClock={false}
          hours={time.trim()?moment(time,"hh:mm a").format("HH"):"00"}
          minutes={time.trim()?moment(time,"hh:mm a").format("mm"):"00"}
        />

        <TextInput
          label="Service Type"
          value={serviceType?.name}
          error={serviceTypeEmpty}
          editable={false}
          style={uiStyle.defaultWidth}
          right={<TextInput.Icon
            icon="magnify"
            onPress={() => onListServiceType()}
          />}
        />
        {serviceTypeEmpty && <HelperText type="error" style={uiStyle.defaultWidth}>
          Field required!
        </HelperText>}

        <TextInput
          label="Kilometers"
          value={String(kmCurrent)}
          error={kmCurrentEmpty}
          style={uiStyle.defaultWidth}
          onChangeText={onChangeKilometers}
          keyboardType='numeric'
        />
        {kmCurrentEmpty && <HelperText type="error" style={uiStyle.defaultWidth}>
          Field required!
        </HelperText>}

        {displayKmPrevious && <TextInput
          label="Kilometers (previous)"
          value={String(kmPrevious)}
          editable={false}
          style={uiStyle.defaultWidth}
        />}

        {displayKmPrevious && <TextInput
          label="Kilometers (tracked)"
          value={String(kmDiff)}
          editable={false}
          style={uiStyle.defaultWidth}
        />}

        {displayKmPrevious && <TextInput
          label="Time (previous)"
          value={timePreviousFormat()}
          editable={false}
          style={uiStyle.defaultWidth}
        />}

        <TextInput
          label="Details"
          value={details}
          //multiline={true}
          style={uiStyle.defaultWidth}
          //contentStyle={{marginTop: 30, height: 80}}
          onChangeText={value => {setDetails(value)}}
        />

        <View style={uiStyle.buttonContainer}>
          <Button
            mode="contained"
            title="Cancel"
            style={uiStyle.buttonActionForm}
            contentStyle={uiStyle.buttonActionForm}
            onPress={() => navigation.navigate('Service.Index')}
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
