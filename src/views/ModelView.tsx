import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform, Animated, Easing } from 'react-native';
import { Camera } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import * as ScreenOrientation from 'expo-screen-orientation';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import Svg, { Circle } from 'react-native-svg';
import { ExpoWebGLRenderingContext } from 'expo-gl';
import { CameraType } from 'expo-camera/build/Camera.types';
import CBuffer from 'cbuffer';
import smoothed_z_score from '../utils/smoothed_z_score';
import is_rep from '../utils/rep_count';
import { LoadingView } from './LoadingView';
import { useLinkProps } from '@react-navigation/native';
import Constants from 'expo-constants';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';

const TensorCamera = cameraWithTensors(Camera);
const IS_ANDROID = Platform.OS === 'android';
const IS_IOS = Platform.OS === 'ios';

// Camera preview size.
//
// From experiments, to render camera feed without distortion, 16:9 ratio
// should be used fo iOS devices and 4:3 ratio should be used for android
// devices.
//
// This might not cover all cases.
const CAM_PREVIEW_WIDTH = Dimensions.get('window').width;
const CAM_PREVIEW_HEIGHT = CAM_PREVIEW_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4);

// The score threshold for pose detection results.
const MIN_KEYPOINT_SCORE = 0.3;
const ZSCORE_LAG = 50;

// The size of the resized output from TensorCamera.
//
// For movenet, the size here doesn't matter too much because the model will
// preprocess the input (crop, resize, etc). For best result, use the size that
// doesn't distort the image.
const OUTPUT_TENSOR_WIDTH = 180;
const OUTPUT_TENSOR_HEIGHT = OUTPUT_TENSOR_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4);

// Whether to auto-render TensorCamera preview.
const AUTO_RENDER = false;

const KEYPOINTS = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16
};

