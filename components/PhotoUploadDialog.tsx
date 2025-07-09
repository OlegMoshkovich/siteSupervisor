import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Keyboard, TouchableWithoutFeedback } from 'react-native';
import colors from './colors';
import PlanWidget from './PlanWidget';

interface PhotoUploadDialogProps {
  visible: boolean;
  imageUri: string | null;
  note: string;
  uploading: boolean;
  onNoteChange: (text: string) => void;
  onUpload: () => void;
  onClose: () => void;
}

const PhotoUploadDialog: React.FC<PhotoUploadDialogProps> = ({
  visible,
  imageUri,
  note,
  uploading,
  onNoteChange,
  onUpload,
  onClose,
}) => {
  const [step, setStep] = useState(1);

  // Reset step when dialog is closed
  useEffect(() => {
    if (!visible) setStep(1);
  }, [visible]);

  if (!visible || !imageUri) return null;
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ alignItems: 'center', justifyContent: 'flex-start', flex: 1, width: '100%' }}>
        {step === 1 && (
          <>
            <Image
              source={{ uri: imageUri }}
              style={{ width: 345, height: 300, borderRadius: 12, marginBottom: 10 }}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setStep(2)}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 100,
                paddingVertical: 12,
                paddingHorizontal: 32,
                marginBottom: 4,
                marginTop: 10,
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
              <Text style={{ color: 'white', fontSize: 16 }}>Next</Text>
            </TouchableOpacity>
          </>
        )}
        {step === 2 && (
          <>
            <TextInput
              placeholder="Add a note (optional)"
              value={note}
              onChangeText={onNoteChange}
              multiline={true}
              style={{
                width: 340,
                minHeight: 80,
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
            <TouchableOpacity
              onPress={() => setStep(3)}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 100,
                paddingVertical: 12,
                paddingHorizontal: 32,
                marginBottom: 4,
                marginTop: 10,
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
              <Text style={{ color: 'white', fontSize: 16 }}>Next</Text>
            </TouchableOpacity>
          </>
        )}
        {step === 3 && (
          <>
            <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between', width: '90%' }}>
              <PlanWidget />
            </View>
            <TouchableOpacity
              onPress={onUpload}
              style={{
                backgroundColor: colors.secondary,
                borderRadius: 100,
                paddingVertical: 12,
                paddingHorizontal: 32,
                marginBottom: 4,
                marginTop: 10,
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
                <Text style={{ color: 'white', fontSize: 16 }}>Done</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default PhotoUploadDialog; 