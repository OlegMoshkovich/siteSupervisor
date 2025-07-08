import React from 'react';
import { View, Text, Image } from 'react-native';
import CheckBox from './CheckBox';

interface PhotoItemProps {
  id: string;
  dataUrl: string;
  title?: string;
  note?: string;
  checked: boolean;
  onCheck: (checked: boolean) => void;
}

const PhotoItem: React.FC<PhotoItemProps> = ({ id, dataUrl, title, note, checked, onCheck }) => {
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
          <CheckBox
            checked={checked}
            onChange={onCheck}
            size={20}
          />
        </View>
      ) : null}
      {note ? (
        <Text
          style={{
            width: 300,
            fontSize: 16,
            color: '#444',
            alignSelf: 'center',
            marginBottom: 4,
          }}
        >
          {note}
        </Text>
      ) : null}
    </View>
  );
};

export default PhotoItem; 