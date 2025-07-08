import React from 'react';
import { View, Image, Dimensions } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';

const { width, height } = Dimensions.get('window');

const ProjectScreen = () => {
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
        <Image
        source={require('../assets/project.png')}
          style={{ width: width, height: height * 0.6, resizeMode: 'contain' }}
        />
      </ImageZoom>
    </View>
  );
};

export default ProjectScreen; 