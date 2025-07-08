import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import colors from './colors';

interface NoteDialogProps {
  visible: boolean;
  title: string;
  content: string;
  saving: boolean;
  onTitleChange: (text: string) => void;
  onContentChange: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const NoteDialog: React.FC<NoteDialogProps> = ({
  visible,
  title,
  content,
  saving,
  onTitleChange,
  onContentChange,
  onSave,
  onClose,
}) => {
  if (!visible) return null;
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' }}>
        <TextInput
          placeholder="Note title"
          value={title}
          onChangeText={onTitleChange}
          style={{
            width: 300,
            minHeight: 40,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 10,
            paddingHorizontal: 12,
            marginBottom: 16,
            fontSize: 16,
          }}
          editable={!saving}
        />
        <TextInput
          placeholder="Note content"
          value={content}
          onChangeText={onContentChange}
          multiline={true}
          style={{
            width: 300,
            minHeight: 160,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 10,
            paddingHorizontal: 12,
            marginBottom: 16,
            fontSize: 16,
          }}
          editable={!saving}
        />
        <TouchableOpacity
          onPress={onSave}
          style={{
            backgroundColor: colors.secondary,
            borderRadius: 100,
            paddingVertical: 12,
            paddingHorizontal: 32,
            marginBottom: 8,
            marginTop: 20,
            shadowColor: '#000',
            shadowOffset: { width: 3, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 8,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: title.trim() && content.trim() ? 1 : 0.5,
          }}
          disabled={saving || !title.trim() || !content.trim()}
        >
          {saving ? (
            <ActivityIndicator size="small" color={'#fff'} />
          ) : (
            <Text style={{ color: 'white', fontSize: 16 }}>Save Note</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default NoteDialog; 