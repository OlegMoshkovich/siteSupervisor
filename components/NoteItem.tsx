import React from 'react';
import { View, Text } from 'react-native';
import CheckBox from './CheckBox';

interface NoteItemProps {
  id: string;
  title?: string;
  content?: string;
  checked: boolean;
  onCheck: (checked: boolean) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ id, title, content, checked, onCheck }) => (
  <View style={{ marginBottom: 24, alignItems: 'center' }}>
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
          paddingRight: 20,
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
    <Text
      style={{
        width: 300,
        fontSize: 16,
        color: '#444',
        alignSelf: 'center',
        marginBottom: 4,
      }}
    >
      {content}
    </Text>
  </View>
);

export default NoteItem; 