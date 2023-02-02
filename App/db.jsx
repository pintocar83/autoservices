//import * as SQLite from 'expo-sqlite';
import { openDatabase } from 'react-native-sqlite-storage';
//import * as SQLite from 'react-native-sqlite-storage';

//enablePromise(true);
export const db = openDatabase({name: 'autoservices-v5.sqlite'});
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

  //db = SQLite.openDatabase('auto-services-v1.sqlite');
}

//db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () =>
//  console.log('Foreign keys turned on')
//);


//db.exec([{ sql: "CREATE TABLE IF NOT EXISTS automobiles(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);", args: [] }], false, () =>
//  console.log('Create Table: automobiles')
//);



//export default db;