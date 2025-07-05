import React from "react";
import {
  StyleSheet,
  Modal,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import DialogHeader, { type DialogHeaderProps } from "./DialogHeader";

interface DynamicDialogProps {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  height?: number | `${number}%`;
  showCloseButton?: boolean;
  headerProps?: DialogHeaderProps;
  enableCloseOnBackgroundPress?: boolean;
}

const DynamicDialog: React.FC<DynamicDialogProps> = ({
  visible = false,
  onClose,
  children,
  height = 82,
  showCloseButton = true,
  headerProps,
  enableCloseOnBackgroundPress = true,
}) => {
  const pan = React.useRef(new Animated.ValueXY()).current;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        {enableCloseOnBackgroundPress && (
          <TouchableOpacity
            style={{
              flex: 1,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
            }}
            activeOpacity={1}
            onPress={onClose}
          />
        )}
        <Animated.View
          style={[
            styles.container,
            {
              height: typeof height === "number" ? `${height}%` : height,
              transform: [{ translateY: pan.y }],
            },
          ]}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              borderWidth: .5,
              borderColor: 'colors.primary',
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            {headerProps && <DialogHeader {...headerProps} />}
            <View style={[styles.content]}>{children}</View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    marginBottom: 87,
    paddingTop: 0,
    paddingHorizontal: 3,
    // borderWidth: .5,
    // borderColor: 'colors.primary',
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  closeButtonLine: {
    position: "absolute",
    width: 20,
    height: 2,
    backgroundColor: "#666",
    borderRadius: 1,
  },
  closeButtonLineRotated: {
    transform: [{ rotate: "45deg" }],
  },
  content: {
    flex: 1,
    alignSelf: "center",
    paddingVertical: 20,
    width: "100%",
    backgroundColor: 'white',
  },
});

export default DynamicDialog;
