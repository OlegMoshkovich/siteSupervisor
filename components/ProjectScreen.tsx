import React, { useState } from 'react';
import { View, Image, Dimensions, TouchableOpacity, Text } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';

const { width, height } = Dimensions.get('window');

const ProjectScreen = () => {
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  // Handler for image click
  const handleImageClick = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    setAnchor({ x: locationX, y: locationY });
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ImageZoom
        cropWidth={width}
        cropHeight={height}
        imageWidth={width}
        imageHeight={height * 0.6}
        minScale={1}
        maxScale={4}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{ width, height: height * 0.6 }}
          onPress={handleImageClick}
        >
          <Image
            source={require('../assets/project.png')}
            style={{ width: width, height: height * 0.6, resizeMode: 'contain' }}
          />
          {anchor && (
            <View
              style={{
                position: 'absolute',
                left: anchor.x - 15,
                top: anchor.y - 15,
                width: 30,
                height: 30,
                borderRadius: 15,
                borderWidth: 3,
                borderColor: 'red',
                backgroundColor: 'rgba(255,0,0,0.2)',
                pointerEvents: 'none',
              }}
            />
          )}
        </TouchableOpacity>
      </ImageZoom>
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => {
          alert('Anchor button pressed!');
        }}
      >
        <View
          style={{
            backgroundColor: '#1976d2',
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 30,
            elevation: 4,
          }}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Anchor</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ProjectScreen; 