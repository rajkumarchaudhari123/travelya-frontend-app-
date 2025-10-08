// src/screens/auth/OtpVerifyScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Alert, 
  NativeSyntheticEvent, 
  TextInputKeyPressEventData, 
  Platform,
  TouchableOpacity,
  StyleSheet 
} from 'react-native';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../lib/firebase';

type Props = { 
  route: { 
    params: { 
      phone: string; 
      verificationId: string;
      context?: 'signup' | 'login';
    } 
  }; 
  navigation: any;
};

export default function OtpVerifyScreen({ route, navigation }: Props) {
  const { phone, verificationId, context = 'signup' } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const boxes = useMemo(() => [0, 1, 2, 3, 4, 5], []);
  const inputs = useRef<(TextInput | null)[]>([]);

  const setCharAt = (i: number, ch: string) => {
    const next = (code.substring(0, i) + ch + code.substring(i + 1)).slice(0, 6);
    setCode(next);
  };

  const onChangeAt = (i: number, t: string) => {
    // If user pastes a full code into one cell, distribute digits
    if (t.length > 1) {
      const digits = t.replace(/\D/g, '').slice(0, 6).split('');
      const merged = boxes.map(idx => digits[idx] ?? code[idx] ?? '').join('');
      setCode(merged);
      inputs.current[Math.min(digits.length - 1, 5)]?.focus();
      return;
    }
    const digit = t.replace(/\D/g, '').slice(-1);
    setCharAt(i, digit);
    if (digit && i < 5) {
      inputs.current[i + 1]?.focus();
    }
  };

  const onKeyPress = (i: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (code[i]) {
        setCharAt(i, '');
      } else if (i > 0) {
        inputs.current[i - 1]?.focus();
        setCharAt(i - 1, '');
      }
    }
  };

  const translateFirebaseError = (err: any) => {
    const c = String(err?.code || err?.message || '');
    if (c.includes('auth/invalid-verification-code')) return 'Invalid code. Please recheck and try again.';
    if (c.includes('auth/code-expired')) return 'This code has expired. Please resend a new OTP.';
    if (c.includes('auth/too-many-requests')) return 'Too many attempts. Please wait a bit and try again.';
    if (c.includes('auth/invalid-verification-id')) return 'Session expired. Please resend OTP.';
    if (c.includes('auth/network-request-failed')) return 'Network error. Please check your connection.';
    return 'Verification failed. Please try again.';
  };

  const verify = async () => {
    if (loading) return;
    if (!/^\d{6}$/.test(code)) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      setLoading(true);
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const cred = await signInWithCredential(auth, credential);
      
      Alert.alert('Success', `Welcome! ${cred.user.phoneNumber ? `Your number: ${cred.user.phoneNumber}` : ''}`);
      
      // Navigate to main app
      navigation.reset({ 
        index: 0, 
        routes: [{ name: 'AppHome' }] 
      });
    } catch (e: any) {
      console.error('OTP Verification Error:', e);
      Alert.alert('Verification failed', translateFirebaseError(e));
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when full 6 digits entered
  useEffect(() => {
    if (code.length === 6 && !loading) {
      verify();
    }
  }, [code, loading]);

  const handleResend = () => {
    // Navigate back to appropriate screen for resend
    if (context === 'login') {
      navigation.replace('Login');
    } else {
      navigation.replace('Signup');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Sent to {phone}</Text>

      <View style={styles.otpContainer}>
        {boxes.map((i) => (
          <TextInput
            key={i}
            ref={(r) => { inputs.current[i] = r; }}
            value={code[i] ?? ''}
            onChangeText={(t) => onChangeAt(i, t)}
            onKeyPress={(e) => onKeyPress(i, e)}
            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
            maxLength={6} // Allow paste
            style={[
              styles.otpInput,
              code[i] ? styles.otpInputFilled : styles.otpInputEmpty
            ]}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            returnKeyType="done"
            selectTextOnFocus
            editable={!loading}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.verifyButton,
          loading && styles.verifyButtonDisabled
        ]}
        onPress={verify}
        disabled={loading}
      >
        <Text style={styles.verifyButtonText}>
          {loading ? 'Verifying…' : 'Verify'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={handleResend}
        disabled={loading}
      >
        <Text style={styles.resendText}>
          Didn't receive code? <Text style={styles.resendLink}>Resend OTP</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ✅ CORRECT: Using StyleSheet.create() with parentheses
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    justifyContent: 'center', 
    gap: 16 
  },
  title: { 
    fontSize: 22, 
    fontWeight: '700',
    textAlign: 'center'
  },
  subtitle: { 
    color: '#666',
    textAlign: 'center',
    fontSize: 16
  },
  otpContainer: {
    flexDirection: 'row', 
    gap: 8, 
    marginTop: 20, 
    marginBottom: 20,
    justifyContent: 'center'
  },
  otpInput: {
    width: 50, 
    height: 52, 
    borderWidth: 2, 
    borderRadius: 10, 
    textAlign: 'center', 
    fontSize: 20,
    fontWeight: '600'
  },
  otpInputEmpty: {
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9'
  },
  otpInputFilled: {
    borderColor: '#1e88e5',
    backgroundColor: '#fff'
  },
  verifyButton: {
    backgroundColor: '#1e88e5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  verifyButtonDisabled: {
    backgroundColor: '#90caf9'
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  resendText: {
    textAlign: 'center', 
    marginTop: 16, 
    color: '#666',
    fontSize: 16
  },
  resendLink: {
    color: '#1e88e5',
    fontWeight: '600'
  }
});