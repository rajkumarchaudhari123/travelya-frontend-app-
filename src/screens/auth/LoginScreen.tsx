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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
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
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('RoleSelection');
    } catch (e: any) {
      console.error('Login with email failed:', e);
      Alert.alert('Login failed', e?.message ?? 'Please try again.');
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
              Travelya
            </Text>
            <Text className="text-gray-500 text-base md:text-lg text-center">
              Login with your email and password
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
              className="w-full border border-gray-300 p-4 rounded-xl mb-4 text-base md:text-lg bg-white"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              autoCapitalize="none"
            />

            <Text className="text-black font-semibold mb-2 text-base md:text-lg">Password</Text>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              className="w-full border border-gray-300 p-4 rounded-xl mb-6 text-base md:text-lg bg-white"
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              autoCapitalize="none"
            />

            {/* Login Button */}
            <TouchableOpacity
              onPress={onLoginSubmit}
              disabled={loading}
              className="w-full bg-blue-500 py-4 rounded-xl items-center justify-center mb-4"
            >
              <Text className="text-black text-base md:text-lg font-semibold">
                {loading ? 'Logging in…' : 'Login'}
              </Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" className="mt-4" />}

            {/* Signup Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              className="mt-6"
            >
              <Text className="text-blue-600 text-center text-base md:text-lg font-medium">
                New here? Create account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Spacer for small screens */}
          <View className="h-10" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}