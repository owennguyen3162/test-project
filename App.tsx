import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  Dimensions,
  SafeAreaView,
  Pressable,
  Button,
} from 'react-native';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import { images } from './src';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import Video from 'react-native-video';

const PermissionsPage = memo(() => {
  const { requestPermission } = useCameraPermission();

  useEffect(() => {
    requestPermissionFunc();
  }, []);

  const requestPermissionFunc = async () => {
    await requestPermission();
  };
  return <Text>{'PermissionsPage'}</Text>;
});

const NoCameraDeviceError = memo(() => {
  return <Text>{'NoCameraDeviceError'}</Text>;
});

const widthScreen = Dimensions.get('window').width;
const heightScreen = Dimensions.get('window').height;

const App = () => {
  const device = useCameraDevice('front');
  const { hasPermission } = useCameraPermission();
  if (!hasPermission) return <PermissionsPage />;
  if (device == null) return <NoCameraDeviceError />;
  const [userClicked, setUserClicked] = React.useState(false);
  const [changeImage, setChangeImage] = React.useState(false);
  const camera = useRef<Camera>(null)

  const offset = useSharedValue<number>(-50);
  const offsetX = useSharedValue<number>(160);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  const animatedStylesX = useAnimatedStyle(() => ({
    right: offsetX.value
  }));

  React.useEffect(() => {
    offset.value = withRepeat(
      withTiming(-offset.value, { duration: 1500 }),
      -1,
      true,
    );
  }, []);

  React.useEffect(() => {
    if (userClicked) {
      offsetX.value = withTiming(offsetX.value - 350, { duration: 2000 });
      setTimeout(() => {
        setChangeImage(true)
        setUserClicked(true)
      }, 1300)
    }
  }, [userClicked]);


  // const { requestPermission } = useMicrophonePermission();

  // useEffect(() => {
  //   requestPermission()
  // }, []);


  const startRecording = () => {
    if (!camera.current) return
    camera.current.startRecording({
      videoCodec: 'h265',
      videoBitRate: 'high',
      onRecordingFinished: async (video) => {
        const path = video.path
        console.log('================path====================');
        console.log(path);
        console.log('=================path===================');
        setVideoUrl(path)
        // await CameraRoll.saveAsset(`file://${path}`, {
        //   type: 'video',
        // })
      },
      onRecordingError: (error) => console.error(error)
    })
  }

  const stopRecording = async () => {
    if (!camera.current) return
    await camera.current.stopRecording()
  }

  const [isRecord, setIsRecord] = React.useState(false)
  const [videoUrl, setVideoUrl] = React.useState("")

  return (
    <Pressable
      style={{
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
      onPress={() => {
        setUserClicked(!userClicked);
        cancelAnimation(offset);
      }}>
      <Camera style={StyleSheet.absoluteFill} device={device} isActive={true}
        ref={camera}
        video={true}
        audio={true} // <-- optional

      />
      {
        videoUrl.length > 0 && <Video source={{ uri: videoUrl }}   // Can be a URL or a local file.
          style={styles.video} />
      }
      <View style={{ marginBottom: 100 }}>
        {
          !isRecord ?
            <Button title='Start Recording' onPress={() => {
              startRecording()
              setIsRecord(true)
            }} />
            :
            <Button title='Stop Recording' onPress={() => {
              stopRecording()
              setIsRecord(false)
            }} />
        }
      </View>
      <View
        style={{
          width: widthScreen,
          height: heightScreen / 2,
          justifyContent: 'flex-end',
          alignItems: 'center',
          bottom: 50,
        }}>
        <Image
          source={images.image2}
          style={styles.user}
          resizeMode="contain"
        />
        {
          !changeImage && <Image
            source={images.image1}
            style={styles.user}
            resizeMode="contain"
          />
        }
        <Animated.View
          style={[{ right: 160, top: -210 }, animatedStylesX, animatedStyles]}>
          <Image
            source={images.image3}
            style={{ width: 62.34, height: 52 }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
      <SafeAreaView />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  user: {
    width: 278.22 - 10,
    height: 427.02 - 10,
    position: 'absolute',
  },
  video: {
    width: 100,
    height: 100
  }
});
export default App;
