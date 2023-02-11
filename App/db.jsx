//import * as SQLite from 'expo-sqlite';

import moment from 'moment';
import { PermissionsAndroid } from 'react-native';
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
  /*
  
  db.sqlBatch([
    "SELECT * FROM automobiles",
    "SELECT * FROM service_types"
  ], function(a,b,c,d){
    console.log("success",a,b,c,d);
  });

  */
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


export const dbBackup = () => {
  if(!storagePermission())
    return;
  //readFile("/data/data/com.autoservice/databases/"+db_name, "base64").then((value) => {
  //  writeFile(DownloadDirectoryPath + '/autoservices.backup.sqlite', value, 'base64').then((success) => {
  //    console.log('WRITTEN FILE DATABASE');
  //  })
  //  .catch((err) => {
  //    console.log(err.message);
  //  });
  //});
  copyFile("/data/data/com.autoservice/databases/" + db_name, DownloadDirectoryPath + '/autoservices_sqlite.xlsx');
  //copyFile("databases/"+db_name,DownloadDirectoryPath + '/autoservices_sqlite_2.xlsx');
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
    console.log("DATA", data);

    writeFile(DownloadDirectoryPath + '/autoservices_' + moment().format("YYYYMMDD_HHmmss") + ".json", JSON.stringify(data), 'utf8').then((success) => {
      console.log('WRITTEN FILE DATABASE');
    })

  });
};

