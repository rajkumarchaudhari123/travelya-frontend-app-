import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

type Props = {
  value: string;
  onChange: (t: string) => void;     // should always receive E.164-like text
  label?: string;
  defaultCountry?: string;           // e.g. "+91"
  showHint?: boolean;
};

const E164 = /^\+\d{7,15}$/;

export default function PhoneInput({
  value,
  onChange,
  label = 'Phone',
  defaultCountry = '+91',
  showHint = true,
}: Props) {
  const normalize = (t: string) => {
    // keep only + and digits
    let s = t.replace(/[^\d+]/g, '');

    // collapse multiple '+' and ensure single leading '+'
    if (s.includes('+')) {
      s = '+' + s.replace(/\+/g, '').replace(/\D/g, '');
    } else {
      // if user didn’t type '+', prepend default country
      const digits = s.replace(/\D/g, '');
      s = defaultCountry + digits;
    }
    // limit to max E.164 length: + plus up to 15 digits
    return s.slice(0, 16);
  };

  const handleChange = (t: string) => onChange(normalize(t));
  const isValid = E164.test(value);

  return (
    <View style={s.c}>
      <Text style={s.l}>{label}</Text>
      <TextInput
        placeholder="+91 9XXXXXXXXX"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        importantForAutofill="yes"
        value={value}
        onChangeText={handleChange}
        style={[s.i, !isValid && value ? s.err : null]}
        maxLength={16}
        autoCorrect={false}
      />
      {showHint && (
        <Text style={[s.hint, isValid || !value ? null : s.hintErr]}>
          {isValid || !value ? 'Enter number in E.164 (e.g., +9198XXXXXXXX)' : 'Invalid phone format'}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  c: { gap: 6 },
  l: { fontWeight: '600' },
  i: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 12 },
  err: { borderColor: '#e53935' },
  hint: { color: '#888', fontSize: 12, marginTop: 4 },
  hintErr: { color: '#e53935' },
});
