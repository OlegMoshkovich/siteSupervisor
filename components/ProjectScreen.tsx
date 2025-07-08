import React, { useRef, useState } from 'react';
import { View, Image, Dimensions, TouchableOpacity, Text } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import ViewShot from 'react-native-view-shot';
import DynamicDialog from './DynamicDialog';
import colors from './colors';

const { width, height } = Dimensions.get('window');

const ProjectScreen = () => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const viewShotRef = useRef<any>(null);

  // Handler for capture button
  const handleCapture = async () => {
    if (viewShotRef.current) {
      const uri = await viewShotRef.current.capture();
      setCapturedUri(uri);
      setDialogVisible(true);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ width: 300, height: 300, marginTop: 200, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1, result: 'tmpfile' }}
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        >
          {/* @ts-ignore */}
          <ImageZoom
            cropWidth={width * 0.9}
            cropHeight={height * 0.6}
            imageWidth={width * 0.9}
            imageHeight={height * 0.6}
            minScale={1}
            maxScale={4}
          >
            <Image
              source={require('../assets/project.png')}
              style={{ width: width * 0.9, height: height * 0.6, resizeMode: 'contain' }}
            />
          </ImageZoom>
          {/* Fixed anchor in the center */}
          <View
            style={{
              position: 'absolute',
              left: 300 / 2 - 7.5,
              top: 300 / 2 - 8,
              width: 15,
              height: 16,
              borderRadius: 15,
              borderWidth: 3,
              borderColor: 'red',
              backgroundColor: 'rgba(255,0,0,0.2)',
              pointerEvents: 'none',
            }}
          />
        </ViewShot>
      </View>
      {/* Capture Button */}
      <TouchableOpacity
        style={{
          marginTop: 60,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 1,
        }}
        onPress={handleCapture}
        disabled={false}
      >
        <View
          style={{
            backgroundColor: colors.secondary,
            paddingHorizontal: 32,
            paddingVertical: 10,
            borderRadius: 30,
            elevation: 4,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16}}>Capture</Text>
        </View>
      </TouchableOpacity>
      {/* DynamicDialog for captured image */}
      <DynamicDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        headerProps={{
            title: 'Project Location',
          style: { paddingHorizontal: 16 },
          rightActionFontSize: 15,
          titleStyle: { color: colors.primary },
          rightActionElement: 'Close',
          onRightAction: () => setDialogVisible(false),
        }}
      >
        {capturedUri && (
          <Image
            source={{ uri: capturedUri }}
            style={{ marginTop: 60, width: width * 0.8, height: height * 0.4, alignSelf: 'center', resizeMode: 'contain', borderWidth: 1, borderColor: colors.primary, borderRadius: 8 }}
          />
        )}
      </DynamicDialog>
    </View>
  );
};

export default ProjectScreen; 