import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/RootNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons'; // For Show/Hide password icon

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to control password visibility

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Send email verification
      await sendEmailVerification(userCredential.user);

      Alert.alert(
        'Account Created',
        'Your account has been created successfully. Please verify your email to complete the registration.',
        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
      );
    } catch (e: any) {
      console.error('Signup error: ', e);

      if (e.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'The email address is already in use by another account.');
      } else if (e.code === 'auth/weak-password') {
        Alert.alert('Error', 'Password should be at least 6 characters.');
      } else {
        Alert.alert('Signup failed', e.message || 'Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.heading}>Create Account</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={s.input}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
      />

      <View style={s.passwordContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={s.input}
          secureTextEntry={!showPassword}  // Toggle visibility of password
        />
        <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} style={s.eyeIcon}>
          <Icon name={showPassword ? 'visibility-off' : 'visibility'} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={s.button}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={s.buttonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

      <View style={s.loginLinkContainer}>
        <Text style={s.textWhite}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={s.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000', // Black background
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',  // White text for heading
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#fff',  // White border color for inputs
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#222', // Dark background for input
    marginBottom: 20,
    color: '#fff', // White text color in input fields
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#222',
    marginBottom: 20,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
  },
  button: {
    backgroundColor: '#4CAF50', // Green color for button
    borderRadius: 8,
    marginBottom: 20,
    paddingVertical: 14,
    width: '100%',  // Full width button
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff', // White text on the button
    fontSize: 16,
    fontWeight: '600',
  },
  textWhite: {
    color: '#fff', // White text for links
  },
  link: {
    color: '#2563eb', // Blue color for the login link
    fontWeight: '500',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
});
