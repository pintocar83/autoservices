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
import {Automobile} from './Automobile';

export const Kilometer = {
  header: <Text style={uiStyle.indexHeader}>Kilometers</Text>,
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
    //console.log('Kilometer->Index->route', route);
    //console.log('Kilometer->Index->navigation', navigation);
    const me = Kilometer;
    const params = route.params;
    const viewAdmin = route.params?.viewTab ? null : true;
    const [data, setData] = React.useState(null);
    const [selection, setSelection] = React.useState([]);
    const [multiSelection, setMultiSelection] = React.useState(false);
    const [visibleMsgBox, setVisibleMsgBox] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const [autoservice, setAutoservice] = useAutoServiceState();
    /*
    const getFavoriteAutomobile = () => {
      db.transaction(tx => {
        let query = 'SELECT * FROM automobiles WHERE favorite=1 LIMIT 1';
        tx.executeSql(query, null, (txObj, result) => {
          let record = dbResultFirst(result);
          if (!record?.id) return;

          global.setAutomobile(record);

          setAutomobile({
            id: record?.id,
            name: record?.name,
            code: record?.code,
          });
        });
      });
    };
*/
    /*React.useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        console.log("Kilometer.Index->focus");
        if(global.refresh_screen["Kilometer"]){
          console.log("global.refresh_screen[Kilometer] = true");
          global.refresh_screen["Kilometer"] = false;
          onRefresh();
        }
      });
      return unsubscribe;
    }, [navigation]);*/
    /*
    React.useEffect(() => {
      console.log('First Execution');
      //Find default autombile
      if (!automobile.id) {
        getFavoriteAutomobile();
      }
    }, []);
*/
    /*
    React.useEffect(() => {
      if (route.params?.automobile) {
        setAutomobile({
          id: route.params?.automobile.id,
          name: route.params?.automobile.name,
          code: route.params?.automobile.code,
        });
      }
    }, [route.params?.automobile]);
*/
    /*
    React.useEffect(() => {
      if (automobile?.id) {
        onRefresh();
      }
    }, [automobile]);
*/ /*
    React.useEffect(() => {
      navigation.addListener('focus', () => {
        console.log('FOCUS: Kilometer');
        //onRefresh();
      });
    }, [navigation]);
    console.log('selection', selection);
*/

    React.useEffect(() => {
      //console.log(
      //  'Kilometer->Index->useEffect[autoservice.automobile]',
      //  autoservice.automobile,
      //);
      onRefresh();
    }, [autoservice.automobile]);

    const onRefresh = () => {
      if (refreshing) return;
      if (!autoservice.automobile?.id) return;
      //console.log("Kilometer->Index->onRefresh->autoservice.automobile",autoservice.automobile);
      setSelection([]);
      setRefreshing(true);

      db.transaction(tx => {
        let query =
          'SELECT K.*, A.name automobile_name, A.code automobile_code FROM kilometers K INNER JOIN automobiles A ON K.automobile_id=A.id WHERE K.automobile_id = ? ORDER BY register_date DESC';
        //console.log('QUERY: ' + query);
        tx.executeSql(
          query,
          [autoservice.automobile?.id],
          (txObj, result) => {
            //console.log('RESULT: ', result);
            setData(dbResultData(result));
            setRefreshing(false);
          },
          () => {
            setRefreshing(false);
          },
        );
      });
    };

    const onEdit = () => {
      if (!selection || selection.length !== 1) return;
      const record = data.find(element => element.id == selection[0]);
      navigation.navigate('Kilometer.Form', record);
    };

    const onDelete = () => {
      if (!selection) return;
      console.log('onDelete', selection);
      setVisibleMsgBox(true);
    };

    const onListAutomobile = () => {
      navigation.navigate('Automobile.List');
    };

    const onDeleteDone = () => {
      if (!selection) return;
      console.log('onDeleteDone', selection);

      db.transaction(tx => {
        let query = 'DELETE FROM kilometers WHERE id=?';
        console.log('QUERY: ' + query);
        tx.executeSql(query, [selection], (txObj, result) => {});
        //global.refresh_screen['Status'] = true;
        onRefresh();
      });
    };

    const onSelection = id => {
      if (multiSelection) {
        setSelection(currentSelection => {
          const index = currentSelection.indexOf(id);
          if (index >= 0) {
            currentSelection.splice(index, 1);
          } else {
            currentSelection.push(id);
          }
          return [...currentSelection];
        });
      } else {
        if (selection.length === 1 && selection[0] === id) {
          setSelection([]);
        } else {
          setSelection([id]);
        }
      }
    };

    const onMultiSelection = id => {
      if (!multiSelection) {
        setSelection([...selection, id]);
        setMultiSelection(true);
      } else if (multiSelection) {
        setSelection([id]);
        setMultiSelection(false);
      }
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

      let diff_km = null;
      let time_periodo = null;
      if (index < data.length - 1) {
        let next = data[index + 1];
        diff_km = row.value - next.value;

        let date = moment(row.register_date, 'YYYY-MM-DD 00:00:00');
        let date_next = moment(next.register_date, 'YYYY-MM-DD 00:00:00');

        let months = date.diff(date_next, 'months');
        date_next.add(months, 'months');
        let days = date.diff(date_next, 'days');
        time_periodo = me.formatTimePeriod(months, days);

        if (months === 0 && days === 0) {
          let date = moment(row.register_date, 'YYYY-MM-DD HH:mm:ss');
          let date_next = moment(next.register_date, 'YYYY-MM-DD HH:mm:ss');

          let hours = date.diff(date_next, 'hours');
          date_next.add(hours, 'hours');
          let minutes = date.diff(date_next, 'minutes');

          time_periodo = me.formatTimePeriod(months, days, hours, minutes);
        }
      }

      return (
        <Pressable
          disabled={viewAdmin ? false : true}
          android_ripple={{
            color: colorize('pressable-warning'),
            borderless: false,
          }}
          onPress={() => onSelection(row.id)}
          onLongPress={() => onMultiSelection(row.id)}
          style={{
            width: 300,
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: 0,
            paddingTop: 0,
            paddingLeft: 15,
            paddingRight: 15,
            marginBottom: index !== data.length - 1 ? 20 : 40,
            borderRadius: 5,
            //elevation: 10,
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
            <View>
              <Text
                style={{
                  fontWeight: 'bold',
                  paddingRight: 25,
                  fontSize: 14,
                  color: colorize('primary'),
                  textAlign: 'right',
                }}>
                {me.formatKm(row.value) + ' km'}
              </Text>
              <Text
                style={{
                  paddingRight: 0,
                  fontSize: 10,
                  color: colorize('gray-500'),
                  textAlign: 'right',
                }}>
                {diff_km >= 0 && diff_km !== null
                  ? me.formatKm(diff_km * 1) + ' km'
                  : ''}
              </Text>
            </View>
            <View style={{height: 50}}>
              <View
                style={{
                  position: 'absolute',
                  top: index === 0 ? 10 : 0,
                  bottom: index === data.length - 1 ? null : -21,
                  height: index === data.length - 1 ? 10 : null,
                  left: 10,
                  width: 2,
                  backgroundColor: colorize('primary'),
                }}></View>
              <SvgXml
                xml={SvgDuotune.Circle(colorize('primary'))}
                width={icon_size}
                height={icon_size}
              />
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
                {moment(row.register_date).format('DD/MM/YYYY hh:mma')}
              </Text>
              <Text
                style={{
                  paddingLeft: 0,
                  fontSize: 10,
                  color: colorize('gray-500'),
                  textAlign: 'left',
                }}>
                {time_periodo ? time_periodo : ''}
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
            viewAdmin ? (
              <DSP.Card
                title={autoservice.automobile?.name}
                description={
                  autoservice.automobile?.km && (
                    <Text style={{fontWeight: 'bold'}}>
                      {me.formatKm(autoservice.automobile?.km) + ' km'}
                    </Text>
                  )
                }
                onFind={() => onListAutomobile()}
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
        {viewAdmin && selection.length >= 1 && (
          <FAB
            icon="delete"
            color="white"
            size="small"
            style={{
              ...uiStyle.floatingDeleteFab,
            }}
            onPress={onDelete}
          />
        )}

        {viewAdmin && selection.length !== 1 && (
          <FAB
            icon="plus-thick"
            color="white"
            style={{
              ...uiStyle.floatingFab,
            }}
            onPress={() => navigation.navigate('Kilometer.Form')}
          />
        )}

        {viewAdmin && selection.length === 1 && (
          <FAB
            icon="pencil"
            color="white"
            style={{
              ...uiStyle.floatingFab,
            }}
            onPress={onEdit}
          />
        )}
      </View>
    );
  },

  Form: ({route, navigation}) => {
    const me = Kilometer;
    const params = route.params;
    const id = params && params.id ? params.id : '';
    const [autoservice, setAutoservice] = useAutoServiceState();
    const [date, setDate] = React.useState(
      params && params.register_date
        ? moment(params.register_date, 'YYYY-MM-DD HH:mm:ss').format(
            'DD/MM/YYYY',
          )
        : moment().format('DD/MM/YYYY'),
    );
    const [time, setTime] = React.useState(
      params && params.register_date
        ? moment(params.register_date, 'YYYY-MM-DD HH:mm:ss').format('hh:mm a')
        : moment().format('hh:mm a'),
    );
    const [value, setValue] = React.useState(
      params && params.value ? String(params.value) : '',
    );
    /*const [automobile, setAutomobile] = React.useState({
      id: params?.automobile_id,
      name: params?.automobile_name,
    });*/

    const [valueEmpty, setValueEmpty] = React.useState(false);
    const [dateEmpty, setDateEmpty] = React.useState(false);
    const [timeEmpty, setTimeEmpty] = React.useState(false);
    //const [automobileEmpty, setAutomobileEmpty] = React.useState(false);

    const [displayDatePicker, setDisplayDatePicker] = React.useState(false);
    const [displayTimePicker, setDisplayTimePicker] = React.useState(false);

    const onDismissDatePicker = React.useCallback(() => {
      setDisplayDatePicker(false);
    }, [setDisplayDatePicker]);

    const onConfirmDatePicker = React.useCallback(
      params => {
        setDisplayDatePicker(false);
        setDateEmpty(false);
        setDate(moment(params.date).format('DD/MM/YYYY'));
      },
      [setDisplayDatePicker, setDate],
    );

    const onDismissTimePicker = React.useCallback(() => {
      setDisplayTimePicker(false);
    }, [setDisplayTimePicker]);

    const onConfirmTimePicker = React.useCallback(
      ({hours, minutes}) => {
        setDisplayTimePicker(false);
        setTimeEmpty(false);
        setTime(
          moment(
            (hours < 10 ? '0' + hours : hours) +
              ':' +
              (minutes < 10 ? '0' + minutes : minutes),
            'HH:mm',
          ).format('hh:mm a'),
        );
      },
      [setDisplayTimePicker],
    );
    /*
    React.useEffect(() => {
      if (route.params?.automobile) {
        console.log(
          'useEffect route.params?.automobil',
          route.params?.automobile,
        );
        setAutomobile({
          id: route.params?.automobile.id,
          name: route.params?.automobile.name,
        });
        setAutomobileEmpty(false);
      }
    }, [route.params?.automobile]);
*/
    const onSave = () => {
      console.log('onSave');

      if (!autoservice.automobile?.id) {
        return;
      }

      if (!date.trim()) {
        setDateEmpty(true);
        return;
      }

      if (!moment(date, 'DD/MM/YYYY', true).isValid()) {
        setDateEmpty(true);
        return;
      }

      if (!time.trim()) {
        setTimeEmpty(true);
        return;
      }

      if (!value.trim()) {
        setValueEmpty(true);
        return;
      }

      db.transaction(tx => {
        let query;
        let values;
        if (!date) return;

        let register_date = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');
        if (time)
          register_date += ' ' + moment(time, 'hh:mm a').format('HH:mm:ss');
        else register_date += ' 00:00:00';

        if (id) {
          query =
            'UPDATE kilometers SET automobile_id=?, register_date=?, value=? WHERE id=?';
          values = [autoservice.automobile?.id, register_date, value, id];
        } else {
          query =
            'INSERT INTO kilometers(automobile_id,register_date,value) VALUES(?,?,?)';
          values = [autoservice.automobile?.id, register_date, value];
        }
        //console.log('QUERY', query, values);

        tx.executeSql(query, values, (txObj, result) => {
          Automobile.getCurrentKm(autoservice.automobile.id, record => {
            //console.log("Kilometer->onSave->Automobile.getCurrentKm->record",record);
            //if(autoservice.automobile?.km != record.value || autoservice.automobile?.km_date != record.register_date){

            //}
            const new_values = {
              automobile: {
                ...autoservice.automobile,
                km: record.value,
                km_date: record.register_date,
                refresh: Math.random(),
              },
            };
            //console.log("Kilometer->onSave->Automobile.getCurrentKm->new_values",new_values);
            setAutoservice(new_values);
          });
        });
        //global.refresh_screen['Status'] = true;
        //global.refresh_screen['Kilometer'] = true;
        //navigation.navigate('Kilometer.Index');
        navigation.goBack();
      });
    };

    const onListAutomobile = () => {
      navigation.navigate('Automobile.List');
    };

    const onCamera = () => {
      navigation.navigate('CameraScreen.Index', {screen: 'Kilometer.Form'});
    };

    return (
      <View style={{...uiStyle.container, backgroundColor: '#FFFFFF'}}>
        <ScrollView sstyle={{...uiStyle.scrollView, width: '100%'}}>
          <DSP.Card
            title={autoservice.automobile?.name}
            description={
              autoservice.automobile?.km && (
                <Text style={{fontWeight: 'bold'}}>
                  {me.formatKm(autoservice.automobile?.km) + ' km'}
                </Text>
              )
            }
            onFind={() => onListAutomobile()}
          />
          <View style={{alignItems: 'center', paddingHorizontal: 10}}>
            <TextInput
              label="Date"
              value={date}
              error={dateEmpty}
              //editable={false}
              onChangeText={v => {
                setDate(v);
                setDateEmpty(
                  !v || !moment(v, 'DD/MM/YYYY', true).isValid() ? true : false,
                );
              }}
              style={uiStyle.defaultWidth}
              right={
                <TextInput.Icon
                  icon="calendar"
                  onPress={() => setDisplayDatePicker(true)}
                />
              }
            />
            {dateEmpty && (
              <HelperText type="error" style={uiStyle.defaultWidth}>
                {!date.trim()
                  ? 'Field required!'
                  : 'Invalid value (Example: ' +
                    moment().format('DD/MM/YYYY') +
                    ')'}
              </HelperText>
            )}
            <DatePickerModal
              mode="single"
              visible={displayDatePicker}
              onDismiss={onDismissDatePicker}
              date={
                new Date(
                  date
                    ? moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD') +
                      ' 00:00:00'
                    : moment().format('YYYY-MM-DD') + ' 00:00:00',
                )
              }
              onConfirm={onConfirmDatePicker}
            />

            <TextInput
              label="Time"
              value={time}
              error={timeEmpty}
              //editable={false}
              onChangeText={v => {
                setTime(v);
                setTimeEmpty(
                  !v || !moment(v, 'hh:mm a', true).isValid() ? true : false,
                );
              }}
              style={uiStyle.defaultWidth}
              right={
                <TextInput.Icon
                  icon="clock"
                  onPress={() => setDisplayTimePicker(true)}
                />
              }
            />
            {timeEmpty && (
              <HelperText type="error" style={uiStyle.defaultWidth}>
                {!time.trim()
                  ? 'Field required!'
                  : 'Invalid value (Example: ' +
                    moment().format('hh:mm a') +
                    ')'}
              </HelperText>
            )}
            <TimePickerModal
              visible={displayTimePicker}
              onDismiss={onDismissTimePicker}
              onConfirm={onConfirmTimePicker}
              hours={time.trim() ? moment(time, 'hh:mm a').format('HH') : '00'}
              minutes={
                time.trim() ? moment(time, 'hh:mm a').format('mm') : '00'
              }
            />

            <TextInput
              label="Kilometers"
              value={value}
              error={valueEmpty}
              onChangeText={v => {
                setValue(v);
                setValueEmpty(!v ? true : false);
              }}
              style={uiStyle.defaultWidth}
              keyboardType="numeric"
              right={
                <TextInput.Icon icon="camera" onPress={() => onCamera()} />
              }
            />
            {valueEmpty && (
              <HelperText type="error" style={uiStyle.defaultWidth}>
                Field required!
              </HelperText>
            )}
          </View>
        </ScrollView>
        <FAB
          icon="check-bold"
          color="white"
          style={{
            ...uiStyle.floatingFab,
            backgroundColor: colorize('success'),
          }}
          onPress={onSave}
        />
      </View>
    );
  },
};
