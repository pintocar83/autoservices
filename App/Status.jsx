import React from 'react';
import moment from 'moment';
import { View, Text, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import { DataTable, Divider, TextInput, RadioButton, Switch, HelperText, List, Appbar, FAB, useTheme, IconButton, MD3Colors, Drawer } from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db, dbResultData }  from './db';
import { ActionBar, AddButton, MsgBox, uiStyle }  from './uiComponent';


export const Status = {
  header: <Text style={uiStyle.indexHeader}>Services Status</Text>,
  formatKm: (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
  formatTimePeriod: (months, days) => {
    let v=[];
    if(months>12){
      v.push((months/12).toFixed(0)+" years");
      months%=12;
    }
    if(months>0)
      v.push(months+" months");
    if(days>0)
      v.push(days+" days");
    return v.join(" / ");
  },

  Index: ({ route, navigation }) => {
    const me = Status;
    const params = route.params;
    const [data, setData] = React.useState(null);
    const [selection, setSelection] = React.useState("");
    const [visibleMsgBox, setVisibleMsgBox] = React.useState(false);

    const [automobile, setAutomobile] = React.useState({id: params?.automobile.id, name: params?.automobile.name});
    const [automobileEmpty, setAutomobileEmpty] = React.useState(false);

    const [km, setKm] = React.useState({id: '', date: '', value: ''});

    React.useEffect(() => {
      navigation.addListener('focus', () => {
        //console.log('FOCUS: Status params', params);
        //console.log('FOCUS: Status automobile', automobile);
        onRefresh();
      });
    }, [navigation]);
    console.log("selection", selection);

    React.useEffect(() => {
      if(route.params?.automobile) {
        //console.log("useEffect route.params?.automobile", route.params?.automobile);
        setAutomobile({
          id: route.params?.automobile.id,
          name: route.params?.automobile.name
        });
        setAutomobileEmpty(false);
      }
    },[route.params?.automobile]);

    React.useEffect(() => {
      if(automobile?.id) {
        onRefresh();
      }
    },[automobile]);

    const onRefresh = () => {
      if(!automobile?.id)
        return;
      /*
      db.transaction(tx => {
        let query = "select S.id, ST.name service_type_name, max(S.service_date) date, S.km FROM services S INNER JOIN service_types ST ON S.service_type_id=ST.id GROUP BY S.service_type_id";
        tx.executeSql(query, null, (txObj, result) => {
          let xxxx = dbResultData(result);
          console.log("YYYYYYYYYYYYYY",xxxx);

        });
      });

      return;*/

      setSelection("");
      console.log("onRefresh");
      db.transaction(tx => {
        let query = "SELECT * FROM kilometers WHERE automobile_id = ? ORDER BY register_date DESC LIMIT 1";
        console.log("QUERY: "+query);
        tx.executeSql(query, [automobile?.id], (txObj, result) => {
          console.log("RESULT: ", result);
          let last_km = dbResultData(result);
          console.log("DATA: ", last_km);
          if(last_km.length>0 && last_km[0].id){
            setKm({
              id: last_km[0].id,
              date: last_km[0].register_date,
              value: last_km[0].value
            });

            //find service types, foreach last services display km (service), and calculate km / time diff
            //Service Type - DD/XX/XXXX
            //260.000 km ~ 4.000 km / 10 months / 5 days
            
            let tmp_data = [];
            //let query = "select S.id, ST.name service_type_name, max(S.service_date) date, S.km FROM services S INNER JOIN service_types ST ON S.service_type_id=ST.id GROUP BY S.service_type_id";
            let query = `
              SELECT
                S.id,
                ST.name service_type_name,
                max(S.service_date) date,
                S.km,
                ST.alert_km,
                ST.alert_time,
                ST.alert_time_type
              FROM
                services S
                  INNER JOIN service_types ST ON S.service_type_id=ST.id
              GROUP BY
                S.service_type_id`;
            tx.executeSql(query, null, (txObj, result) => {
              let tmp = dbResultData(result);

              for(let i=0;i<tmp.length;i++){

                let km_diff = last_km[i].value - tmp[i].km;

                let tmp_service_date = moment(last_km[i].register_date, "YYYY-MM-DD HH:mm:ss");
                let tmp_service_date_previous = moment(tmp[i].date, "YYYY-MM-DD HH:mm:ss");

                let months = tmp_service_date.diff(tmp_service_date_previous, 'months');
                tmp_service_date_previous.add(months, 'months');
                let days = tmp_service_date.diff(tmp_service_date_previous, 'days');

                tmp_data.push({
                  id: tmp[i].id,
                  km: tmp[i].km,
                  date: tmp[i].date,
                  km_diff: km_diff,
                  time_months: months,
                  time_days: days,
                  service_type_name: tmp[i].service_type_name,
                  alert_km: tmp[i].alert_km,
                  alert_time: tmp[i].alert_time,
                  alert_time_type: tmp[i].alert_time_type
                });

              }

              console.log("XXXXXXX",tmp_data);
              setData(tmp_data);
            });




          }



        });
      });
    }

    const onRefreshOld = () => {
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


    const ListItems = data && data.map((row, index) => {
      let color = "gray";
      let backgroundColor = null;
      let icon = null;

      if(selection === row.id){
        color = "#3f51b5";
        backgroundColor = "#fafafa";
        //icon = "checkbox-marked";
      }

      let alert_time_sw=false;
      if(row.alert_time > 0) {
        if(row.alert_time_type == "D" && (row.time_months*30 + row.time_days) > row.alert_time){
          alert_time_sw=true;
        }
        else if(row.alert_time_type == "M" && (row.time_months > row.alert_time || (row.time_months == row.alert_time && row.time_days > 0))){
          console.log("entro");
          alert_time_sw=true;
        }
        else if(row.alert_time_type == "Y" && row.time_months/12 > row.alert_time){
          alert_time_sw=true;
        }
      }

      icon_color = color;
      if(alert_time_sw || (row.km_diff > row.alert_km && row.alert_km > 0)){
        icon = "alert";
        icon_color = "#ffeb3b";
      }

      console.log("icon", icon);

      let time_periodo = me.formatTimePeriod(row.time_months, row.time_days);
      //Service Type - DD/XX/XXXX
      //260.000 km ~ 4.000 km / 10 months / 5 days
      return (
        <List.Item
          key={row.id}
          title={row.service_type_name + " - " + moment(row.service_date).format('DD/MM/YYYY')}
          description=<Text>{me.formatKm(row.km) + " km" + (row.km_diff > 0 ? " ~ " + me.formatKm(row.km_diff) + " km" : "")+(time_periodo ? " / " + time_periodo : " ~  N/A")}{row.details && <Text style={{fontSize: 12, paddingLeft: 10}}> - {row.details}.</Text>}</Text>
          onPress={() => setSelection(row.id)}
          right={() => icon && <List.Icon icon={icon} color={icon_color} style={{marginLeft: 0, marginRight: 0}}/>}
          titleStyle={{color: color, fontWeight: 'bold', fontSize: 13}}
          descriptionStyle={{color: color, fontSize: 13}}
          style={{backgroundColor: backgroundColor, width: '100%', flex: 1}}
        />
      );
    });

    const onListAutomobile = () => {
      navigation.navigate('Automobile.List', {screen: 'Status.Index'});
    }

    return (
      <View style={uiStyle.container}>
        <ActionBar
          onRefresh={onRefresh}
          append=<View style={{flexDirection: "row"}}>
            <FAB
              mode="flat"
              color="white"
              icon="car-wrench"
              size="small"
              onPress={() => navigation.navigate({ name: "Service.Form", params: { automobile_id: automobile?.id, automobile_name: automobile?.name } })}
              style={uiStyle.fab}
              />
            <FAB
              mode="flat"
              color="white"
              icon="gauge"
              size="small"
              onPress={() => navigation.navigate({ name: "Kilometer.Form", params: { automobile_id: automobile?.id, automobile_name: automobile?.name } })}
              style={uiStyle.fab}
              />
            </View>
          />
        {me.header}
        <ScrollView style={{...uiStyle.scrollView, width: '100%'}}>
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

          { km?.id && <Text style={{paddingLeft: 15}}>
            <Text style={{fontWeight: 'bold'}}>{me.formatKm(km?.value) + " km"}</Text>
            <Text> - {moment(km.date).format('DD/MM/YYYY hh:mma')}</Text>
          </Text> }

          <List.Section style={uiStyle.defaultWidth}>
            {ListItems}
          </List.Section>
        </ScrollView>
        {data && data.length===0 && <Text variant="bodyLarge">No result</Text>}
      </View>

    );
  },

}