export function ModelView()  {
  const cameraRef = useRef(null);
  const [tfReady, setTfReady] = useState(false);
  const [countdownComplete, setCountdownComplete] = useState(false);
  const [model, setModel] = useState<posedetection.PoseDetector>();
  const [poses, setPoses] = useState<posedetection.Pose[]>();
  const repCount = useRef(0);
  const repStatus = useRef(0);
  const [fps, setFps] = useState(0);
  const [styleValue, setStyleValue] = useState('#0ac');
  const isKeypointSet = useRef(false);
  const keypointHeight = useRef(0);
  const poseScale = useRef(0);
  const outOfView = useRef(0);
  const algo = useRef(0);
  const showCountdown = useRef(true);
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [orientation, setOrientation] = 
    useState<ScreenOrientation.Orientation>();
  const [cameraType, setCameraType] = useState<CameraType>(
    Camera.Constants.Type.front
  );
  // Use `useRef` so that changing it won't trigger a re-render.
  //
  // - null: unset (initial value).
  // - 0: animation frame/loop has been canceled.
  // - >0: animation frame has been scheduled.
  const rafId = useRef<number | null>(null);
  const poseHistory = useRef(new CBuffer(ZSCORE_LAG*2));
  
  this.state = {hValue1: new Animated.Value(0)}
  const progressBarToValue = useRef(0);

  useEffect(() => {
    async function prepare() {
      rafId.current = null;

      // Set initial orientation.
      const curOrientation = await ScreenOrientation.getOrientationAsync();
      setOrientation(curOrientation);

      // Listens to orientation change.
      ScreenOrientation.addOrientationChangeListener((event) => {
        setOrientation(event.orientationInfo.orientation);
      });

      // Camera permission.
      await Camera.requestCameraPermissionsAsync();

      // Wait for tfjs to initialize the backend.
      await tf.ready();

      // Load movenet model.
      // https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
      const model = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        {
          modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
        }
      );
      setModel(model);

      // Ready!
      setTfReady(true);
    }

    prepare();
  }, []);

  useEffect(() => {
    // Called when the app is unmounted.
    return () => {
      if (rafId.current != null && rafId.current !== 0) {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
    };
  }, []);

  const handleCameraStream = async (
    images: IterableIterator<tf.Tensor3D>,
    updatePreview: () => void,
    gl: ExpoWebGLRenderingContext
  ) => {
    const loop = async () => {
      // Get the tensor and run pose detection.
      const imageTensor = images.next().value as tf.Tensor3D;

      const startTs = Date.now();
      const poses = await model!.estimatePoses(
        imageTensor,
        undefined,
        Date.now()
      );

      if (poses.length > 0) {
        if (showCountdown.current === false) {
          let rep = false;

          if (poses[0].keypoints[KEYPOINTS.LEFT_HIP].score > MIN_KEYPOINT_SCORE) {
            if (algo.current === 0) { // keypoint algorithm 
              const cy =
                (poses[0].keypoints[KEYPOINTS.LEFT_HIP].y / getOutputTensorHeight()) *
                (isPortrait() ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH);
              
              // in case poseScale is not set before, default to 0.7 of the screen
              if (poseScale.current === 0){
                poseScale.current = 0.7;
              }

              console.log("cy: ", cy);

              // set the starting keypoint for the first time
              if (isKeypointSet.current == false) {
                keypointHeight.current =  cy;
                progressBarToValue.current = 3*0.16*poseScale.current*CAM_PREVIEW_HEIGHT;
                console.log("Keypoint height set: ", keypointHeight.current);
                isKeypointSet.current = true;
              }
              
              // update the keypoint if the height is higher and within 2/3 of the screen height and we are still before the first squat
              if (repCount.current == 0) {
                if (cy < keypointHeight.current){
                    keypointHeight.current =  cy;
                    progressBarToValue.current = 3*0.16*poseScale.current*CAM_PREVIEW_HEIGHT;
                    console.log("Keypoint height changed: ", keypointHeight.current);
                }
              }

              this.state.hValue1.setValue(Math.min(3*(cy-keypointHeight.current), progressBarToValue.current));
              console.log("hvalue new:", Math.min(3*(cy-keypointHeight.current), progressBarToValue.current));
              renderVerticalProgressBar();

              // downward motion
              if (repStatus.current == 0 && cy > keypointHeight.current + 0.16*poseScale.current*CAM_PREVIEW_HEIGHT ){
                repStatus.current = 1;
                console.log("Down");
              }

              //upward motion
              if (repStatus.current == 1 && cy < keypointHeight.current + 0.15*poseScale.current*CAM_PREVIEW_HEIGHT){
                repStatus.current = 2;
                console.log("Up");
              }

              // count the rep
              if (repStatus.current == 2 && cy < keypointHeight.current + 0.1*poseScale.current*CAM_PREVIEW_HEIGHT){
                repStatus.current = 0;
                console.log("Count");
                rep = true;
              }
            } else { // zscore algorithm
              if (poseHistory.current.push(poses[0].keypoints[KEYPOINTS.LEFT_HIP].y) >= ZSCORE_LAG + 2) {
                console.log("y= ", poses[0].keypoints[KEYPOINTS.LEFT_HIP].y);
                let signal = smoothed_z_score(poseHistory.current.toArray());
                console.log("signal= ", signal[0]);
                rep = is_rep(signal[0]);
              }
            }
            if (rep) {
              repCount.current++;
            }
          }
        } else {
          if (poses[0].keypoints[KEYPOINTS.NOSE].score > MIN_KEYPOINT_SCORE) {

            const nose_y = (poses[0].keypoints[KEYPOINTS.NOSE].y / getOutputTensorHeight()) *
              (isPortrait() ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH);
            let left_ankle_y = 0;
            let right_ankle_y  = 0;

            if (poses[0].keypoints[KEYPOINTS.LEFT_ANKLE].score > MIN_KEYPOINT_SCORE) {
              left_ankle_y = (poses[0].keypoints[KEYPOINTS.LEFT_ANKLE].y / getOutputTensorHeight()) *
              (isPortrait() ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH);
            }
            if (poses[0].keypoints[KEYPOINTS.RIGHT_ANKLE].score > MIN_KEYPOINT_SCORE) {
              right_ankle_y = (poses[0].keypoints[KEYPOINTS.RIGHT_ANKLE].y / getOutputTensorHeight()) *
              (isPortrait() ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH);
            }
            
            const ankle_y = Math.max(left_ankle_y, right_ankle_y);

            if (ankle_y > 0) {
              poseScale.current = (ankle_y - nose_y)/(isPortrait() ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH);
              
              if (poseScale.current > 0.5) {
                outOfView.current = 0;
                setIsPlaying(true);
              } else {
                outOfView.current = 1;
                setIsPlaying(false);
              }
            } else {
              outOfView.current = 2;
              setIsPlaying(false);
            }
          } else {
            outOfView.current = 3;
            setIsPlaying(false);
          }
        }  
      } else {
        //console.log("No Keypoints");
      }
      const latency = Date.now() - startTs;
      setFps(Math.floor(1000 / latency));
      setPoses(poses);
      tf.dispose([imageTensor]);

      if (rafId.current === 0) {
        return;
      }

      // Render camera preview manually when autorender=false.
      if (!AUTO_RENDER) {
        updatePreview();
        gl.endFrameEXP();
      }

      rafId.current = requestAnimationFrame(loop);
    };

    loop();
  };

  const renderPose = () => {
    if (poses != null && poses.length > 0 && showCountdown.current === false) {
      const keypoints = poses[0].keypoints
        .filter((k) => (k.score ?? 0) > MIN_KEYPOINT_SCORE)
        .map((k) => {
          // Flip horizontally on android or when using back camera on iOS.
          const flipX = IS_ANDROID || cameraType === Camera.Constants.Type.back;
          const x = flipX ? getOutputTensorWidth() - k.x : k.x;
          const y = k.y;
          const cx =
            (x / getOutputTensorWidth()) *
            (isPortrait() ? CAM_PREVIEW_WIDTH : CAM_PREVIEW_HEIGHT);
          const cy =
            (y / getOutputTensorHeight()) *
            (isPortrait() ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH);
          return (
            <Circle
              key={`skeletonkp_${k.name}`}
              cx={cx}
              cy={cy}
              r='4'
              strokeWidth='2'
              fill='#00AA00'
              stroke='white'
            />
          );
        });

      return <Svg style={styles.svg}>{keypoints}</Svg>;
    } else {
      return <View></View>;
    }
  };

 const renderVerticalProgressBar = () => {
    
    //console.log("hvalue1: ", this.state.hValue1);
    console.log("toValue: ", progressBarToValue.current);
    console.log("hvalue1: ", this.state.hValue1._value );
    console.log("ratio: ",this.state.hValue1._value/progressBarToValue.current);

    if (this.state.hValue1._value/progressBarToValue.current > 0.9) {
      setStyleValue('#0c0');
    } else {
      setStyleValue('#0ac');
    }
    Animated.timing(this.state.hValue1, {
      toValue: progressBarToValue.current,
      duration: 5,
      easing: Easing.linear,
      useNativeDriver: false
    }).start();
  };


  const dynamicStyleUpdatedFromProps = {
    backgroundColor: styleValue,
    height: this.state.hValue1
  };

  const renderVerticalProgress = () => {
    //console.log(styleValue);
    return (
      <View style={styles.content2}>
      <Animated.View style={{...styles.verticalProgress, ...dynamicStyleUpdatedFromProps}}>
      </Animated.View>
    </View>
    );
  };

  const renderFps = () => {
    return (
      <View style={styles.fpsContainer}>
        <Text>FPS: {fps}</Text>
      </View>
    );
  };

  const renderFeedback = () => {
    if (
      showCountdown.current === true) {
      //console.log(outOfView.current);
      return (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedback}>
            {outOfView.current === 0 ? '' : (outOfView.current === 1 ? 'Move Forward' : (outOfView.current === 2 ? 'Lower Camera' : (outOfView.current === 3 ? 'Raise Camera' : (''))))}
          </Text>
        </View>
      );
    } else {
      return null;
    }
  };

  const renderAlgo = () => {
    return (
      <View
        style={styles.algorithm}
        onTouchEnd={handleSwitchAlgo}>
        <Text>{algo.current ? 'zscore' : 'keypoint'}</Text>
      </View>
    );
  };
  const renderTime = ({ remainingTime }) => {

    const currentTime = useRef(remainingTime);
    const prevTime = useRef(null);
    const isNewTimeFirstTick = useRef(false);
  
    if (currentTime.current !== remainingTime) {
      isNewTimeFirstTick.current = true;
      prevTime.current = currentTime.current;
      currentTime.current = remainingTime;
    } else {
      isNewTimeFirstTick.current = false;
    }

    const isTimeUp = isNewTimeFirstTick.current;


    if (remainingTime === 0){
      showCountdown.current = false;
    }

    return (
      <View>
        <Text style={[styles.countdownText, {transform: [{ scale: 1}]}]}>
        {remainingTime}
        </Text>
      </View>
    );

  };

  const renderCountdown = () => {
    if (showCountdown.current === true) {
      return (
        <View style={styles.countdownContainer}>
          <CountdownCircleTimer
            isPlaying={isPlaying}
            duration={5}
            size={220}
            strokeWidth={15}
            strokeLinecap={'square'}
            colors={[["#808080"]]}
        >{renderTime}
        </CountdownCircleTimer>
      </View>
      );
    } else {
      return null;
    }
  };

  const renderReps = () => {
    if (showCountdown.current === false) {
      return (
        <View
          style={styles.repsContainer}
        >
          <Text style={styles.reps} >
          {repCount.current}</Text>
        </View>
      );
    } else {
      return null;
    }
  };

  const renderCameraTypeSwitcher = () => {
    return (
      <View
        style={styles.cameraTypeSwitcher}
        onTouchEnd={handleSwitchCameraType}
      >
        <Text>
          Switch to{' '}
          {cameraType === Camera.Constants.Type.front ? 'back' : 'front'} camera
        </Text>
      </View>
    );
  };

  const handleSwitchCameraType = () => {
    if (cameraType === Camera.Constants.Type.front) {
      setCameraType(Camera.Constants.Type.back);
    } else {
      setCameraType(Camera.Constants.Type.front);
    }
  };

  const handleSwitchAlgo = () => {
    if (algo.current === 0) {
      algo.current = 1;
    } else {
      algo.current = 0;
    }
    repCount.current = 0;
    repStatus.current = 0;
    isKeypointSet.current = false;
    keypointHeight.current = 0;
    poseHistory.current.empty();
  };

  const isPortrait = () => {
    return (
      orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
      orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
    );
  };

  const getOutputTensorWidth = () => {
    // On iOS landscape mode, switch width and height of the output tensor to
    // get better result. Without this, the image stored in the output tensor
    // would be stretched too much.
    //
    // Same for getOutputTensorHeight below.
    return isPortrait() || IS_ANDROID
      ? OUTPUT_TENSOR_WIDTH
      : OUTPUT_TENSOR_HEIGHT;
  };

  const getOutputTensorHeight = () => {
    return isPortrait() || IS_ANDROID
      ? OUTPUT_TENSOR_HEIGHT
      : OUTPUT_TENSOR_WIDTH;
  };

  const getTextureRotationAngleInDegrees = () => {
    // On Android, the camera texture will rotate behind the scene as the phone
    // changes orientation, so we don't need to rotate it in TensorCamera.
    if (IS_ANDROID) {
      return 0;
    }

    // For iOS, the camera texture won't rotate automatically. Calculate the
    // rotation angles here which will be passed to TensorCamera to rotate it
    // internally.
    switch (orientation) {
      // Not supported on iOS as of 11/2021, but add it here just in case.
      case ScreenOrientation.Orientation.PORTRAIT_DOWN:
        return 180;
      case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
        return cameraType === Camera.Constants.Type.front ? 270 : 90;
      case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
        return cameraType === Camera.Constants.Type.front ? 90 : 270;
      default:
        return 0;
    }
  };

  if (!tfReady) {
    return <LoadingView>Loading TensorFlow model</LoadingView>;
  } else {
    return (
      // Note that you don't need to specify `cameraTextureWidth` and
      // `cameraTextureHeight` prop in `TensorCamera` below.
      <View
        style={
          isPortrait() ? styles.containerPortrait : styles.containerLandscape
        }
      >
        <TensorCamera
          ref={cameraRef}
          style={styles.camera}
          autorender={AUTO_RENDER}
          type={cameraType}
          // tensor related props
          resizeWidth={getOutputTensorWidth()}
          resizeHeight={getOutputTensorHeight()}
          resizeDepth={3}
          rotation={getTextureRotationAngleInDegrees()}
          onReady={handleCameraStream}
        />
        {renderCountdown()}
        {renderPose()}
        {renderFps()}
        {renderReps()}
        {renderCameraTypeSwitcher()}
        {renderAlgo()}
        {renderFeedback()}
        {renderVerticalProgress()}
      </View>
    );
  };
}

