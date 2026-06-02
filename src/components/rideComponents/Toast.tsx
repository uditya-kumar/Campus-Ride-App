import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type ToastProps = {
  visible: boolean;
  message: string;
  durationMs?: number; // how long to stay visible before calling onHide
  onHide?: () => void;
};

const Toast: React.FC<ToastProps> = ({ visible, message, durationMs = 1800, onHide }) => {
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(20));
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();

      hideTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 20, duration: 180, useNativeDriver: true }),
        ]).start(() => {
          onHide?.();
        });
      }, durationMs);
    }
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [visible, durationMs, onHide, opacity, translateY]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.wrapper}>
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.borderColor,
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Text style={[styles.text, { color: colors.text }]} numberOfLines={3}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toast: {
    minWidth: 200,
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.2)',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Toast;

