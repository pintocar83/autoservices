import { HttpServer } from "@react-native-library/webserver";

import React, { Component } from "react";
import { Text } from 'react-native-paper';
import { PermissionsAndroid } from 'react-native';

//var RNFS = require('react-native-fs');
import { DocumentDirectoryPath, DownloadDirectoryPath, writeFile, readFile } from 'react-native-fs';


const requestCameraPermission = async () => {
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


  return isGranted;
};

export const Server = () => {


  React.useEffect(() => {
    console.log("Exucute useEffect");

/*
    HttpServer.start(5561, 'http_service', (request, response) => {

        // you can use request.url, request.type and request.postData here
        if (request.method === "GET" && request.url.startsWith('/users')) {
          response.send(200, "application/json", "{\"message\": \"OK\"}");
        } else if (request.method === "GET" && request.url.startsWith('/image.jpg')) {
          response.sendFile('xxx/xxx.jpg');
        } else {
          response.send(400, "application/json", "{\"message\": \"Bad Request\"}");
        }

    });
*/
    let isGranted = requestCameraPermission();

    console.log("isGranted",isGranted);

    if(isGranted){
      var path = DownloadDirectoryPath + '/test.txt';

      // write the file
      writeFile(path, 'Lorem ipsum dolor sit amet', 'utf8')
        .then((success) => {
          console.log('FILE WRITTEN!');
        })
        .catch((err) => {
          console.log(err.message);
        });

    readFile("/data/data/com.autoservice/databases/autoservices-v5.sqlite", "base64").then((value) => {
      console.log("VALUE: ",value);
      writeFile(DownloadDirectoryPath + '/autoservices.sqlite', value, 'base64').then((success) => {
          console.log('FILE WRITTEN DATABASE!');
        })
        .catch((err) => {
          console.log(err.message);
        });
    });


    }

  },[]);

  //componentDidMount() {
  //  this.state = {
  //  message: "This is an updated message"
  //  };
  //}

  
  return (
    null
  );
  
};

