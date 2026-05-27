import { useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";

import Icon from "./Icon";
import Text from "./Text";
import colors from "@/constants/colors";

export type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertConfig {
  icon: string;
  color: string;
  bg: string;
}

const VARIANT_CONFIG: Record<AlertVariant, AlertConfig> = {
  success: {
    icon: "CircleCheck",
    color: "#4ADE80",
    bg: "rgba(74,222,128,0.12)",
  },
  error: { icon: "CircleX", color: "#F87171", bg: "rgba(248,113,113,0.12)" },
  warning: {
    icon: "TriangleAlert",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.12)",
  },
  info: { icon: "Info", color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
};

interface ToastProps {
  visible: boolean;
  variant?: AlertVariant;
  title: string;
  message?: string;
  duration?: number;
  onHide: () => void;
}

export function Toast({
  visible,
  variant = "info",
  title,
  message,
  duration = 2000,
  onHide,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const config = VARIANT_CONFIG[variant];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 60,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => hide(), duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: -120,
        useNativeDriver: true,
        friction: 8,
        tension: 60,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        { top: insets.top + 12, opacity, transform: [{ translateY }] },
      ]}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={hide}>
        <View style={styles.toastContainer}>
          <View
            style={[styles.toastAccent, { backgroundColor: config.color }]}
          />

          <View style={[styles.toastIconWrap, { backgroundColor: config.bg }]}>
            <Icon name={config.icon} size={20} color={config.color} />
          </View>

          <View style={styles.toastTextWrap}>
            <Text style={styles.toastTitle}>{title}</Text>
            {message ? (
              <Text style={styles.toastMessage} numberOfLines={2}>
                {message}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={hide}
            style={styles.toastClose}
            hitSlop={8}
          >
            <Icon name="X" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface AlertDialogProps {
  visible: boolean;
  variant?: AlertVariant;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
}

export function AlertDialog({
  visible,
  variant = "info",
  title,
  message,
  confirmText = "OK",
  cancelText,
  onConfirm,
  onCancel,
  onDismiss,
}: AlertDialogProps) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const config = VARIANT_CONFIG[variant];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 7,
          tension: 50,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 0,
          useNativeDriver: true,
          friction: 7,
          tension: 50,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss ?? onCancel}
    >
      <TouchableWithoutFeedback onPress={onDismiss ?? onCancel}>
        <Animated.View style={[styles.overlay, { opacity }]} />
      </TouchableWithoutFeedback>

      <View style={styles.dialogCenter} pointerEvents="box-none">
        <Animated.View
          style={[styles.dialogContainer, { opacity, transform: [{ scale }] }]}
        >
          <View
            style={[styles.dialogIconCircle, { backgroundColor: config.bg }]}
          >
            <Icon name={config.icon} size={32} color={config.color} />
          </View>

          <Text style={styles.dialogTitle}>{title}</Text>
          {message ? <Text style={styles.dialogMessage}>{message}</Text> : null}

          <View style={styles.dialogButtons}>
            {cancelText && onCancel && (
              <>
                <TouchableOpacity
                  style={styles.dialogBtnCancel}
                  activeOpacity={0.7}
                  onPress={onCancel}
                >
                  <Text style={styles.dialogBtnCancelText}>{cancelText}</Text>
                </TouchableOpacity>
                <View style={styles.dialogBtnDivider} />
              </>
            )}
            <TouchableOpacity
              style={styles.dialogBtnConfirm}
              activeOpacity={0.7}
              onPress={onConfirm}
            >
              <Text
                style={[styles.dialogBtnConfirmText, { color: config.color }]}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 999,
  },
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
    paddingVertical: 12,
    paddingRight: 12,
    gap: 10,
    backgroundColor: colors.secondary,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  toastAccent: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 99,
    marginLeft: 10,
  },
  toastIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toastTextWrap: {
    flex: 1,
    gap: 2,
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  toastMessage: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  toastClose: {
    padding: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dialogCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  dialogContainer: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
    alignItems: "center",
    paddingTop: 20,
    backgroundColor: colors.secondary,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
  },
  dialogIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  dialogMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  dialogButtons: {
    flexDirection: "row",
    width: "100%",
  },
  dialogBtnCancel: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogBtnCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  dialogBtnDivider: {
    width: 0.8,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 8,
  },
  dialogBtnConfirm: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogBtnConfirmText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
