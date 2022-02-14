import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform, Animated, Pressable, Alert, Modal} from 'react-native';
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
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { useWorkoutData } from "../providers/WorkoutDataProvider";
import { useChannels } from "../providers/ChannelsProvider";
import { useNavigation } from "@react-navigation/native";
import { StackActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome, Entypo } from "@expo/vector-icons";

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

export function ModelView({ workout_id }) {
  const cameraRef = useRef(null);
  const [tfReady, setTfReady] = useState(false);
  const [model, setModel] = useState<posedetection.PoseDetector>();
  const [poses, setPoses] = useState<posedetection.Pose[]>();
  const repCount = useRef(0);
  const repStatus = useRef(0);
  const [fps, setFps] = useState(0);
  const isKeypointSet = useRef(false);
  const keypointHeight = useRef(0);
  const poseScale = useRef(0);
  const showFeedback = useRef('');
  const algo = useRef(0);
  const isCalibrating = useRef(true);
  const isResting = useRef(false);
  const isRestingDone = useRef(false);
  const isWorkoutLogStepAdded = useRef(false);
  const [isTimerPlaying, setIsTimerPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(3);
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation>();
  const [cameraType, setCameraType] = useState<CameraType>(Camera.Constants.Type.back);
  
  // Use `useRef` so that changing it won't trigger a re-render.
  //
  // - null: unset (initial value).
  // - 0: animation frame/loop has been canceled.
  // - >0: animation frame has been scheduled.
  const rafId = useRef<number | null>(null);
  const poseHistory = useRef(new CBuffer(ZSCORE_LAG * 2));
  const [debugInfo, setDebugInfo] = useState(false);
  const hValue1 = useRef(new Animated.Value(0)).current;
  const hValue1Denorm = useRef(0);
  const backColor = hValue1.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: ['lightgoldenrodyellow','lightgoldenrodyellow', 'lightgoldenrodyellow','palegoldenrod','palegoldenrod','palegoldenrod','palegoldenrod','palegoldenrod','palegoldenrod','green','green'],
  })
  const progressBarToValue = useRef(0);
  const { createWorkoutLog, completeWorkoutLog, addWorkoutLogStep, addWorkoutData } = useWorkoutData();
  const workoutlog_id = useRef(null);
  const { getWorkoutById, getWorkoutLogById } = useChannels();
  const workout = getWorkoutById(workout_id);
  const workoutlog  = useRef(null);
  const currentSet = useRef(1);
  const currentStep = useRef(0);
  const navigation = useNavigation();
  const [isWorkoutSummaryVisible, setIsWorkoutSummaryVisible] = useState(false);

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
    workoutlog_id.current = createWorkoutLog(workout_id);
    workoutlog.current = getWorkoutLogById(workoutlog_id.current);
    // Called when the app is unmounted.
    return () => {
      if (workout.steps[currentStep.current].type === "RepWorkoutStep" && 
        repCount.current !== workout.steps[currentStep.current].count &&
        repCount.current > 0) {
        const time = new Date(Date.now());
        addWorkoutLogStep(
          workoutlog_id.current,
          {
            type: "RepWorkoutStep",
            // index: 0,
            name: workout.steps[currentStep.current].name,
            count: repCount.current,
            duration: workout.steps[currentStep.current].duration,
            timestamp: time,
          }
        );
        console.log("Finishing rep step. Count is: ", repCount.current);
      }
      console.log("Finishing workout log:", workoutlog_id.current);
      completeWorkoutLog(workoutlog_id.current);
      workoutlog_id.current = null;

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

      // next set check
      if (currentStep.current >= workout.steps.length) {
        currentSet.current++;
        currentStep.current = 0;
      }

      //console.log("Current set: ", currentSet.current);
      //console.log("workout set: ", workout.sets);
      // 
      if (currentSet.current > workout.sets) {
        //navigation.navigate('Fake Workout' as never,{workout_id: workout_id } as never);
        //navigation.navigate('Workout Summary' as never,{workout_id: workout_id }as never);
        setIsWorkoutSummaryVisible(true);
        return;
      }

      // Get the tensor and run pose detection.
      const imageTensor = images.next().value as tf.Tensor3D;

      const startTs = Date.now();
      const poses = await model!.estimatePoses(
        imageTensor,
        undefined,
        Date.now()
      );

      if (poses.length > 0) {
        if (isCalibrating.current === false) { // if true we are in calibrating/countdown mode
          if (workout.steps[currentStep.current].type === "RepWorkoutStep") { // RepWorkoutStep
            //console.log(workout);
            
            if (repCount.current === workout.steps[currentStep.current].count) {

              const time = new Date(Date.now());
              addWorkoutLogStep(
                workoutlog_id.current,
                {
                  type: "RepWorkoutStep",
                  // index: 0,
                  name: workout.steps[currentStep.current].name,
                  count: workout.steps[currentStep.current].count,
                  duration: workout.steps[currentStep.current].duration,
                  timestamp: time,
                }
              );
              console.log("finishing rep workout step");

              repCount.current = 0;
              //this.state.hValue1.setValue(0);
              hValue1.setValue(0);
              hValue1Denorm.current = 0;
              //progressBarToValue.current = 0;
              currentStep.current++;
              repStatus.current = 0;
            } else {

              let isRep = false;

              if (poses[0].keypoints[KEYPOINTS.LEFT_HIP].score > MIN_KEYPOINT_SCORE) {
                if (algo.current === 0) { // keypoint algorithm 
                  const cy =
                    (poses[0].keypoints[KEYPOINTS.LEFT_HIP].y / getOutputTensorHeight()) *
                    (isPortrait() ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH);

                  // in case poseScale is not set before, default to 0.7 of the screen
                  if (poseScale.current === 0) {
                    poseScale.current = 0.7;
                  }

                  //console.log("cy: ", cy);

                  // set the starting keypoint for the first time
                  if (isKeypointSet.current == false) {
                    keypointHeight.current = cy;
                    progressBarToValue.current = 3 * 0.16 * poseScale.current * CAM_PREVIEW_HEIGHT;
                    //console.log("Keypoint height set: ", keypointHeight.current);
                    isKeypointSet.current = true;
                  }

                  // update the keypoint if the height is higher and within 2/3 of the screen height and we are still before the first squat
                  if (repCount.current == 0) {
                    if (cy < keypointHeight.current) {
                      keypointHeight.current = cy;
                      progressBarToValue.current = 3 * 0.16 * poseScale.current * CAM_PREVIEW_HEIGHT;
                      //console.log("Keypoint height changed: ", keypointHeight.current);
                    }
                  }

                  const newHValue = Math.min(Math.max(0,cy - keypointHeight.current)/progressBarToValue.current, 1);
                  //this.state.hValue1.setValue(Math.min(3*(cy-keypointHeight.current), progressBarToValue.current));
                  hValue1.setValue(newHValue);
                  hValue1Denorm.current = newHValue * progressBarToValue.current;
                  //console.log("hvalue new:", Math.min(3*(cy-keypointHeight.current), progressBarToValue.current));
                  renderVerticalProgressBar();

                  // downward motion
                  if (repStatus.current == 0 && cy > keypointHeight.current + 0.16 * poseScale.current * CAM_PREVIEW_HEIGHT) {
                    repStatus.current = 1;
                    //console.log("Down");
                  }

                  //upward motion
                  if (repStatus.current == 1 && cy < keypointHeight.current + 0.15 * poseScale.current * CAM_PREVIEW_HEIGHT) {
                    repStatus.current = 2;
                    //console.log("Up");
                  }

                  // count the rep
                  if (repStatus.current == 2 && cy < keypointHeight.current + 0.1 * poseScale.current * CAM_PREVIEW_HEIGHT) {
                    repStatus.current = 0;
                    console.log("Count: ", repCount.current + 1);
                    isRep = true;
                  }
                } else { // zscore algorithm
                  if (poseHistory.current.push(poses[0].keypoints[KEYPOINTS.LEFT_HIP].y) >= ZSCORE_LAG + 2) {
                    //console.log("y= ", poses[0].keypoints[KEYPOINTS.LEFT_HIP].y);
                    let signal = smoothed_z_score(poseHistory.current.toArray());
                    //console.log("signal= ", signal[0]);
                    isRep = is_rep(signal[0]);
                  }
                }
                if (isRep) {
                  repCount.current++;
                }
                const time = new Date(Date.now());

                addWorkoutData(
                  workoutlog_id.current,
                  {
                    timestamp: time,
                    pose_data: [{
                      algorithm: "MoveNet",
                      keypoint: "Left Hip",
                      x: poses[0].keypoints[KEYPOINTS.LEFT_HIP].x,
                      y: poses[0].keypoints[KEYPOINTS.LEFT_HIP].y,
                      confidence: poses[0].keypoints[KEYPOINTS.LEFT_HIP].score
                    },
                    {
                      algorithm: "MoveNet",
                      keypoint: "Right Hip",
                      x: poses[0].keypoints[KEYPOINTS.RIGHT_HIP].x,
                      y: poses[0].keypoints[KEYPOINTS.RIGHT_HIP].y,
                      confidence: poses[0].keypoints[KEYPOINTS.RIGHT_HIP].score
                    },
                    ],
                    rep_data: {
                      is_rep: isRep,
                      algorithm: (algo.current === 0 ? "keypoint" : "zscore"),
                      height: keypointHeight.current,
                      status: repStatus.current,
                    },
                  }
                );
              }
            }
          } else { // TimedWorkoutStep
            //console.log("timed workout step");
            // if last timed step of the last set -> skip it
            if (currentSet.current === workout.sets && currentStep.current === workout.steps.length - 1) {
              currentStep.current++;
              isResting.current = false;
              isRestingDone.current = false;
            } else if (isRestingDone.current === true) {
              currentStep.current++;
              isResting.current = false;
              isRestingDone.current = false;
              //console.log("finishing timed workout step");
            } else if (isResting.current === false) {
              //console.log("setting timed duration to ", workout.steps[currentStep.current].duration);
              setDuration(workout.steps[currentStep.current].duration);
              isResting.current = true;
              //setIsTimerPlaying(true);
            }
          }
        } else { //timer is showing, calibration in progress

          if (isWorkoutLogStepAdded.current === false) {
            const time = new Date(Date.now());
            addWorkoutLogStep(
              workoutlog_id.current,
              {
                type: "CalibrationStep",
                // index: 0,
                name: workout.steps[currentStep.current].name,
                count: 0,
                duration: 0,
                timestamp: time,
              }
            );
            isWorkoutLogStepAdded.current = true;
          }

          if (poses[0].keypoints[KEYPOINTS.NOSE].score > MIN_KEYPOINT_SCORE) {

            const nose_y = (poses[0].keypoints[KEYPOINTS.NOSE].y / getOutputTensorHeight()) *
              (isPortrait() ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH);
            let left_ankle_y = 0;
            let right_ankle_y = 0;

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
              poseScale.current = (ankle_y - nose_y) / (isPortrait() ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH);

              if (poseScale.current > 0.5) {
                showFeedback.current = '';
                setIsTimerPlaying(true);
              } else {
                showFeedback.current = 'Move Forward';
                setIsTimerPlaying(false);
              }
            } else {
              showFeedback.current = 'Lower Camera';
              setIsTimerPlaying(false);
            }
          } else {
            showFeedback.current = 'Raise Camera';
            setIsTimerPlaying(false);
          }

          const time = new Date(Date.now());
          addWorkoutData(
            workoutlog_id.current,
            {
              timestamp: time,
              pose_data: [{
                algorithm: "MoveNet",
                keypoint: "Left Hip",
                x: poses[0].keypoints[KEYPOINTS.LEFT_HIP].x,
                y: poses[0].keypoints[KEYPOINTS.LEFT_HIP].y,
                confidence: poses[0].keypoints[KEYPOINTS.LEFT_HIP].score
              },
              {
                algorithm: "MoveNet",
                keypoint: "Right Hip",
                x: poses[0].keypoints[KEYPOINTS.RIGHT_HIP].x,
                y: poses[0].keypoints[KEYPOINTS.RIGHT_HIP].y,
                confidence: poses[0].keypoints[KEYPOINTS.RIGHT_HIP].score
              },
              ],
              rep_data: {
                is_rep: false,
                algorithm: (algo.current === 0 ? "keypoint" : "zscore"),
                height: 0,
                status: 0,
              },
            }
          );
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
    if (debugInfo === true && poses != null && poses.length > 0) {
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
      return null;
    }
  };

  const renderVerticalProgressBar = () => {

    //console.log("hvalue1: ", this.state.hValue1);
    //console.log("toValue: ", progressBarToValue.current);
    //console.log("hvalue2: ", this.state.hValue1._value );
    console.log("hvalue: ", hValue1 );
    console.log("progressbartovalue: ", progressBarToValue.current );
    //console.log("ratio: ",this.state.hValue1._value/progressBarToValue.current);
    //const temp = Number(hValue1) ;
    //console.log("temp: ", temp);
    //console.log("hvalue ref: ", hValue1Ref.current);
    //if (this.state.hValue1._value/progressBarToValue.current > 0.9) {
    //if (Math.round(temp)  / progressBarToValue.current > 0.9) {
    //  setStyleValue('#0c0');
    //} else {
    //  setStyleValue('#0ac');
    //}

    Animated.timing(hValue1, {
    //  Animated.timing(this.state.hValue1, {
      toValue: 1,
      duration: 300,
      //easing: Easing.linear,
      useNativeDriver: false
    }).start();
  };


  const dynamicStyleUpdatedFromProps = {
    backgroundColor: backColor,
    height: hValue1Denorm.current
    //height: this.state.hValue1
  };

  const renderVerticalProgress = () => {
    //console.log(styleValue);
    return (
      <View style={styles.content2}>
        <Animated.View style={{ ...styles.verticalProgress, ...dynamicStyleUpdatedFromProps }}>
        </Animated.View>
      </View>
    );
  };

  const renderFps = () => {
    if (debugInfo === true) {
      return (
        <View style={styles.fpsContainer}>
          <Text>FPS: {fps}</Text>
        </View>
      );
    } else {
      return null;
    }
  };

  const renderFeedback = () => {
    if (isCalibrating.current === true) {
      return (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedback}>{showFeedback.current}</Text>
        </View>
      );
    } else {
      return null;
    }
  };

  const renderAlgo = () => {
    if (debugInfo === true) {
      return (
        <View
          style={styles.algorithm}
          onTouchEnd={handleSwitchAlgo}>
          <Text>{algo.current ? 'Zscore' : 'Keypoint'}</Text>
        </View>
      );
    } else {
      return null;
    }
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

    if (remainingTime === 0) {
      //console.log("remaining 0");
      if (isCalibrating.current === true) {
        isCalibrating.current = false;
      }

      if (isResting.current === true) {
        isResting.current = false;
        isRestingDone.current = true;
      }
    }

    return (
      <View>
        <Text style={[styles.countdownText, { transform: [{ scale: 1 }] }]}>
          {remainingTime}
        </Text>
      </View>
    );

  };

  const renderCountdown = () => {
    if (isCalibrating.current === true || isResting.current === true) {
      return (
        <View style={styles.countdownContainer}>
          <CountdownCircleTimer
            isPlaying={isTimerPlaying}
            duration={duration}
            size={220}
            strokeWidth={0}
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
    if (isCalibrating.current === false && isResting.current === false) {
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
    let size = 40;
    return (<Pressable style={styles.cameraTypeSwitcher} onPress={handleSwitchCameraType}>
      <Ionicons 
        name={cameraType === Camera.Constants.Type.front ? 'camera-reverse' : 'camera-reverse-outline'} 
        size={size} 
        color='rgba(255, 255, 255, .5)'
        // color='#F2790F' 
      />
    </Pressable>
    );
  };

  const renderCloseButton = () => {
    let size = 40;
    return (<Pressable style={styles.closeButton} onPress={handleCloseButton}>
      <Ionicons 
        name={'close-outline'} 
        size={size} 
        color='rgba(255, 255, 255, .5)'
        // color='#F2790F' 
      />
    </Pressable>
    );
  };
  const handleCloseButton = () => {
    Alert.alert(
      "",
      "Exit workout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK", onPress: () => { 
            // if workout did not start just exit without displaying workout summary
            if (currentSet.current !== 1 || currentStep.current !== 0 || repCount.current !== 0){
              setIsWorkoutSummaryVisible(true);
            } else {
              const popAction = StackActions.pop(2);
              navigation.dispatch(popAction);
            }
          }
        }
      ]
    );
  };

  const handleCloseButtonWorkoutSummary = () => {
    const popAction = StackActions.pop(2);
    navigation.dispatch(popAction);
  };
  
  const renderWorkoutSummary = () => {
    return (
      <Modal
        animationType = "fade"
        transparent={true}
        visible={isWorkoutSummaryVisible}
        presentationStyle="overFullScreen"
        onRequestClose={() => {
          console.log("request close");
          const popAction = StackActions.pop(2);
          navigation.dispatch(popAction);
          //navigation.navigate('Workout Summary' as never,{workout_id: workout_id} as never);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Pressable
              style={styles.closeButtonSummary}
              //onPress={() => setIsWorkoutSummaryVisible(!isWorkoutSummaryVisible)}
              onPress={() => handleCloseButtonWorkoutSummary()}
            >
              <Ionicons 
                name={'close-outline'} 
                size={40} 
                color='rgba(0, 0, 0, .5)'
                // color='#F2790F' 
              />
            </Pressable>
            <View style={{flex: 1}}>
              <Text style={styles.workoutSummaryText}>Workout {workout.name} completed</Text>
              {
                workoutlog.current.steps.map((step, i) => {
                  if (step.type === 'RepWorkoutStep') {
                    return(<Text style={[styles.workoutSummaryText, { fontWeight: "bold"}]} key={i}>
                      <Entypo name="chevron-right" size={12} />
                        {step.count} X {step.name}
                      </Text>
                    )
                  };
                })
              }
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handleSwitchCameraType = () => {
    if (cameraType === Camera.Constants.Type.front) {
      setCameraType(Camera.Constants.Type.back);
    } else {
      setCameraType(Camera.Constants.Type.front);
    }
  };

  const renderDebugInfoSwitcher = () => {
    let size = 40;
    return (<Pressable style={styles.debugInfoSwitcher} onPress={handleDebugInfoType}>
      <Ionicons 
        name={debugInfo === true ? 'information-circle-outline' : 'information-circle'} 
        // name='information-circle-outline' 
        size={size} 
        color='rgba(255, 255, 255, .5)'
        // color={debugInfo === true ? '#F2790F' : '#161616'} 
      />
    </Pressable>
    );
  };

  const handleDebugInfoType = () => {
    if (debugInfo === false) {
      setDebugInfo(true);
    } else {
      setDebugInfo(false);
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
    return <LoadingView>Loading ...</LoadingView>;
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
        {renderDebugInfoSwitcher()}
        {renderAlgo()}
        {renderFeedback()}
        {renderVerticalProgress()}
        {renderCloseButton()}
        {renderWorkoutSummary()}
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
    marginTop: (Dimensions.get('window').height / 2 - CAM_PREVIEW_HEIGHT / 2) / 2,
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
    zIndex: 20,
  },
  fpsContainer: {
    position: 'absolute',
    bottom: 10,
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
    width: 50,
    alignItems: 'center',
    zIndex: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 50,
    alignItems: 'center',
    zIndex: 20,
  },
  debugInfoSwitcher: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 50,
    alignItems: 'center',
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
    bottom: 10,
    right: 10,
    width: 90,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, .7)',
    borderRadius: 2,
    padding: 8,
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
    color: 'orange',
    fontSize: 120,
    zIndex: 110,
    opacity: 1,
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: 50,
    width: 400,
    alignItems: 'center',
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
    borderBottomColor: '#dcdcdc',
    marginTop: 50,
    height: 300,
    zIndex: 30,
  },
  verticalProgress: {
    width: 30,
    minHeight: 0,
    height: 300
    //backgroundColor:'#0da3cd'
  },
  workoutSummaryContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 130,
    marginTop: 22
  },
  workoutSummaryText: {
    fontSize: 18,
    padding: 0,
  },
  closeButtonSummary: {
    alignSelf: "flex-end",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  modalView: {
    margin: 0,
    width: CAM_PREVIEW_WIDTH-10,
    height: CAM_PREVIEW_HEIGHT-20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 5
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5
  },

});

