import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/RootNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 justify-center">
          {/* Header Section */}
          <View className="items-center mb-8">
            <Text className="text-black text-3xl md:text-4xl font-bold text-center mb-3">
              Create Account
            </Text>
          </View>

          {/* Form Section */}
          <View className="w-full max-w-md mx-auto">
            <Text className="text-black font-semibold mb-2 text-base md:text-lg">Email</Text>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              className="w-full border border-gray-300 p-4 rounded-xl mb-4 text-base md:text-lg bg-white text-black"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              autoCapitalize="none"
            />

            <Text className="text-black font-semibold mb-2 text-base md:text-lg">Password</Text>
            <View className="w-full border border-gray-300 rounded-xl bg-white mb-6 flex-row items-center">
              <TextInput
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                className="flex-1 p-4 text-black text-base md:text-lg"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(prev => !prev)}
                className="p-4"
              >
                <Icon
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={24}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              className="w-full bg-green-500 rounded-xl mb-4 py-4 items-center"
              onPress={onSubmit}
              disabled={loading}
            >
              <Text className="text-black text-base md:text-lg font-semibold">
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" className="mt-4" color="#000" />}

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-black">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-blue-600 font-medium">Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Spacer for small screens */}
          <View className="h-10" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}