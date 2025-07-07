import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import colors from './colors';

const DOT_SIZE = 16;
const DOT_COLOR = colors.secondary;
const CONTAINER_WIDTH = 60;

const Loader: React.FC = () => {
  const anims = [useRef(new Animated.Value(0)).current,
                 useRef(new Animated.Value(0)).current,
                 useRef(new Animated.Value(0)).current];

  useEffect(() => {
    anims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -12,
            duration: 200,
            delay: i * 120,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 12,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.delay(200),
        ])
      ).start();
    });
  }, [anims]);

  return (
    <View style={styles.loader}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              transform: [{ translateY: anim }],
              marginLeft: i === 0 ? 0 : 6,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {
    width: CONTAINER_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    aspectRatio: 2,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: DOT_COLOR,
  },
});

export default Loader;