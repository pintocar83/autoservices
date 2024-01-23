import React from 'react';
import moment from 'moment';
import {
  View,
  Text,
  Button,
  ScrollView,
  FlatList,
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
} from 'react-native-paper';
import {DatePickerModal, TimePickerModal} from 'react-native-paper-dates';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SvgXml} from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

export const Timeline = {
  formatKm: num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
  formatTimePeriod: (months, days, hours, minutes) => {
    let v = [];
    if (months > 12) {
      v.push((months / 12).toFixed(0) + ' years');
      months %= 12;
    }
    if (months > 0) v.push(months + ' months');
    if (days > 0) v.push(days + ' days');
    if (hours > 0) v.push(hours + ' hours');
    if (minutes > 0) v.push(minutes + ' minutes');
    return v.join(' / ');
  },

  Index: ({route, navigation}) => {
    //console.log('Timeline->Index->route', route);
    //console.log('Timeline->Index->navigation', navigation);
    const me = Timeline;
    const params = route.params;
    const [data, setData] = React.useState(null);
    const [selection, setSelection] = React.useState([]);
    const [multiSelection, setMultiSelection] = React.useState(false);
    const [visibleMsgBox, setVisibleMsgBox] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const [filtering, setFiltering] = React.useState(true);
    const [filter, setFilter] = React.useState({
      serviceType: {
        id: params?.serviceType?.id,
        name: params?.serviceType?.name,
      },
    });
    const [autoservice, setAutoservice] = useAutoServiceState();

    React.useEffect(() => {
      onRefresh();
    }, [filtering]);

    React.useEffect(() => {
      onRefresh();
    }, [autoservice.automobile]);

    React.useEffect(() => {
      onRefresh();
    }, [autoservice.filterTimelime]);

    const onRefresh = () => {
      if (refreshing) return;
      if (!autoservice.automobile?.id) return;
      //console.log("Timeline->Index->onRefresh->autoservice.automobile",autoservice.automobile);
      //console.log('Timeline->Index->onRefresh->filter',autoservice.filterTimelime);
      setSelection([]);
      setRefreshing(true);

      db.transaction(tx => {
        //let query =
        //  'SELECT K.*, A.name automobile_name, A.code automobile_code FROM kilometers K INNER JOIN automobiles A ON K.automobile_id=A.id WHERE K.automobile_id = ? ORDER BY register_date DESC';
        let query_where = '';
        let query_values = [
          autoservice.automobile?.id,
          autoservice.automobile?.id,
        ];
        if (filtering && autoservice.filterTimelime?.serviceType?.id) {
          //console.log("Timeline->Index->onRefresh->filtering?", filter.serviceType?.id);
          query_where += ' AND service_type_id = ?';
          query_values.push(autoservice.filterTimelime?.serviceType?.id);
        }

        let query = `
          SELECT
            date,
            km,
            MAX(service_type_name) service_type_name
          FROM (
            SELECT
              S.service_type_id,
              S.service_date date,
              S.km,
              ST.name service_type_name
            FROM
              services S
                INNER JOIN service_types ST ON S.service_type_id=ST.id
            WHERE
              S.automobile_id = ?
            UNION SELECT
              null service_type_id,
              K.register_date date,
              K.value km,
              null service_type_name
            FROM
              kilometers K
            WHERE
              K.automobile_id = ?
          )
          WHERE 1 ${query_where}
          GROUP BY
            date,
            km
          ORDER BY
            date DESC
        `;

        //console.log('QUERY: ' + query);
        tx.executeSql(
          query,
          query_values,
          (txObj, result) => {
            //console.log('RESULT: ', result);
            setData([
              {
                date: moment().format('YYYY-MM-DD HH:mm:ss'),
                km: autoservice.automobile?.km,
              },
              ...dbResultData(result),
            ]);
            setRefreshing(false);
          },
          () => {
            setRefreshing(false);
          },
        );
      });
    };

    const onServiceTypeList = () => {
      navigation.navigate('ServiceType.List');
    };

    const onServiceTypeClear = () => {
      setAutoservice({
        filterTimelime: {
          serviceType: {
            id: '',
            name: '',
          },
        },
      });
    };

    const RowItem = (row, index) => {
      let color = 'gray';
      let backgroundColor = colorize('white');
      let icon = 'checkbox-blank-outline';
      let selected = false;

      if (selection.includes(row.id)) {
        selected = true;
        color = '#3f51b5';
        color_secondary = color = colorize('dark');
        backgroundColor = colorize('bg-light-warning');
        icon = 'checkbox-marked';
      }

      icon = null;
      let icon_size = 22;

      let next = null;
      let diff_km = null;
      let time_periodo = null;
      if (index < data.length - 1) {
        next = data[index + 1];
        diff_km = row.km - next.km;

        let date = moment(row.date, 'YYYY-MM-DD 00:00:00');
        let date_next = moment(next.date, 'YYYY-MM-DD 00:00:00');

        let months = date.diff(date_next, 'months');
        date_next.add(months, 'months');
        let days = date.diff(date_next, 'days');
        time_periodo = me.formatTimePeriod(months, days);

        if (months === 0 && days === 0) {
          let date = moment(row.date, 'YYYY-MM-DD HH:mm:ss');
          let date_next = moment(next.date, 'YYYY-MM-DD HH:mm:ss');

          let hours = date.diff(date_next, 'hours');
          date_next.add(hours, 'hours');
          let minutes = date.diff(date_next, 'minutes');

          time_periodo = me.formatTimePeriod(months, days, hours, minutes);
        }
      }

      let last_item = index === data.length - 1;
      let first_item = index === 0;

      return (
        <Pressable
          disabled={true}
          android_ripple={{
            color: colorize('pressable-warning'),
            borderless: false,
          }}
          style={{
            width: 340,
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: 0,
            paddingTop: 0,
            paddingLeft: 15,
            paddingRight: 15,
            marginBottom: last_item ? 40 : 20,
            borderRadius: 5,
            backgroundColor: backgroundColor,
            alignSelf: 'center',
          }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              paddingBottom: 0,
              paddingTop: 0,
            }}>
            <View style={{width: 120}}>
              <Text
                style={{
                  fontWeight: 'bold',
                  paddingRight: 25,
                  fontSize: 14,
                  color: colorize('primary'),
                  textAlign: 'right',
                }}>
                {row.km === next?.km ? '' : me.formatKm(row.km) + ' km'}
              </Text>
              {!last_item && (
                <Text
                  style={{
                    paddingRight: 0,
                    fontSize: 10,
                    color: colorize('gray-500'),
                    textAlign: 'right',
                  }}>
                  {diff_km > 0 && diff_km !== null
                    ? me.formatKm(diff_km * 1) + ' km'
                    : ''}
                </Text>
              )}
              <Text
                style={{
                  paddingLeft: 0,
                  fontSize: 11,
                  color: colorize('gray-500'),
                  textAlign: 'left',
                }}>
                {''}
              </Text>
            </View>
            <View style={{height: 50}}>
              <View
                style={{
                  position: 'absolute',
                  top: index === 0 ? 10 : 0,
                  bottom: last_item ? null : -21,
                  height: last_item ? 10 : null,
                  left: 10,
                  width: 2,
                  backgroundColor: colorize('primary'),
                }}></View>
              {row.service_type_name ? (
                <View
                  style={{
                    backgroundColor: colorize('primary'),
                    padding: 4,
                    borderRadius: icon_size,
                  }}>
                  <Icon name="wrench" size={icon_size - 8} color={'white'} />
                </View>
              ) : (
                <SvgXml
                  xml={SvgDuotune.Circle(colorize('primary'))}
                  width={icon_size}
                  height={icon_size}
                />
              )}
            </View>
            <View>
              <Text
                style={{
                  color: colorize('default'),
                  fontSize: 12,
                  fontWeight: 'bold',
                  paddingTop: 1,
                  paddingBottom: 1,
                  paddingRight: 3,
                  paddingLeft: 20,
                  flex: 0,
                }}>
                {first_item
                  ? 'Today'
                  : moment(row.date).format('DD/MM/YYYY hh:mma')}
              </Text>
              {!last_item && (
                <Text
                  style={{
                    paddingLeft: 0,
                    fontSize: 10,
                    color: colorize('gray-500'),
                    textAlign: 'left',
                  }}>
                  {time_periodo ? time_periodo : ''}
                </Text>
              )}
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  paddingLeft: 0,
                  fontSize: 11,
                  color: colorize('primary'),
                  textAlign: 'left',
                }}>
                {row.service_type_name}
              </Text>
            </View>
          </View>
        </Pressable>
      );
    };

    return (
      <View style={{...uiStyle.container, backgroundColor: 'white'}}>
        <FlatList
          data={data}
          renderItem={({item, index}) => RowItem(item, index)}
          style={{...uiStyle.scrollView, width: '100%', paddingHorizontal: 0}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            filtering ? (
              <DSP.Card
                title="Service Type"
                description={
                  <Text style={{fontWeight: 'bold'}}>
                    {autoservice.filterTimelime?.serviceType?.id
                      ? autoservice.filterTimelime?.serviceType?.name
                      : 'All'}
                  </Text>
                }
                onFind={() => onServiceTypeList()}
              />
            ) : (
              <View style={{paddingTop: 30}}></View>
            )
          }
          ListEmptyComponent={
            <View alignItems="center">
              <Icon
                name="eye-off"
                color={colorize('muted')}
                size={32}
                style={{marginTop: 50}}
              />
              <Text style={{color: colorize('muted')}}>No result</Text>
            </View>
          }
        />
        {autoservice.filterTimelime?.serviceType?.id && (
          <FAB
            icon="filter-remove"
            color="white"
            style={{
              ...uiStyle.floatingFab,
              backgroundColor: colorize('danger'),
            }}
            onPress={onServiceTypeClear}
          />
        )}
      </View>
    );
  },
};
