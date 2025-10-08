import React, { useEffect, useMemo, useRef } from 'react';
import { View, TextInput, StyleSheet, TextInputKeyPressEventData, NativeSyntheticEvent } from 'react-native';

type Props = {
  value: string;                          // full OTP string (controlled)
  onChange: (otp: string) => void;        // update full OTP string
  length?: 4 | 5 | 6;                     // default 6
  autoFocus?: boolean;                    // default true
  disabled?: boolean;                     // default false
};

export default function OtpInput({
  value,
  onChange,
  length = 6,
  autoFocus = true,
  disabled = false,
}: Props) {
  const inputs = useRef<Array<TextInput | null>>([]);

  // ensure value length never exceeds desired length
  const safeValue = value.slice(0, length);

  const boxes = useMemo(() => Array.from({ length }, (_, i) => i), [length]);

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const setCharAt = (i: number, ch: string) => {
    const s = (safeValue.substring(0, i) + ch + safeValue.substring(i + 1)).slice(0, length);
    onChange(s);
  };

  const handleChangeText = (i: number, text: string) => {
    // If the user pasted a whole code into the first box, distribute it
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, length).split('');
      const merged = boxes.map((idx) => digits[idx] ?? safeValue[idx] ?? '').join('');
      onChange(merged);
      const nextIndex = Math.min(digits.length, length - 1);
      inputs.current[nextIndex]?.focus();
      return;
    }

    // Single character typed
    const digit = text.replace(/\D/g, '').slice(-1); // keep only last digit
    setCharAt(i, digit);

    // Move focus to next box if a digit was entered
    if (digit && i < length - 1) inputs.current[i + 1]?.focus();
  };

  const handleKeyPress = (i: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (safeValue[i]) {
        // Clear current char
        setCharAt(i, '');
      } else if (i > 0) {
        // Move to previous and clear it
        inputs.current[i - 1]?.focus();
        setCharAt(i - 1, '');
      }
    }
  };

  return (
    <View style={styles.row}>
      {boxes.map((i) => (
        <TextInput
          key={i}
          ref={(r) => { inputs.current[i] = r; }}
          value={safeValue[i] ?? ''}
          onChangeText={(t) => handleChangeText(i, t)}
          onKeyPress={(e) => handleKeyPress(i, e)}
          keyboardType="number-pad"
          maxLength={1}
          editable={!disabled}
          textContentType="oneTimeCode"    // helps iOS OTP autofill
          style={styles.box}
          returnKeyType="next"
          selectTextOnFocus
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  box: {
    width: 48,
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
  },
});
