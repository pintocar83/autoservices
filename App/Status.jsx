import React from 'react';
import moment from 'moment';
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Pressable,
} from 'react-native';
import {
  DataTable,
  Divider,
  TextInput,
  RadioButton,
  Switch,
  HelperText,
  List,
  Appbar,
  FAB,
  useTheme,
  IconButton,
  MD3Colors,
  Drawer,
} from 'react-native-paper';
import {DatePickerModal, TimePickerModal} from 'react-native-paper-dates';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SvgXml} from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {useFocusEffect} from '@react-navigation/native';

import {db, dbResultData, dbResultFirst} from './db';
import {
  ActionBar,
  AddButton,
  MsgBox,
  uiStyle,
  colorize,
  SvgDuotune,
  DSP,
} from './uiComponent';
import {useAutoServiceState} from './hooks';

export const Status = {
  header: <Text style={uiStyle.indexHeader}>Status</Text>,
  formatKm: num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
  formatTimePeriod: (months, days) => {
    let v = [];
    if (months > 12) {
      v.push((months / 12).toFixed(0) + ' years');
      months %= 12;
    }
    if (months > 0) v.push(months + ' months');
    if (days > 0) v.push(days + ' days');
    return v.join(' / ');
  },

  Index: ({route, navigation}) => {
    const me = Status;
    const params = route.params;
    const [data, setData] = React.useState([]);
    const [selection, setSelection] = React.useState('');
    const [visibleMsgBox, setVisibleMsgBox] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const [autoservice, setAutoservice] = useAutoServiceState();

    const getFavoriteAutomobile = () => {
      db.transaction(tx => {
        let query = `
          SELECT 
            A.*,
            K.value km,
            K.register_date km_date
          FROM automobiles A
            LEFT JOIN kilometers K ON K.id = (
              SELECT k1.id FROM kilometers k1
              WHERE k1.automobile_id = A.id
              ORDER BY k1.register_date DESC
              LIMIT 1
            )
          WHERE A.status=1 AND A.favorite=1
          LIMIT 1
        `;
        tx.executeSql(query, null, (txObj, result) => {
          let record = dbResultFirst(result);
          if (!record?.id) return;

          setAutoservice({
            automobile: {
              id: record?.id,
              name: record?.name,
              code: record?.code,
              km: record?.km,
              km_date: record?.km_date,
            },
          });
        });
      });
    };

    React.useEffect(() => {
      //console.log('Status->Index->useEffect[] autoservice->value', autoservice);

      //autoservice.reload("km");
      //Find favorite/default autombile
      if (!autoservice.automobile?.id) {
        getFavoriteAutomobile();
      }
    }, []);

    React.useEffect(() => {
      //console.log("Status->Index->useEffect[autoservice.automobile]", autoservice.automobile);
      onRefresh();
    }, [autoservice.automobile]);

    const onRefresh = () => {
      if (refreshing) return;
      if (!autoservice.automobile?.id) return;
      //console.log('Status->Index->onRefresh->autoservice.automobile', autoservice.automobile);
      setSelection('');
      setRefreshing(true);

      current_date = moment();

      db.transaction(tx => {
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
          WHERE
            S.automobile_id = ?
          GROUP BY
            S.service_type_id
          ORDER BY
            date DESC
        `;
        //console.log("Status->Index->onRefresh->query(1)", query);
        tx.executeSql(
          query,
          [autoservice.automobile.id],
          (txObj, result) => {
            //console.log('Status->Index->onRefresh->result', result);
            let record = dbResultData(result);
            //console.log("Status->Index->onRefresh->record", record);

            let o = [];
            for (let i = 0; i < record.length; i++) {
              let km_diff = autoservice.automobile?.km - record[i].km;

              let previous_date = moment(record[i].date, 'YYYY-MM-DD 00:00:00');

              let months = current_date.diff(previous_date, 'months');
              previous_date.add(months, 'months');
              let days = current_date.diff(previous_date, 'days');

              o.push({
                id: record[i].id,
                km: record[i].km,
                date: record[i].date,
                service_type_name: record[i].service_type_name,
                alert_km: record[i].alert_km,
                alert_time: record[i].alert_time,
                alert_time_type: record[i].alert_time_type,
                time_days: days,
                time_months: months,
                km_diff: km_diff,
              });
            }

            setData(o);
            setRefreshing(false);
          },
          () => {
            setRefreshing(false);
          },
        );
      });
    };

    //console.log("DATA 191: ",data);
    const ListItems =
      data &&
      data.map((row, index) => {
        let color = colorize('dark');
        let color_secondary = colorize('muted');
        let backgroundColor = null;
        let icon = null;
        let icon_size = 26;
        let icon_style_container = {
          borderRadius: 5,
          padding: 5,
          marginLeft: 10,
          marginTop: 0,
        };

        if (selection === row.id) {
          color_secondary = color = colorize('dark');
          //color_secondary = color;
          backgroundColor = colorize('bg-light-warning');
        }

        let alert_time_sw = false;
        if (row.alert_time > 0) {
          if (
            row.alert_time_type == 'D' &&
            row.time_months * 30 + row.time_days > row.alert_time
          ) {
            alert_time_sw = true;
          } else if (
            row.alert_time_type == 'M' &&
            (row.time_months > row.alert_time ||
              (row.time_months == row.alert_time && row.time_days > 0))
          ) {
            alert_time_sw = true;
          } else if (
            row.alert_time_type == 'Y' &&
            row.time_months / 12 > row.alert_time
          ) {
            alert_time_sw = true;
          }
        }

        icon_color = color;
        if (row.km_diff > row.alert_km && row.alert_km > 0) {
          //icon = "alert";
          //icon_color = "#ffeb3b";
          alert_time_sw = true;
        }

        //console.log("icon", icon);

        let time_periodo = me.formatTimePeriod(row.time_months, row.time_days);
        //Service Type - DD/XX/XXXX
        //260.000 km ~ 4.000 km / 10 months / 5 days
        icon = alert_time_sw ? (
          <View
            style={{
              ...icon_style_container,
              backgroundColor: colorize('bg-light-warning'),
              elevation: selection === row.id ? 2 : 0,
            }}>
            <SvgXml
              xml={SvgDuotune.Exclamation(colorize('warning'))}
              width={icon_size}
              height={icon_size}
            />
          </View>
        ) : (
          <View
            style={{
              ...icon_style_container,
              backgroundColor: colorize('bg-light-primary'),
            }}>
            <SvgXml
              xml={SvgDuotune.Gauge(colorize('primary'))}
              width={icon_size}
              height={icon_size}
            />
          </View>
        );

        return (
          <Pressable
            android_ripple={{
              color: colorize('pressable-warning'),
              borderless: false,
            }}
            onPress={() => setSelection(selection === row.id ? '' : row.id)}
            key={row.id}
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              paddingBottom: 10,
              paddingTop: 10,
              paddingLeft: 15,
              paddingRight: 15,
              backgroundColor: backgroundColor,
            }}>
            <View style={{flex: 1, flexDirection: 'column'}}>
              <View style={{flexDirection: 'row'}}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    flex: 1,
                    fontWeight: 'bold',
                    paddingRight: 5,
                    fontSize: 13,
                    color: color,
                  }}>
                  {row.service_type_name}
                </Text>
                <DSP.Badge theme="light-primary">
                  {moment(row.date).format('DD/MM/YYYY')}
                </DSP.Badge>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={{fontSize: 12, color: color_secondary}}>
                  <Text style={{fontWeight: 'bold'}}>
                    &#x26A1;{' '}
                    {row.km_diff >= 0 ? me.formatKm(row.km_diff) + ' km' : ''}
                  </Text>
                </Text>
                <View style={{flex: 1}}>
                  <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    textAlign="right"
                    style={{
                      flex: 1,
                      paddingLeft: 5,
                      paddingRight: 5,
                      textAlign: 'right',
                      fontSize: 12,
                      color: color_secondary,
                    }}>
                    {time_periodo ? time_periodo : ''}
                  </Text>
                </View>
              </View>
            </View>
            {icon}
          </Pressable>
        );
      });

    const onListAutomobile = () => {
      navigation.navigate('Automobile.List');
    };

    const [state, setState] = React.useState({open: false});

    const onStateChange = ({open}) => setState({open});

    const {open} = state;

    return (
      <View style={{...uiStyle.container, backgroundColor: '#FFFFFF'}}>
        <ScrollView
          style={{...uiStyle.scrollView, width: '100%', paddingHorizontal: 0}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <DSP.Card
            title={autoservice.automobile?.name}
            description={
              autoservice.automobile?.km && (
                <Text style={{fontWeight: 'bold'}}>
                  {me.formatKm(autoservice.automobile?.km) + ' km'}
                </Text>
              )
            }
            onFind={() => onListAutomobile()}>
            {ListItems}
            {data && data.length === 0 && (
              <View alignItems="center">
                <Icon
                  name="eye-off"
                  color={colorize('muted')}
                  size={32}
                  style={{marginTop: 50}}
                />
                <Text style={{color: colorize('muted')}}>No result</Text>
              </View>
            )}
          </DSP.Card>
        </ScrollView>

        <FAB.Group
          open={open}
          visible
          icon={open ? 'dots-vertical' : 'plus-thick'}
          backdropColor="rgba(255,255,255,0.4)"
          color="white"
          fabStyle={{
            backgroundColor: open ? colorize('primary') : colorize('primary'),
            borderRadius: 30,
          }}
          actions={[
            {
              icon: 'gauge',
              label: 'Kilometer',
              color: 'white',
              labelStyle: {
                fontSize: 10,
                color: colorize('white'),
                backgroundColor: colorize('dark'),
                marginRight: -15,
                borderRadius: 3,
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 8,
                paddingRight: 8,
                lineHeight: 18,
              },
              style: {backgroundColor: colorize('primary'), borderRadius: 20},
              onPress: () =>
                navigation.navigate({
                  name: 'KilometerScanCam',
                  merge: true,
                  params: {
                    screen: 'Status',
                    automobile_id: autoservice.automobile?.id,
                    automobile_name: autoservice.automobile?.name,
                    kilometers: autoservice.automobile?.km,
                  },
                }),
            },
            {
              icon: 'car-wrench',
              label: 'Service',
              color: 'white',
              labelStyle: {
                fontSize: 10,
                color: colorize('white'),
                backgroundColor: colorize('dark'),
                marginRight: -15,
                borderRadius: 3,
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 8,
                paddingRight: 8,
                lineHeight: 18,
              },
              style: {backgroundColor: colorize('primary'), borderRadius: 20},
              onPress: () =>
                navigation.navigate({
                  name: 'Service.Form',
                  params: {
                    automobile_id: autoservice.automobile?.id,
                    automobile_name: autoservice.automobile?.name,
                  },
                }),
            },
          ]}
          onStateChange={onStateChange}
        />
      </View>
    );
  },
};
