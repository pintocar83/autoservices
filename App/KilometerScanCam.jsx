import React from 'react';
import moment from 'moment';
import { View, Text, StyleSheet, PermissionsAndroid, TouchableOpacity } from 'react-native';
import { DataTable, Divider, TextInput, RadioButton, Switch, HelperText, List, Appbar, FAB, useTheme, IconButton, MD3Colors, Drawer } from 'react-native-paper';

//import { useSharedValue } from 'react-native-reanimated';
import { runOnJS } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import {
  CameraDeviceFormat,
  CameraRuntimeError,
  FrameProcessorPerformanceSuggestion,
  PhotoFile,
  sortFormats,
  useCameraDevices,
  useFrameProcessor,
  VideoFile,
  CameraPermissionStatus
} from 'react-native-vision-camera';
import { OCRFrame, scanOCR } from 'vision-camera-ocr';

import { Camera, frameRateIncluded } from 'react-native-vision-camera';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
//import { uiStyle }  from './uiComponent';
import { db }  from './db';
import { formatKm, ActionBar, AddButton, MsgBox, uiStyle, colorize, SvgDuotune, DSP }  from './uiComponent';

const camPermission = async () => {
  const isGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
  console.log("isGranted",isGranted);
  if(!isGranted){
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission needed',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the Camera');
      return true;
    } else {
      console.log('Camera permission denied');
      return false;
    }
  }
  return true;
};

