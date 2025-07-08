import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Keyboard, TouchableWithoutFeedback } from 'react-native';
import colors from './colors';

interface PhotoUploadDialogProps {
  visible: boolean;
  imageUri: string | null;
  title: string;
  note: string;
  uploading: boolean;
  onTitleChange: (text: string) => void;
  onNoteChange: (text: string) => void;
  onUpload: () => void;
  onClose: () => void;
}

const PhotoUploadDialog: React.FC<PhotoUploadDialogProps> = ({
  visible,
  imageUri,
  title,
  note,
  uploading,
  onTitleChange,
  onNoteChange,
  onUpload,
  onClose,
}) => {
  if (!visible || !imageUri) return null;
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' }}>
        <TextInput
          placeholder="Add a title (optional)"
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
            backgroundColor: '#fafafa',
          }}
          editable={!uploading}
        />
        <TextInput
          placeholder="Add a note (optional)"
          value={note}
          onChangeText={onNoteChange}
          multiline={true}
          style={{
            width: 300,
            minHeight: 80,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 10,
            paddingHorizontal: 12,
            marginBottom: 10,
            fontSize: 16,
            backgroundColor: '#fafafa',
          }}
          editable={!uploading}
        />
        <TouchableOpacity
          onPress={onUpload}
          style={{
            backgroundColor: colors.secondary,
            borderRadius: 100,
            paddingVertical: 12,
            paddingHorizontal: 32,
            marginBottom: 8,
            marginTop: 0,
            shadowColor: '#000',
            shadowOffset: { width: 3, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={'#fff'} />
          ) : (
            <Text style={{ color: 'white', fontSize: 16 }}>Upload</Text>
          )}
        </TouchableOpacity>
        <Image
          source={{ uri: imageUri }}
          style={{ width: 300, height: 300, borderRadius: 12, marginBottom: 16 }}
          resizeMode="cover"
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default PhotoUploadDialog; 