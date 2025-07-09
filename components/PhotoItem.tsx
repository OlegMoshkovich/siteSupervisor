import React from 'react';
import { View, Text, Image } from 'react-native';
import CheckBox from './CheckBox';

interface PhotoItemProps {
  id: string;
  dataUrl: string;
  title?: string;
  note?: string;
  checked: boolean;
  latitude: number;
  longitude: number;
  onCheck: (checked: boolean) => void;
  timestamp?: string;
  anchor?: { x: number; y: number } | null;
  labels?: string[];
  takenAt?: string | null;
}

const PhotoItem: React.FC<PhotoItemProps> = ({ id, dataUrl, title, note, checked, latitude, longitude, onCheck, timestamp, anchor, labels, takenAt }) => {
  if (!dataUrl) return null;
  return (
    <View style={{ marginBottom: 24, alignItems: 'center' }}>
      <Image
        source={{ uri: dataUrl }}
        style={{
          width: 300,
          height: 300,
          marginBottom: 10,
          borderRadius: 8,
          alignSelf: 'center',
        }}
      />
      {/* Taken at info */}
      {takenAt && (
        <Text
          style={{
            width: 300,
            fontSize: 12,
            color: '#388E3C',
            alignSelf: 'center',
            marginBottom: 4,
          }}
        >
          Taken: {takenAt}
        </Text>
      )}
      {/* Anchor info */}
      {anchor && (
        <Text
          style={{
            width: 300,
            fontSize: 12,
            color: '#444',
            alignSelf: 'center',
            marginBottom: 4,
          }}
        >
          Anchor: x={anchor.x.toFixed(3)}, y={anchor.y.toFixed(3)}
        </Text>
      )}
      {/* Labels info */}
      {labels && labels.length > 0 && (
        <Text
          style={{
            width: 300,
            fontSize: 12,
            color: '#1976D2',
            alignSelf: 'center',
            marginBottom: 4,
          }}
        >
          Labels: {labels.join(', ')}
        </Text>
      )}
      {title ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: 300,
            alignSelf: 'center',
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontWeight: 'bold',
              fontSize: 18,
              color: '#222',
            }}
          >
            {title}
          </Text>
        </View>
      ) : null}
      {note ? (
         <View
         style={{
           flexDirection: 'row',
           alignItems: 'center',
           width: 300,
           alignSelf: 'center',
           marginBottom: 4,
         }}
       >
         <Text
          style={{
            width: 280,
            fontSize: 16,
            color: '#444',
            alignSelf: 'center',
            marginBottom: 4,
          }}
        >
          {note}
        </Text>
         <CheckBox
         checked={checked}
         onChange={onCheck}
         size={20}
       />
       </View>
      ) : null}
      {latitude && longitude ? (
        <Text
          style={{
            width: 300,
            fontSize: 12,
            color: '#444',
            alignSelf: 'center',
            marginBottom: 4,
          }}
        >
          {latitude}, {longitude}
        </Text>
      ) : null}
      {timestamp ? (
        <Text
          style={{
            width: 300,
            fontSize: 12,
            color: '#888',
            alignSelf: 'center',
            marginBottom: 4,
          }}
        >
          {timestamp}
        </Text>
      ) : null}
    </View>
  );
};

export default PhotoItem; 