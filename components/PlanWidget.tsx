import React, { useRef, useState } from 'react';
import { View, Image, Dimensions, TouchableOpacity, Text, TouchableWithoutFeedback, ScrollView } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import ViewShot from 'react-native-view-shot';
import DynamicDialog from './DynamicDialog';
import colors from './colors';

const { width, height } = Dimensions.get('window');

interface PlanWidgetProps {
  onAnchorChange?: (anchor: { x: number; y: number } | null) => void;
}

const PlanWidget: React.FC<PlanWidgetProps> = ({ onAnchorChange }) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const viewShotRef = useRef<any>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const imageWidth = 320;
  const imageHeight = height * 0.6;

  // Handler for capture button
  const handleCapture = async () => {
    if (viewShotRef.current) {
      const uri = await viewShotRef.current.capture();
      setCapturedUri(uri);
      setDialogVisible(true);
    }
  };

  // Handle tap to set anchor
  const handleImageTap = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const anchorPos = { x: locationX / imageWidth, y: locationY / imageHeight };
    setAnchor(anchorPos);
    if (onAnchorChange) onAnchorChange(anchorPos);
    console.log('Anchor dropped at:', anchorPos);
  };

  return (
    <View style={{ backgroundColor: 'white', width: '100%', height: 300 }}>
      <View style={{ width: '96%', height: 300, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1, result: 'tmpfile' }}
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        >
          {/* @ts-ignore */}
          <ImageZoom
            cropWidth={imageWidth}
            cropHeight={300}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            minScale={1}
            maxScale={1}
          >
            <TouchableWithoutFeedback onPress={handleImageTap}>
              <View style={{ width: imageWidth, height: imageHeight }}>
                <Image
                  source={require('../assets/project.png')}
                  style={{ width: imageWidth, height: imageHeight, resizeMode: 'contain' }}
                />
                {/* Render anchor if set */}
                {anchor && (
                  <View
                    style={{
                      position: 'absolute',
                      left: anchor.x * imageWidth - 7.5,
                      top: anchor.y * imageHeight - 8,
                      width: 12,
                      height: 12,
                      borderRadius: 15,
                      borderWidth: 3,
                      borderColor: 'red',
                      backgroundColor: 'rgba(255,0,0,0.2)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </ImageZoom>
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