import React from 'react';
import moment from 'moment';
import { View, Text, Button, ScrollView, StyleSheet, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { DataTable, Divider, TextInput, RadioButton, Switch, HelperText, List, Appbar, FAB, useTheme, IconButton, MD3Colors, Drawer } from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { db, dbResultData, dbResultFirst }  from './db';
import { ActionBar, AddButton, MsgBox, uiStyle, colorize, SvgDuotune, DSP }  from './uiComponent';


export const Status = {
  header: <Text style={uiStyle.indexHeader}>Status</Text>,
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
    const [data, setData] = React.useState([]);
    const [selection, setSelection] = React.useState("");
    const [visibleMsgBox, setVisibleMsgBox] = React.useState(false);

    const [automobile, setAutomobile] = React.useState({
      id:   params?.automobile.id ? params?.automobile.id   : params?.automobile_id,
      name: params?.automobile.id ? params?.automobile.name : params?.automobile_name
    });
    const [automobileEmpty, setAutomobileEmpty] = React.useState(false);

    const [km, setKm] = React.useState({id: '', date: '', value: ''});

    const [refreshing, setRefreshing] = React.useState(false);


    const getFavoriteAutomobile = () =>  {
      db.transaction(tx => {
        let query = "SELECT * FROM automobiles WHERE favorite=1 LIMIT 1";
        tx.executeSql(query, null, (txObj, result) => {
          let record = dbResultFirst(result);
          if(!record?.id) return;

          setAutomobile({
            id: record?.id,
            name: record?.name
          });
          setAutomobileEmpty(false);
        });
      });
    }

    React.useEffect(() => {
      console.log("First Execution");
      //Find default autombile
      getFavoriteAutomobile();
    },[]);

    React.useEffect(() => {
      navigation.addListener('focus', () => {
        //console.log('FOCUS: Status params', params);
        //console.log('FOCUS: Status automobile', automobile);
        //onRefresh();
      });
    }, [navigation]);
    console.log("selection", selection);

    //React.useEffect(() => {
    //  onRefresh();
    //},[data]);

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
      setRefreshing(true);

      db.transaction(tx => {
        let query = "SELECT * FROM kilometers WHERE automobile_id = ? ORDER BY register_date DESC LIMIT 1";
        console.log("QUERY: "+query);
        tx.executeSql(query, [automobile?.id], (txObj, result) => {
          console.log("RESULT: ", result);
          let current_kilometer = dbResultFirst(result);
          console.log("DATA: ", current_kilometer);
          if(current_kilometer?.id){
            current_kilometer.register_date = moment().format("YYYY-MM-DD HH:mm:ss");
            setKm({
              id: current_kilometer.id,
              date: current_kilometer.register_date,
              value: current_kilometer.value
            });

            //find service types, foreach last services display km (service), and calculate km / time diff
            //Service Type - DD/XX/XXXX
            //260.000 km ~ 4.000 km / 10 months / 5 days
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
              let record = dbResultData(result);

              let o = [];
              for(let i=0;i<record.length;i++){
                let km_diff = current_kilometer.value - record[i].km;

                let tmp_service_date = moment(current_kilometer.register_date, "YYYY-MM-DD HH:mm:ss");
                let tmp_service_date_previous = moment(record[i].date, "YYYY-MM-DD HH:mm:ss");

                let months = tmp_service_date.diff(tmp_service_date_previous, 'months');
                tmp_service_date_previous.add(months, 'months');
                let days = tmp_service_date.diff(tmp_service_date_previous, 'days');

                o.push({
                  id:                record[i].id,
                  km:                record[i].km,
                  date:              record[i].date,
                  service_type_name: record[i].service_type_name,
                  alert_km:          record[i].alert_km,
                  alert_time:        record[i].alert_time,
                  alert_time_type:   record[i].alert_time_type,
                  time_days:         days,
                  time_months:       months,
                  km_diff:           km_diff,
                });
              }

              setData(o);
              setRefreshing(false);
            },
            () => {
              setRefreshing(false);
            });
          }
          else{
            setRefreshing(false);
          }
        });
      });
    }


    //console.log("DATA 191: ",data);
    const ListItems = data && data.map((row, index) => {
      let color = colorize("dark");
      let color_secondary = colorize("muted");
      let backgroundColor = null;
      let icon = null;

      if(selection === row.id){
        color_secondary = color = "#002966";
        //color_secondary = color;
        backgroundColor = "#ffffb3";
      }

      let alert_time_sw=false;
      if(row.alert_time > 0) {
        if(row.alert_time_type == "D" && (row.time_months*30 + row.time_days) > row.alert_time){
          alert_time_sw=true;
        }
        else if(row.alert_time_type == "M" && (row.time_months > row.alert_time || (row.time_months == row.alert_time && row.time_days > 0))){
          alert_time_sw=true;
        }
        else if(row.alert_time_type == "Y" && row.time_months/12 > row.alert_time){
          alert_time_sw=true;
        }
      }

      icon_color = color;
      if(row.km_diff > row.alert_km && row.alert_km > 0){
        //icon = "alert";
        //icon_color = "#ffeb3b";
        alert_time_sw = true;
      }

      //console.log("icon", icon);

      let time_periodo = me.formatTimePeriod(row.time_months, row.time_days);
      //Service Type - DD/XX/XXXX
      //260.000 km ~ 4.000 km / 10 months / 5 days
      /*
      return (
        <List.Item
          key={row.id}
          title={row.service_type_name + " - " + moment(row.date).format('DD/MM/YYYY')}
          description=<Text>{me.formatKm(row.km) + " km" + (row.km_diff > 0 ? " ~ " + me.formatKm(row.km_diff) + " km" : "")+(time_periodo ? " / " + time_periodo : " ~  N/A")}{row.details && <Text style={{fontSize: 12, paddingLeft: 10}}> - {row.details}.</Text>}</Text>
          onPress={() => setSelection(row.id)}
          right={() => icon && <List.Icon icon={icon} color={icon_color} style={{marginLeft: 0, marginRight: 0}}/>}
          titleStyle={{color: color, fontWeight: 'bold', fontSize: 13}}
          descriptionStyle={{color: color, fontSize: 13}}
          style={{backgroundColor: backgroundColor, width: '100%', flex: 1}}
        />
      );
      */
      //alert_time_sw = true;

      icon = ( alert_time_sw ?
        <View style={{backgroundColor: colorize('bg-light-warning'), borderRadius: 5, padding: 5, marginRight: 10}}>
          <SvgXml xml={SvgDuotune.Exclamation(colorize('warning'))} width="22" height="22" />
        </View> :
        <View style={{backgroundColor: colorize('bg-light-primary'), borderRadius: 5, padding: 5, marginRight: 10}}>
          <SvgXml xml={SvgDuotune.Gauge(colorize('primary'))} width="22" height="22" />
        </View>
      );


      return (
        <TouchableOpacity
          key={row.id}
          onPress={ () => setSelection(row.id) }>
          <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', paddingBottom: 10, paddingTop: 10, paddingLeft: 15, paddingRight: 15, backgroundColor: backgroundColor}}>
            { icon }
            <View style={{flex: 1, flexDirection: 'column'}}>
              <View style={{flexDirection: 'row'}}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, fontWeight: 'bold', paddingRight: 5, fontSize: 13, color: color }}>{row.service_type_name}</Text>
                <DSP.Badge theme="light-primary">{moment(row.date).format('DD/MM/YYYY')}</DSP.Badge>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text numberOfLines={2} ellipsizeMode="tail" style={{ flex: 1, paddingRight: 5, fontSize: 12, color: color_secondary }}>
                  <Text style={{fontWeight: 'bold'}}>{me.formatKm(row.km) + " km ~ "}</Text> {(row.km_diff >= 0 ? me.formatKm(row.km_diff) + " km" : "") + (time_periodo ? " / " + time_periodo : "")}
                </Text>
              </View>
            </View>
            <View style={{width: 0, height: 10, backgroundColor: 'red'}}></View>
          </View>
          { index < data.length -1 ? <DSP.Divider style={{marginLeft: 15, marginRight: 15}} /> : null }
        </TouchableOpacity>
      );
    });

    const onListAutomobile = () => {
      navigation.navigate('Automobile.List', {screen: 'Status.Index'});
    }


    const [state, setState] = React.useState({ open: false });

    const onStateChange = ({ open }) => setState({ open });

    const { open } = state;

    return (
      <View style={{...uiStyle.container, backgroundColor: '#FFFFFF'}}>
        <ScrollView
          style = {{ ...uiStyle.scrollView, width: '100%', paddingHorizontal: 0 }}
          refreshControl = { <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> }
          >
          <View style={{paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0}}>
            <DSP.Card
              title={automobile?.name}
              description={ km?.id &&
                <>
                  <Text style={{fontWeight: 'bold'}}>{me.formatKm(km?.value) + " km"}</Text>
                </>
              }
              onFind={() => onListAutomobile()}
              >
              { ListItems }
              { data && data.length===0 &&
                <View alignItems="center">
                  <Icon name="eye-off" color={colorize("muted")} size={32} style={{marginTop: 50}} />
                  <Text style={{color: colorize("muted")}}>No result</Text>
                </View>
              }
            </DSP.Card>
          </View>
        </ScrollView>

        <FAB.Group
          open = { open }
          visible
          icon = { open ? 'dots-vertical': 'plus-thick' }
          backdropColor="rgba(255,255,255,0.4)"
          color="white"
          fabStyle={{
            backgroundColor: colorize("primary"),
            borderRadius: 30
          }}
          actions={[
            {
              icon: 'gauge',
              label: 'Kilometer',
              color: "white",
              labelStyle: {fontSize: 10, color: colorize("white"), backgroundColor: colorize("dark"), marginRight: -15, borderRadius: 3, paddingTop: 0, paddingBottom: 0, paddingLeft: 8, paddingRight: 8, lineHeight: 18},
              style: { backgroundColor: colorize("primary"), borderRadius: 20 },
              onPress: () => navigation.navigate({ name: "Kilometer.Form", params: { automobile_id: automobile?.id, automobile_name: automobile?.name } })
            },
            {
              icon: 'car-wrench',
              label: 'Service',
              color: "white",
              labelStyle: {fontSize: 10, color: colorize("white"), backgroundColor: colorize("dark"), marginRight: -15, borderRadius: 3, paddingTop: 0, paddingBottom: 0, paddingLeft: 8, paddingRight: 8, lineHeight: 18},
              style: { backgroundColor: colorize("primary"), borderRadius: 20 },
              onPress: () => navigation.navigate({ name: "Service.Form", params: { automobile_id: automobile?.id, automobile_name: automobile?.name } })
            },
          ]}
          onStateChange={onStateChange}
        />

      </View>

    );
  },

}