const data_restore = {"automobiles":[{"favorite":1,"status":1,"name":"Renault Symbol 2002","code":"RAJ-63K","id":1}],"services":[{"details":"1er Cambio de aceite + filtro","time_months":null,"km_previous":"","automobile_id":1,"km":258800,"service_date":"2019-07-27 00:00:00","time_days":null,"km_diff":"","service_type_id":1,"id":1},{"details":"2do Cambio de aceite + filtro","time_months":5,"km_previous":258800,"automobile_id":1,"km":267993,"service_date":"2020-01-26 00:00:00","time_days":30,"km_diff":9193,"service_type_id":1,"id":2},{"details":"3er Cambio de aceite + filtro","time_months":19,"km_previous":267993,"automobile_id":1,"km":278189,"service_date":"2021-09-18 00:00:00","time_days":23,"km_diff":10196,"service_type_id":1,"id":3},{"details":"4to Cambio de aceite + filtro","time_months":11,"km_previous":278189,"automobile_id":1,"km":288613,"service_date":"2022-09-05 00:00:00","time_days":18,"km_diff":10424,"service_type_id":1,"id":4},{"details":"Cambio de aceite de caja pero no anoté km, estoy colocando es más cercano a la fecha","time_months":null,"km_previous":"","automobile_id":1,"km":267993,"service_date":"2020-01-15 12:00:00","time_days":null,"km_diff":"","service_type_id":3,"id":5},{"details":"Primer cambio Correa de tiempo y tensor","time_months":null,"km_previous":"","automobile_id":1,"km":258800,"service_date":"2019-07-13 12:00:00","time_days":null,"km_diff":"","service_type_id":2,"id":6},{"details":"2do cambio de correa de tiempo, se fue la correa el 25/10/2020. Dientes faltantes en un degmento","time_months":16,"km_previous":258800,"automobile_id":1,"km":273395,"service_date":"2020-11-28 00:00:00","time_days":14,"km_diff":14595,"service_type_id":2,"id":7},{"details":"3er Cambio preventivo, se cambió estoperas levas y cigüeñal.","time_months":16,"km_previous":273395,"automobile_id":1,"km":284397,"service_date":"2022-04-19 00:00:00","time_days":22,"km_diff":11002,"service_type_id":2,"id":8},{"details":"Calibración de valvulas y cambio bujias","time_months":null,"km_previous":"","automobile_id":1,"km":284397,"service_date":"2022-04-30 00:00:00","time_days":null,"km_diff":"","service_type_id":7,"id":9},{"details":"Cambio de aceite de caja pq se rompió guarda polvo lado chofer","time_months":36,"km_previous":267993,"automobile_id":1,"km":292323,"service_date":"2023-02-03 19:47:00","time_days":19,"km_diff":24330,"service_type_id":3,"id":10},{"details":"Se reemplazaron ambos rodamientos, el lado copiloto tenía 3 semanas sonando.","time_months":null,"km_previous":"","automobile_id":1,"km":292323,"service_date":"2023-02-03 12:00:00","time_days":null,"km_diff":"","service_type_id":8,"id":11}],"service_types":[{"status":1,"id":1,"alert_km":5000,"alert_time_type":"M","alert_time":10,"name":"Cambio Aceite Motor + Filtro"},{"status":1,"id":2,"alert_km":12000,"alert_time_type":"Y","alert_time":2,"name":"Cambio Correa de Tiempo"},{"status":1,"id":3,"alert_km":"","alert_time_type":"Y","alert_time":5,"name":"Cambio Aceite Caja"},{"status":1,"id":4,"alert_km":"","alert_time_type":"M","alert_time":9,"name":"Limpieza Inyectores + Filtro"},{"status":1,"id":5,"alert_km":"","alert_time_type":"M","alert_time":12,"name":"Limpieza Tanque Gasolina"},{"status":1,"id":6,"alert_km":"","alert_time_type":"Y","alert_time":2,"name":"Limpieza Radiador"},{"status":1,"id":7,"alert_km":"","alert_time_type":"D","alert_time":"","name":"Calibración de Valvulas"},{"status":1,"id":8,"alert_km":"","alert_time_type":"D","alert_time":"","name":"Cambio Rodamiento Delantero"}],"kilometers":[{"value":258800,"register_date":"2019-07-27 00:00:00","automobile_id":1,"id":1},{"value":267993,"register_date":"2020-01-26 00:00:00","automobile_id":1,"id":4},{"value":278189,"register_date":"2021-09-18 00:00:00","automobile_id":1,"id":6},{"value":288613,"register_date":"2022-09-05 00:00:00","automobile_id":1,"id":7},{"value":292264,"register_date":"2023-02-01 19:03:00","automobile_id":1,"id":8},{"value":267993,"register_date":"2020-01-15 12:00:00","automobile_id":1,"id":9},{"value":258800,"register_date":"2019-07-13 12:00:00","automobile_id":1,"id":11},{"value":273395,"register_date":"2020-11-28 00:00:00","automobile_id":1,"id":12},{"value":284397,"register_date":"2022-04-19 00:00:00","automobile_id":1,"id":13},{"value":284397,"register_date":"2022-04-30 00:00:00","automobile_id":1,"id":14},{"value":292323,"register_date":"2023-02-03 19:47:00","automobile_id":1,"id":15},{"value":292323,"register_date":"2023-02-03 12:00:00","automobile_id":1,"id":16}]};

export const dbRestoreJSON = async () => {
  if(!readStoragePermission())
    return;
  console.log("ExternalStorageDirectoryPath", ExternalStorageDirectoryPath);
  //let file = DownloadDirectoryPath + '/autoservices_restore1.json';
  let file = "file://" + DownloadDirectoryPath + '/autoservices_restore1.txt';
//return;
  exists(file).then( exist => {
    console.log("exist", exist);
    if(!exist)
      return;
    stat(file).then((fileStat) => {
      console.log(fileStat);
      readFile(fileStat.path, "base64").then((value) => {
        console.log(value);
      });
    });
    /*readFile(fileStat.path, "utf8").then((value) => {
      console.log(value);
    });
    */
    //console.log(data_restore);


    return;
    let batchs = [];
    Object.entries(data_restore).forEach( entry => {
      const [table, data] = entry;
      batchs.push("DELETE FROM " + table);

      data.forEach((row, index) => {
        let columns = Object.keys(row);
        let values = columns.map( v => row[v]);
        let query = "INSERT INTO " + table + " (" + columns.join(",") + ") VALUES (\"" + values.join('","') + "\")";
        batchs.push(query);
      });
    });

    console.log(batchs);
    dbBatch(batchs, (result) => {
      console.log("END batchs");
    });

  });
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