const styles = StyleSheet.create({
  containerPortrait: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: CAM_PREVIEW_WIDTH,
    height: CAM_PREVIEW_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginTop: (Dimensions.get('window').height / 2 - CAM_PREVIEW_HEIGHT / 2)/2,
  },
  containerLandscape: {
    position: 'relative',
    width: CAM_PREVIEW_HEIGHT,
    height: CAM_PREVIEW_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Dimensions.get('window').height / 2 - CAM_PREVIEW_HEIGHT / 2,
  },
  loadingMsg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  svg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 30,
  },
  fpsContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 80,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, .7)',
    borderRadius: 2,
    padding: 8,
    zIndex: 20,
  },
  cameraTypeSwitcher: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 210,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, .7)',
    borderRadius: 2,
    padding: 8,
    zIndex: 20,
  },
  repsContainer: {
    bottom: 10,
    position: 'absolute',
    alignItems: 'center',
    zIndex: 20,
  },
  reps: {
    position: 'absolute',
    bottom: 10,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontSize: 100,
    zIndex: 20,
  },
  algorithm: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, .7)',
    fontSize: 100,
    zIndex: 20,
  },
  countdownContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  countdownText: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
    color: 'violet',
    fontSize: 150,
    zIndex: 110,
    opacity: 1,
  },
  feedbackContainer: {
    position: 'absolute',
    top: 100,
    left: 10,
    width: 400,
    zIndex: 120,
  },
  feedback: {
    color: 'white',
    fontSize: 50,
    zIndex: 120,
  },
  content2: {
    position: 'absolute',
    top: 200,
    left: 10,
    //borderBottomWidth: 1,
    //borderBottomColor: '#dcdcdc',
    marginTop: 50,
    height: 300,
    zIndex: 150,
  },
  verticalProgress: {
    width: 30,
    minHeight: 0,
    //backgroundColor:'#0da3cd'
  }
});

