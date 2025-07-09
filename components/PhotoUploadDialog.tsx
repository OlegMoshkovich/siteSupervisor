import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import colors from './colors';
import PlanWidget from './PlanWidget';

interface PhotoUploadDialogProps {
  visible: boolean;
  imageUri: string | null;
  note: string;
  uploading: boolean;
  onNoteChange: (text: string) => void;
  onUpload: (data: { anchor: { x: number; y: number } | null; labels: string[] }) => void;
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
  // Steps: 1 = photo, 2 = note, 3 = plan, 4 = labels
  const [step, setStep] = useState(1);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  // Pills data
  const roomLabels = ['Room 1', 'Room 2', 'Room 3', 'Room 4'];
  const statusLabels = ['Delivered', 'Installed', 'Demolished', 'Fastened'];
  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  // Reset step, anchor, and labels when dialog is closed
  useEffect(() => {
    if (!visible) {
      setStep(1);
      setAnchor(null);
      setSelectedLabels([]);
    }
  }, [visible]);

  if (!visible || !imageUri) return null;
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ alignItems: 'center', justifyContent: 'flex-start', flex: 1, width: '100%' }}>
        {step === 1 && (
          <>
            <Image
              source={{ uri: imageUri }}
              style={{ width: '90%', height: 300, borderRadius: 4, marginBottom: 10 }}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setStep(2)}
              style={{
                backgroundColor: colors.secondary,
                borderRadius: 100,
                paddingVertical: 12,
                paddingHorizontal: 32,
                marginBottom: 4,
                marginTop: 10,
                
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
          <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between', width: '90%' }}>
            <PlanWidget onAnchorChange={setAnchor} />
          </View>
          
          <TouchableOpacity
             onPress={() => setStep(3)}
             style={{
               backgroundColor: colors.secondary,
               borderRadius: 100,
               paddingVertical: 12,
               paddingHorizontal: 32,
               marginBottom: 4,
               marginTop: 120,
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
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 12, borderBottomWidth: .5, borderBottomColor: colors.secondary, borderRadius: 4, paddingBottom:50,  width: '90%', alignSelf: 'center'  }}>
              {roomLabels.map((label) => (
                <TouchableOpacity
                  key={label}
                  onPress={() => toggleLabel(label)}
                  style={{
                    backgroundColor: selectedLabels.includes(label) ? '#1976D2' : 'white',
                    borderColor: '#1976D2',
                    borderWidth: 1,
                    borderRadius: 20,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    margin: 4,
                  }}
                >
                  <Text style={{ color: selectedLabels.includes(label) ? 'white' : '#1976D2', fontWeight: 'bold' }}>{label}</Text>
                </TouchableOpacity>
              ))}
              {statusLabels.map((label) => (
                <TouchableOpacity
                  key={label}
                  onPress={() => toggleLabel(label)}
                  style={{
                    backgroundColor: selectedLabels.includes(label) ? '#388E3C' : 'white',
                    borderColor: '#388E3C',
                    borderWidth: 1,
                    borderRadius: 20,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    margin: 4,
                  }}
                >
                  <Text style={{ color: selectedLabels.includes(label) ? 'white' : '#388E3C', fontWeight: 'bold' }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setStep(4)}
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
              <Text style={{ color: 'white', fontSize: 16 }}>Next</Text>
            </TouchableOpacity>
          </>
        )}
        {step === 4 && (
          <>
            <TextInput
              placeholder="Add a note (optional)"
              value={note}
              onChangeText={onNoteChange}
              multiline={true}
              style={{
                width: '90%',
                minHeight: 200,
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 4,
                paddingHorizontal: 12,
                marginBottom: 16,
                fontSize: 16,
                backgroundColor: '#fafafa',
              }}
              editable={!uploading}
            />
            
            <TouchableOpacity
              onPress={() => onUpload({ anchor, labels: selectedLabels })}
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