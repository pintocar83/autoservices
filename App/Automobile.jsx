import React from 'react';
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
  HelperText,
  List,
  Appbar,
  FAB,
  useTheme,
  IconButton,
  MD3Colors,
} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {db, dbResultFirst, dbResultData} from './db';
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

const Module = {
  getCurrentKm: (id, callback) => {
    db.transaction(tx => {
      let query = `
        SELECT *
        FROM kilometers
        WHERE automobile_id = ?
        ORDER BY register_date DESC
        LIMIT 1
      `;
      console.log('Automobile->getCurrentKm->query', query, id);
      tx.executeSql(query, [id], (txObj, result) => {
        console.log('Automobile->getCurrentKm->result', result);
        callback(dbResultFirst(result));
      });
    });
  },

  title: 'Automobiles',

  List: ({route, navigation}) => {
    const me = Module;
    const params = route.params;
    const [data, setData] = React.useState(null);
    const [selection, setSelection] = React.useState('');
    const [refreshing, setRefreshing] = React.useState(false);
    const [autoservice, setAutoservice] = useAutoServiceState();

    React.useEffect(() => {
      navigation.addListener('focus', () => {
        console.log(
          'Automobile.List->useEffect[navigation] focus',
          autoservice,
        );
        onRefresh();
      });
    }, [navigation]);

    const onRefresh = () => {
      if (refreshing) return;
      setSelection('');
      setRefreshing(true);

      db.transaction(tx => {
        let query = `
          SELECT
            A.*,
            K.value km,
            K.register_date km_date
          FROM automobiles A
            LEFT JOIN kilometers K ON K.id = (
              SELECT k1.id
              FROM kilometers k1
              WHERE k1.automobile_id = A.id
              ORDER BY k1.register_date DESC
              LIMIT 1
            )
          WHERE A.status=1
          ORDER BY A.favorite DESC, A.name
        `;
        tx.executeSql(
          query,
          null,
          (txObj, result) => {
            setData(dbResultData(result));
            setRefreshing(false);
          },
          () => {
            setRefreshing(false);
          },
        );
      });
    };

    const onAccept = () => {
      if (!selection) return;
      if (refreshing) return;

      const record = data.find(element => element.id == selection);

      if (!params?.screen) {
        //console.log('Automobile->List->onAccept[params?.globalSelecction]', record);
        setAutoservice({
          automobile: {
            id: record?.id,
            name: record?.name,
            code: record?.code,
            km: record?.km,
            km_date: record?.km_date,
          },
        });
        navigation.goBack();
        return;
      }

      if (params?.screen) {
        navigation.navigate({
          name: params?.screen,
          params: {automobile: record},
          merge: true,
        });
      }
    };

    const RowItem = (row, index) => {
      let color = colorize('muted');
      let backgroundColor = null;
      let icon = 'radiobox-blank';

      if (selection === row.id) {
        color = colorize('dark');
        backgroundColor = colorize('bg-light-default');
        icon = 'radiobox-marked';
      }

      let rightIcon = null;
      if (row.favorite)
        rightIcon = () => <List.Icon icon="star" color={colorize('warning')} />;
      else
        rightIcon = () => (
          <List.Icon icon="star" color={colorize('gray-300')} />
        );

      return (
        <Pressable
          android_ripple={{
            color: colorize('pressable-warning'),
            borderless: false,
          }}
          onPress={() => setSelection(row.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: 0,
            paddingTop: 0,
            paddingLeft: 0,
            paddingRight: 0,
            marginBottom: 0,
            backgroundColor: backgroundColor,
            alignSelf: 'center',
          }}>
          <List.Item
            key={row.id}
            title={row.code}
            description={row.name}
            left={() => (
              <List.Icon icon={icon} color={color} style={{marginLeft: 15}} />
            )}
            right={rightIcon}
            titleStyle={{color: color}}
            descriptionStyle={{color: color}}
            style={{backgroundColor: backgroundColor, width: '100%', flex: 1}}
          />
        </Pressable>
      );
    };

    return (
      <View style={{...uiStyle.container}}>
        <FlatList
          data={data}
          renderItem={({item, index}) => RowItem(item, index)}
          style={{...uiStyle.scrollView, width: '100%', paddingHorizontal: 0}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={<DSP.HeaderTitle>{me.title}</DSP.HeaderTitle>}
          ListEmptyComponent={
            data !== null && (
              <View alignItems="center">
                <Icon
                  name="eye-off"
                  color={colorize('muted')}
                  size={32}
                  style={{marginTop: 50}}
                />
                <Text style={{color: colorize('muted')}}>No result</Text>
              </View>
            )
          }
          ListFooterComponent={<View style={{height: 60}}></View>}
        />

        <FAB
          icon="check-bold"
          color="white"
          style={{
            ...uiStyle.floatingFab,
            backgroundColor: colorize('success'),
          }}
          onPress={onAccept}
        />
      </View>
    );
  },

  Index: ({navigation}) => {
    const me = Module;
    const [data, setData] = React.useState(null);
    const [selection, setSelection] = React.useState([]);
    const [multiSelection, setMultiSelection] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const [visibleMsgBox, setVisibleMsgBox] = React.useState(false);

    React.useEffect(() => {
      navigation.addListener('focus', () => {
        //console.log('FOCUS: Automobile');
        onRefresh();
      });
    }, [navigation]);
    console.log('Automobile->Index->selection', selection);

    const onRefresh = () => {
      if (refreshing) return;
      setSelection([]);
      setRefreshing(true);

      db.transaction(tx => {
        let query =
          'SELECT * FROM automobiles WHERE status=1 ORDER BY favorite DESC, code, name';
        //console.log('QUERY: ' + query);
        tx.executeSql(
          query,
          null,
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
      if (selection.length !== 1) return false;
      const record = data.find(element => element.id == selection[0]);
      navigation.navigate('Automobile.Form', record);
    };

    const onDelete = () => {
      if (selection.length === 0) return false;
      setVisibleMsgBox(true);
    };

    const onDeleteDone = () => {
      if (selection.length === 0) return false;

      db.transaction(tx => {
        let query = 'UPDATE automobiles SET status=0 WHERE id IN (?)';
        tx.executeSql(query, [selection.join(',')], (txObj, result) => {
          let query =
            'UPDATE automobiles SET favorite=1 WHERE id = (select id from automobiles where status=1 order by favorite desc, code, name limit 1)';
          tx.executeSql(
            query,
            null,
            (txObj, result) => {
              onRefresh();
            },
            () => {
              onRefresh();
            },
          );
        });
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
          return [...new Set(currentSelection)];
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
        setSelection([...new Set([...selection, id])]);
        setMultiSelection(true);
      } else if (multiSelection) {
        setSelection([id]);
        setMultiSelection(false);
      }
    };

    const onFavorite = () => {
      if (selection.length !== 1) return false;
      db.transaction(tx => {
        let query =
          'UPDATE automobiles SET favorite=(CASE WHEN id=? THEN 1 ELSE 0 END)';
        //console.log('QUERY: ' + query);
        tx.executeSql(query, [selection[0]], (txObj, result) => {
          onRefresh();
        });
      });
    };

    const isFavorite = () => {
      if (selection.length !== 1) return false;
      const record = data.find(element => element.id == selection[0]);
      return record.favorite ? true : false;
    };

    const onAdd = () => {
      navigation.navigate('Automobile.Form');
    };

    const RowItem = (row, index) => {
      let color = colorize('muted');
      let backgroundColor = null;
      let icon = multiSelection ? 'checkbox-blank-outline' : 'radiobox-blank';

      if (selection.includes(row.id)) {
        selected = true;
        color = colorize('dark');
        backgroundColor = colorize('bg-light-default');
        icon = multiSelection ? 'checkbox-marked' : 'radiobox-marked';
      }

      let rightIcon = null;
      if (row.favorite)
        rightIcon = () => <List.Icon icon="star" color={colorize('warning')} />;
      else
        rightIcon = () => (
          <List.Icon icon="star" color={colorize('gray-300')} />
        );

      return (
        <Pressable
          android_ripple={{
            color: colorize('pressable-warning'),
            borderless: false,
          }}
          onPress={() => onSelection(row.id)}
          onLongPress={() => onMultiSelection(row.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: 0,
            paddingTop: 0,
            paddingLeft: 0,
            paddingRight: 0,
            marginBottom: 0,
            backgroundColor: backgroundColor,
            alignSelf: 'center',
          }}>
          <List.Item
            key={row.id}
            title={row.code}
            description={row.name}
            left={() => (
              <List.Icon icon={icon} color={color} style={{marginLeft: 15}} />
            )}
            right={rightIcon}
            titleStyle={{color: color}}
            descriptionStyle={{color: color}}
            style={{backgroundColor: backgroundColor, width: '100%', flex: 1}}
          />
        </Pressable>
      );
    };

    return (
      <View style={{...uiStyle.container}}>
        <FlatList
          data={data}
          renderItem={({item, index}) => RowItem(item, index)}
          style={{...uiStyle.scrollView, width: '100%', paddingHorizontal: 0}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={<DSP.HeaderTitle>{me.title}</DSP.HeaderTitle>}
          ListEmptyComponent={
            data !== null && (
              <View alignItems="center">
                <Icon
                  name="eye-off"
                  color={colorize('muted')}
                  size={32}
                  style={{marginTop: 50}}
                />
                <Text style={{color: colorize('muted')}}>No result</Text>
              </View>
            )
          }
          ListFooterComponent={<View style={{height: 60}}></View>}
        />

        {selection.length >= 1 && (
          <FAB
            icon="delete"
            color="white"
            size="small"
            style={{
              ...uiStyle.floatingLeftFab,
              backgroundColor: colorize('danger'),
            }}
            onPress={onDelete}
          />
        )}

        {selection.length === 1 && !isFavorite() && (
          <FAB
            icon="star"
            color={colorize("white")}
            size="small"
            style={{
              position: 'absolute',
              bottom: 85,
              right: 23,
              borderRadius: 30,
              backgroundColor: colorize('primary'),
              //left: uiStyle.floatingLeftFab.left + 50,
            }}
            onPress={onFavorite}
          />
        )}

        {selection.length !== 1 && (
          <FAB
            icon="plus-thick"
            color="white"
            style={{
              ...uiStyle.floatingFab,
              backgroundColor: colorize('primary'),
            }}
            onPress={onAdd}
          />
        )}

        {selection.length === 1 && (
          <FAB
            icon="pencil"
            color="white"
            style={{
              ...uiStyle.floatingFab,
            }}
            onPress={onEdit}
          />
        )}
        {visibleMsgBox && (
          <MsgBox
            visible={visibleMsgBox}
            setVisible={setVisibleMsgBox}
            title="Delete"
            message="Do you want to do it?"
            onDone={onDeleteDone}
          />
        )}
      </View>
    );
  },

  Form: ({route, navigation}) => {
    const me = Module;
    const params = route.params;
    const id = params && params.id ? params.id : '';
    const [code, setCode] = React.useState(
      params && params.code ? params.code : '',
    );
    const [name, setName] = React.useState(
      params && params.name ? params.name : '',
    );
    const [codeEmpty, setCodeEmpty] = React.useState(false);

    const onSave = () => {
      console.log('onSave');

      if (!code.trim()) {
        setCodeEmpty(true);
        return;
      }

      db.transaction(tx => {
        let query;
        let values;
        if (id) {
          query = 'UPDATE automobiles SET code=?, name=? WHERE id=?';
          values = [code, name, id];
        } else {
          query = 'INSERT INTO automobiles(code,name) VALUES(?,?)';
          values = [code, name];
        }

        tx.executeSql(query, values, (txObj, resultSet) => {});

        if (!id) {
          query = 'SELECT count(*) n FROM automobiles WHERE status=1';
          tx.executeSql(query, null, (txObj, result) => {
            let data = dbResultData(result);
            if (data && data[0] && data[0].n === 1) {
              let query = 'UPDATE automobiles SET favorite=1 WHERE status=1';
              tx.executeSql(query, null, (txObj, resultSet) => {});
            }
          });
        }

        navigation.goBack();
      });
    };

    return (
      <View style={{...StyleSheet.absoluteFill, backgroundColor: '#FFF'}}>
        <ScrollView contentContainerStyle={uiStyle.formContainer}>
          <DSP.HeaderTitle>{me.title}</DSP.HeaderTitle>
          <TextInput
            label="Number"
            value={code}
            error={codeEmpty}
            onChangeText={value => {
              setCode(value);
              setCodeEmpty(!value ? true : false);
            }}
            style={uiStyle.defaultWidth}
          />
          {codeEmpty && (
            <HelperText type="error" style={uiStyle.defaultWidth}>
              Number field is required!
            </HelperText>
          )}
          <TextInput
            label="Name"
            value={name}
            onChangeText={value => setName(value)}
            style={uiStyle.defaultWidth}
          />
        </ScrollView>
        <FAB
          icon="check-bold"
          color="white"
          style={{
            position: 'absolute',
            bottom: 15,
            right: 15,
            backgroundColor: colorize('success'),
            borderRadius: 30,
          }}
          onPress={onSave}
        />
      </View>
    );
  },
};

export const Automobile = Module;