export const KilometerScanCam = ({ route, navigation }) => {
  //console.log("route->", route);
  //console.log("navigation->", navigation);

  const params = route.params;

  const camera = React.useRef(null);
  const isFocused = useIsFocused();
  const [cameraPermission, setCameraPermission] = React.useState(true);
  const devices = useCameraDevices();
  const device = devices.back;

  const [scanning, setScanning] = React.useState(true);
  const [flashlight, setFlashlight] = React.useState(false);

  const [ocr, setOcr] = React.useState("");
  const [ocrText, setOcrText] = React.useState("");
  //capture by params current km value
  //const [maxValue, setMaxValue] = React.useState(0);
  const [maxValue, setMaxValue] = React.useState(0);
  const [values, setValues] = React.useState({});
  const currentKm = params?.kilometers ? params?.kilometers : 0;


  //const catBounds = useSharedValue({ top: 0, left: 0, right: 0, bottom: 0 });
  //const imageBounds = useSharedValue({ top: 0, left: 0, right: 0, bottom: 0 })
  //console.log(devices);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if(!scanning){
      if(String(ocrText).trim()){
        console.log("not scaning");
        runOnJS(setOcrText)("");
        //runOnJS(setValues)({});
      }
      //runOnJS(setOcrText)("");
      //runOnJS(setValues)({});
      return;
    }
    const data = scanOCR(frame);
    //runOnJS(setOcr)(data);
    //runOnJS(setOcrText)("10\n30\n50000\n30\n\n\n150000");
    //runOnJS(setOcrText)("10\n30\n50000\n30\n\n\n150000\n29238 1"); return;
    if(data?.result?.text){
      runOnJS(setOcrText)(data?.result?.text);
    }
    //console.log(frame.toString());
    //console.log(data);
    //console.log(frame);
    //if(ocr?.result?.text)
    //  setOcr(ocr?.result?.text);
  }, [scanning, ocrText]);

  const findMaxValue = () => {
    console.log("entro en getMaxValue");
    let max_index = -1;
    let max_value = -1;
    for (const index in values) {
      //console.log(`${property}: ${object[property]}`);
      if(index*1 < currentKm)
        continue;
      if(values[index] >= max_value && index*1 > max_index){
        max_value = values[index];
        max_index = index*1;
      }
    }

    console.log("MAX index", max_index);
    console.log("MAX value", max_value);
    if(max_index > currentKm)
      setMaxValue(max_index);
  };


  const onChangeOcrText = (text) => {
    console.log("change ocrText", text);
    console.log("change text", text);
    let new_values = values;
    let lines = text.split("\n");
    console.log("lines: ",lines);
    for(let i=0; i<lines.length; i++){
      //replace "o" and "O" to zero.
      let n = String(lines[i]).
        replaceAll("o","0").
        replaceAll("O","0").
        replaceAll("I","1").
        replaceAll("l","1").
        replaceAll("s","5").
        replaceAll("S","5").
        trim();

      //Check if the scan includes labels 20 40 60 80 100 120 140 160 180 200 220 240
      let tmp=n.split(" ");
      let skip = false;
      if(tmp.length>=2){
        for(let j=0; j<tmp.length-1 && !skip; j++){
          if((tmp[j]*1 + 20) == tmp[j+1]*1){
            skip = true;
          }
        }
        if(skip){
          continue;
        }
      }

      n = n.replaceAll(" ","")*1;
      if(n>2400){//skip display of values in speedometer and time clock
        if(typeof(new_values[n])==="undefined" || !new_values[n]){
          new_values[n] = 0;
        }
        new_values[n]++;
      }
    }

    console.log("new_values", new_values);

    setValues(new_values);
    findMaxValue();
  };

  

  console.log("VALUES",values);

  React.useEffect(() => {
    setCameraPermission(camPermission());
/*
    let str = [
      "10\n30\n50000\n30\n\n\n150000",
      "10\n30\n150000\n30\n\n\n120000",
      "200000",

    ];

    for(let i=0;i<str.length;i++){
      setOcrText(str[i]);
      //onChangeOcrText(str[i]);

    }
*/
  }, [""]);

  React.useEffect(() => {
    if(ocrText){
      onChangeOcrText(ocrText);
    }
  }, [ocrText]);

  //React.useEffect(() => {
  //  getMaxValue();
  //}, [values]);

  //React.useEffect(() => {
    //Camera.getCameraPermissionStatus().then(setCameraPermission);
  //}, []);

  //React.useEffect(() => {
  //  console.log("ocr",ocr?.result?.text);
  //}, ocr);
  //console.log("ocr",ocr);
  

  if (cameraPermission == null) {
    // still loading
    return null;
  }

  const onCapture = async() => {
    const _scanning = !scanning;
    setScanning(_scanning);
    if(_scanning){
      setValues({});
    }
  };

  if (device == null) return <Text>Loading...</Text>

  const onSave = () => {
    if(!params?.automobile_id) {
      return;
    }

    let register_date = moment().format("YYYY-MM-DD HH:mm:ss");

    if( !maxValue>0 ){
      return;
    }

    db.transaction(tx => {
      let query="INSERT INTO kilometers(automobile_id,register_date,value) VALUES(?,?,?)";
      let values=[params?.automobile_id, register_date, maxValue];
      tx.executeSql(query, values, (txObj, result) => {});
      global.refresh_screen["Status"] = true;
      navigation.goBack();
    });


  };

  return (
    <View
      style={StyleSheet.absoluteFill}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused}
        torch = { flashlight ? "on" : "off" }
        //photo={true}
        //videoStabilizationMode="auto"
        //preset="high"
        frameProcessorFps={5}
        frameProcessor={frameProcessor}
      />
      <Text style = {{...StyleSheet.absoluteFill, color: "white" }} >Scanning: {scanning ? "true" : "false"} {"\n"}{ocrText}</Text>
      <View style = {{
        ...StyleSheet.absoluteFill,
        alignItems: "center",
        justifyContent: "center"
        }} >
        <TouchableOpacity
          onPress={ () => { onCapture() } } >
          <Text style = {{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            backgroundColor: "rgba(0,0,0,0.5)",
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 8
          }} > {formatKm(maxValue)} Km </Text>
        </TouchableOpacity>
      </View>

      <FAB
        icon = "flash"
        color = { flashlight ? colorize("warning") : "white" }
        size = "small"
        mode = "flat"
        style={{
          position: "absolute",
          bottom: 15 + 7,
          left: 15,
          backgroundColor: "transparent",
          borderRadius: 20
        }}
        onPress = { () => setFlashlight( !flashlight ) }
      />

      <FAB
        icon="check-bold"
        color="white"
        style={{
          position: "absolute",
          bottom: 15,
          right: 15,
          backgroundColor: colorize("success"),
          borderRadius: 30
        }}
        onPress={onSave}
      />

    </View>
  )
}

