import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DialogHeaderProps {
  title: string | React.ReactNode;
  backAction?: boolean;
  onBackAction?: () => void;
  titleButtonComponent?: React.ReactNode;
  rightActionElement?: string | React.ReactNode;
  onRightAction?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  headerAsButton?: boolean;
  onHeaderPress?: () => void;
  bottomBorder?: boolean;
  titleFontSize?: number;
  rightActionFontSize?: number;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({
  title,
  backAction = false,
  onBackAction,
  titleButtonComponent,
  rightActionElement,
  onRightAction,
  style,
  titleStyle,
  headerAsButton,
  onHeaderPress,
  bottomBorder = true,
  titleFontSize = 18,
  rightActionFontSize = 18,
}) => {
  return (
    <>
      <View style={[styles.container, style]}>
        <View style={styles.left}>
          {backAction && (
            <TouchableOpacity
              onPress={onBackAction}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          {typeof title === "string" ? (
            <Text
              style={[styles.title, titleStyle, { fontSize: titleFontSize }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : (
            title
          )}
          {titleButtonComponent && (
            <View style={styles.titleButton}>{titleButtonComponent}</View>
          )}
        </View>
        <TouchableOpacity
          style={styles.center}
          activeOpacity={0.7}
          onPress={onHeaderPress}
          disabled={!headerAsButton}
        ></TouchableOpacity>
        <View style={styles.right}>
          {rightActionElement &&
            (typeof rightActionElement === "string" ? (
              <TouchableOpacity
                onPress={onRightAction}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text
                  style={[
                    styles.rightActionText,
                    {
                      fontSize: rightActionFontSize,
                      textDecorationLine: "underline",
                    },
                  ]}
                >
                  {rightActionElement}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={onRightAction}
                disabled={!onRightAction}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {rightActionElement}
              </TouchableOpacity>
            ))}
        </View>
      </View>
      {bottomBorder && <View style={styles.bottomBorder} />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "transparent",
    minHeight: 50,
    width: "100%",
    alignSelf: "center",
  },
  left: {
    minWidth: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  backButton: {
    paddingRight: 8,
  },
  center: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: 40,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "400",
    textAlign: "left",
    flexShrink: 1,
  },
  titleButton: {
    marginLeft: 8,
  },
  right: {
    minWidth: 32,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  rightActionText: {
    color: "colors.primary",
    fontSize: 18,
    fontWeight: "400",
  },
  bottomBorder: {
    width: "90%",
    alignSelf: "center",
    // borderBottomWidth: .5,
    // borderBottomColor: "black",
  },
});

export type { DialogHeaderProps };
export default DialogHeader;
