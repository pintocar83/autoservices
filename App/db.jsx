//import * as SQLite from 'expo-sqlite';

import { useState, useEffect, createContext, useReducer, useContext } from "react";
import moment from 'moment';
import DocumentPicker from 'react-native-document-picker';
import { PermissionsAndroid, ToastAndroid } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
import { DownloadDirectoryPath, writeFile, readFile, copyFile, exists, stat, ExternalStorageDirectoryPath } from 'react-native-fs';
//import * as SQLite from 'react-native-sqlite-storage';


const db_name = 'autoservices-v5.sqlite';

//enablePromise(true);
export const db = openDatabase({name: db_name});
//export const db = openDatabase('auto-services-v3.sqlite');
//export const db = openDatabase({name: 'auto-services-v4.sqlite', createFromLocation : "/data/auto-services-v4.sqlite"});
//export const db = openDatabase({name: 'auto-services-v4', createFromLocation: 1});
//export const db = SQLite.openDatabase('auto-services-v3.sqlite');

export const dbResultData = (result) => {
  if(!result) return [];
  if(!result.rows) return [];
  let data = [];
  for(let i=0; i<result.rows.length; i++) 
    data[i]=result.rows.item(i);
  return Array.from(data);
}

export const dbResultFirst = (result) => {
  let data = dbResultData(result);
  return data.length > 0 ? data[0] : {};
}

export const dbCreate = () => {
  console.log("CREATE TABLES ON DATABASE");
  db.transaction(tx => {
    tx.executeSql("CREATE TABLE IF NOT EXISTS automobiles(id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL, name TEXT, status INTEGER DEFAULT 1, favorite INTEGER DEFAULT 0)");
    tx.executeSql("CREATE TABLE IF NOT EXISTS service_types(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, alert_time INTEGER DEFAULT 0, alert_time_type CHAR(1) DEFAULT 'D', alert_km INTEGER DEFAULT 0, status INTEGER DEFAULT 1)");
    tx.executeSql("CREATE TABLE IF NOT EXISTS kilometers(id INTEGER PRIMARY KEY AUTOINCREMENT, automobile_id INTEGER DEFAULT 0, register_date DATETIME NOT NULL, value INTEGER DEFAULT 0)");
    tx.executeSql("CREATE TABLE IF NOT EXISTS services(id INTEGER PRIMARY KEY AUTOINCREMENT, automobile_id INTEGER DEFAULT 0, service_type_id INTEGER, service_date DATETIME NOT NULL, km INTEGER DEFAULT 0, km_previous INTEGER DEFAULT 0, km_diff INTEGER DEFAULT 0, time_months INTEGER DEFAULT 0, time_days INTEGER DEFAULT 0, details TEXT)");
    console.log("END CREATE TABLES ON DATABASE");
  });
}

export const dbDelete = () => {
  console.log("DELETE DATABASE");
  db.transaction(tx => {
    //tx.executeSql("TRUNCATE service_types");
    tx.executeSql("DROP TABLE automobiles");
    tx.executeSql("DROP TABLE service_types");
    tx.executeSql("DROP TABLE kilometers");
    tx.executeSql("DROP TABLE services");
    //tx.executeSql("VACUUM");
    //tx.executeSql("PRAGMA integrity_check");

    dbCreate();
  });
}

export const dbBackupJSON = () => {
  const table = [
    "automobiles",
    "services",
    "service_types",
    "kilometers",
    "services",
  ];

  let sql = table.map( v => "SELECT * FROM " + v );

  dbBatch(sql, (result) => {
    let data = {};

    table.forEach((element, index) => {
      data[element] = result[index];
    });

    const filename = 'autoservices_backup_' + moment().format("YYYYMMDD_HHmmss") + '.json';

    writeFile(DownloadDirectoryPath + '/' + filename, JSON.stringify(data), 'utf8').then((success) => {
      ToastAndroid.show(
        'Backup created in downloads:\n' + filename,
        ToastAndroid.SHORT
      );
    })

  });
};

export const dbRestoreJSON = async () => {
  if(!readStoragePermission())
    return;
  try {
    const response = await DocumentPicker.pick({
      //type: 'application/json'
      //application/octet-stream
    });

    const filename_extension = response[0].name.split(".").pop();
    if(filename_extension !== "json"){
      ToastAndroid.show(
        'File is not JSON Backup',
        ToastAndroid.SHORT
      );
      return;
    }

    const contents = await readFile(response[0].uri, 'utf8');
    if(!contents){
      ToastAndroid.show(
        'File is empty!',
        ToastAndroid.SHORT
      );
      return;
    }

    //console.log("dbRestoreJSON->response",response[0]);
    const data = JSON.parse(contents);
    if(!data){
      ToastAndroid.show(
        'Invalid File JSON',
        ToastAndroid.SHORT
      );
      return;
    }
    //console.log("dbRestoreJSON->data",data);
    //return;
    let batchs = [];
    Object.entries(data).forEach( entry => {
      const [table, data] = entry;
      batchs.push("DELETE FROM " + table);

      data.forEach((row, index) => {
        let columns = Object.keys(row);
        let values = columns.map( v => row[v]);
        let query = "INSERT INTO " + table + " (" + columns.join(",") + ") VALUES (\"" + values.join('","') + "\")";
        batchs.push(query);
      });
    });

    dbBatch(batchs, (result) => {
      ToastAndroid.show(
        'Backup successfully restored...',
        ToastAndroid.SHORT
      );
    });

  } catch (err) {
    //console.warn(err);
  }
};

const dbBatch = (querys, callback, result) => {
  if(querys.length===0){
    callback(result);
    return;
  }
  if(typeof(result) === "undefined")
    result = [];
  let query = querys.shift();
  db.transaction(tx => {
    tx.executeSql(query, null, (txObj, r) => {
      result.push(dbResultData(r));
      dbBatch(querys, callback, result);
    });
  });
}


const storagePermission = async () => {
  const isGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );
  console.log("isGranted",isGranted);
  if(!isGranted){
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission needed',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the Storage');
      return true;
    } else {
      console.log('Storage permission denied');
      return false;
    }
  }
  return true;
};

const readStoragePermission = async () => {
  const isGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );
  console.log("isGranted",isGranted);
  if(!isGranted){
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Storage Read Permission needed',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the Storage');
      return true;
    } else {
      console.log('Storage permission denied');
      return false;
    }
  }
  return true;
};

//db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () =>
//  console.log('Foreign keys turned on')
//);


//db.exec([{ sql: "CREATE TABLE IF NOT EXISTS automobiles(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);", args: [] }], false, () =>
//  console.log('Create Table: automobiles')
//);



//export default db;






