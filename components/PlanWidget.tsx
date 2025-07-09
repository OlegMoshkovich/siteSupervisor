import React, { useRef, useState } from 'react';
import { View, Image, Dimensions, TouchableOpacity, Text } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import ViewShot from 'react-native-view-shot';
import DynamicDialog from './DynamicDialog';
import colors from './colors';

const { width, height } = Dimensions.get('window');

const PlanWidget = () => {
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
    <View style={{ backgroundColor: 'white' }}>
      <View style={{ width: 345, height: 160,borderWidth: 1, borderColor: colors.primary, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1, result: 'tmpfile' }}
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        >
          {/* @ts-ignore */}
          <ImageZoom
            cropWidth={340}
            cropHeight={160}
            imageWidth={300}
            imageHeight={height * 0.6}
            minScale={.1}
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
              left: 340 / 2 - 7.5,
              top: 160 / 2 - 8,
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

export default PlanWidget; 