// src/components/common/Button.tsx
import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Platform,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'style'> & {
  label?: string;
  children?: React.ReactNode;            // if you want custom content instead of label
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export default function Button({
  label,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const handlePress = (e: GestureResponderEvent) => {
    if (isDisabled) return;
    onPress?.(e);
  };

  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={
        variant === 'primary'
          ? { color: 'rgba(255,255,255,0.2)' }
          : { color: 'rgba(0,0,0,0.06)' }
      }
      style={({ pressed }) => [
        styles.base,
        fullWidth && { alignSelf: 'stretch' },
        SIZES[size].container,
        getVariantStyle(variant).container,
        (pressed || loading) && getVariantStyle(variant).pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      hitSlop={8}
      {...rest}
    >
      <View style={styles.content}>
        {leftIcon ? <View style={[styles.icon, { marginRight: 8 }]}>{leftIcon}</View> : null}

        {/* Label or custom children */}
        {children ? (
          children
        ) : (
          <Text
            style={[
              styles.text,
              SIZES[size].text,
              getVariantStyle(variant).text,
              isDisabled && styles.textDisabled,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        )}

        {loading ? (
          <ActivityIndicator
            size={size === 'sm' ? 'small' : 'small'}
            style={{ marginLeft: 8 }}
            color={variant === 'primary' ? '#FFFFFF' : '#111827'}
          />
        ) : rightIcon ? (
          <View style={[styles.icon, { marginLeft: 8 }]}>{rightIcon}</View>
        ) : null}
      </View>
    </Pressable>
  );
}

// ---- design tokens
const colors = {
  primaryBg: '#111827',      // slate-900
  primaryText: '#FFFFFF',
  border: '#E5E7EB',         // gray-200
  text: '#111827',           // slate-900
  mutedText: '#6B7280',      // gray-500
  pressed: 'rgba(0,0,0,0.06)',
};

const SIZES: Record<Size, { container: ViewStyle; text: any }> = {
  sm: { container: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 }, text: { fontSize: 14 } },
  md: { container: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12 }, text: { fontSize: 16 } },
  lg: { container: { paddingVertical: 16, paddingHorizontal: 18, borderRadius: 14 }, text: { fontSize: 18 } },
};

function getVariantStyle(variant: Variant) {
  switch (variant) {
    case 'primary':
      return {
        container: { backgroundColor: colors.primaryBg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.primaryBg },
        text: { color: colors.primaryText, fontWeight: '700' },
        pressed: Platform.select({ ios: { opacity: 0.85 }, android: {} }),
      };
    case 'outline':
      return {
        container: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border },
        text: { color: colors.text, fontWeight: '700' },
        pressed: { backgroundColor: colors.pressed },
      };
    case 'ghost':
      return {
        container: { backgroundColor: 'transparent', borderWidth: 0 },
        text: { color: colors.text, fontWeight: '700' },
        pressed: { backgroundColor: colors.pressed, borderRadius: 12 },
      };
  }
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { includeFontPadding: false },
  icon: { alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
  textDisabled: { color: colors.mutedText },
});
