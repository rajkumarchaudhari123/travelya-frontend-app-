import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';  // Import Firebase auth
import { auth } from '../../lib/firebase'; // Import the Firebase auth instance
import Button from '../../components/common/Button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLoginSubmit = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please enter both email and password');
    }

    try {
      setLoading(true);
      // Firebase email/password login
      await signInWithEmailAndPassword(auth, email, password);
      
      // On successful login, navigate to RoleSelectionScreen
      navigation.replace('RoleSelection'); // Navigate to RoleSelection
    } catch (e: any) {
      console.error('Login with email failed:', e);
      Alert.alert('Login failed', e?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Welcome back</Text>
      <Text style={s.subtitle}>Login with your email and password</Text>

      <Text style={s.label}>Email</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={s.input}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
      />

      <Text style={s.label}>Password</Text>
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={s.input}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
      />

      <Button 
        label={loading ? 'Logging in…' : 'Login'} 
        onPress={onLoginSubmit} 
        disabled={loading} 
      />
      
      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={{ marginTop: 16 }}>
        <Text style={s.link}>New here? Create account</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    justifyContent: 'center', 
    gap: 12 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: { 
    color: '#6b7280', 
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16
  },
  label: { 
    fontWeight: '600', 
    marginBottom: 8,
    fontSize: 16
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  link: { 
    color: '#2563eb',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500'
  },
});
