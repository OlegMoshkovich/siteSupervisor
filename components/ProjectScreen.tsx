import React, { useState, useRef } from 'react';
import { View, Image, Dimensions, TouchableOpacity, Text } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import ViewShot from 'react-native-view-shot';
import DynamicDialog from './DynamicDialog';
import colors from './colors';

const { width, height } = Dimensions.get('window');

const ProjectScreen = () => {
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const viewShotRef = useRef<any>(null);

  // Handler for image click from ImageZoom
  const handleImageClick = (event: { locationX: number; locationY: number }) => {
    setAnchor({ x: event.locationX, y: event.locationY });
  };

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
      <View style={{ width, height: height * 0.6 }}>
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1, result: 'tmpfile' }}
          style={{ width, height: height * 0.6, position: 'absolute', top: 0, left: 0 }}
        >
          // @ts-ignore
          <ImageZoom
            cropWidth={width}
            cropHeight={height * 0.6}
            imageWidth={width}
            imageHeight={height * 0.6}
            minScale={1}
            maxScale={4}
            onClick={handleImageClick}
          >
            <Image
              source={require('../assets/project.png')}
              style={{ width: width, height: height * 0.6, resizeMode: 'contain' }}
            />
          </ImageZoom>
          {anchor && (
            <View
              style={{
                position: 'absolute',
                left: anchor.x - 15,
                top: anchor.y - 15,
                width: 15,
                height: 16,
                borderRadius: 15,
                borderWidth: 3,
                borderColor: 'red',
                backgroundColor: 'rgba(255,0,0,0.2)',
                pointerEvents: 'none',
              }}
            />
          )}
        </ViewShot>
      </View>
      {/* Anchor Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 40,
          left: 60,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => {
          alert('Anchor button pressed!');
        }}
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
          <Text style={{ color: 'white', fontSize: 16 }}>Anchor</Text>
        </View>
      </TouchableOpacity>
      {/* Capture Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 40,
          right: 60,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: anchor ? 1 : 0.5,
        }}
        onPress={handleCapture}
        disabled={!anchor}
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
            style={{ width: width * 0.8, height: height * 0.4, alignSelf: 'center', resizeMode: 'contain' }}
          />
        )}
      </DynamicDialog>
    </View>
  );
};

export default ProjectScreen; 