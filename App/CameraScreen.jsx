import React from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, TouchableOpacity } from 'react-native';
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

import { uiStyle }  from './uiComponent';

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

export const CameraScreen = {
  Index: ({ route, navigation }) => {
    const camera = React.useRef(null);
    const isFocused = useIsFocused();
    const [cameraPermission, setCameraPermission] = React.useState(true);
    const devices = useCameraDevices();
    const device = devices.back;

    const [ocr, setOcr] = React.useState("");
    
    //const catBounds = useSharedValue({ top: 0, left: 0, right: 0, bottom: 0 });
    //const imageBounds = useSharedValue({ top: 0, left: 0, right: 0, bottom: 0 })
    console.log(devices);

    const frameProcessor = useFrameProcessor((frame) => {
      'worklet';
      const data = scanOCR(frame);
      runOnJS(setOcr)(data);
      //console.log(frame.toString());
      console.log(data);
      //console.log(frame);
      //if(ocr?.result?.text)
      //  setOcr(ocr?.result?.text);
    }, []);

    React.useEffect(() => {
      setCameraPermission(camPermission());
    }, [""]);

    //React.useEffect(() => {
      //Camera.getCameraPermissionStatus().then(setCameraPermission);
    //}, []);

    //React.useEffect(() => {
    //  console.log("ocr",ocr?.result?.text);
    //}, ocr);
    console.log("ocr",ocr);
    

    if (cameraPermission == null) {
      // still loading
      return null;
    }

    const onCapture = async() => {
      return;
      const photo = await camera.current.takePhoto({
        flash: 'on'
      });

      console.log(photo);

    };

    if (device == null) return <Text>Loading...</Text>






    return (
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={ () => {onCapture()}}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isFocused}
          //photo={true}
          //videoStabilizationMode="auto"
          //preset="high"
          frameProcessorFps={5}
          frameProcessor={frameProcessor}
        />
        <Text style={{...StyleSheet.absoluteFill, color: "white" }}>ocr: {ocr?.result?.text}</Text>
      </TouchableOpacity>
    )
  }
}
