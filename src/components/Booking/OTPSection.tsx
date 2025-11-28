// components/Booking/OTPSection.tsx - DEBUG VERSION

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '@/api/axios';

interface OTPSectionProps {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  driverId: string;
  onOTPVerified: () => void;
  isDriver?: boolean;
}

export const OTPSection: React.FC<OTPSectionProps> = ({
  bookingId,
  customerName,
  customerPhone,
  driverId,
  onOTPVerified,
  isDriver = false
}) => {
  // State
  const [otp, setOtp] = useState(['', '', '', '']);
  const [showOTPSection, setShowOTPSection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Refs for OTP inputs
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null)
  ];

  console.log('🔍 [OTP SECTION] Component mounted:', {
    bookingId,
    driverId,
    isDriver,
    showOTPSection,
    otpSent
  });

  // Timer for OTP resend
  useEffect(() => {
    if (timer > 0 && otpSent) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, otpSent]);

  // Check OTP Status on mount
// components/Booking/OTPSection.tsx - STATUS CHECK UPDATE
// components/Booking/OTPSection.tsx - UPDATED STATUS CHECK
useEffect(() => {
  const checkOTPStatus = async () => {
    if (isDriver && bookingId && driverId) {
      try {
        console.log('🔍 [OTP STATUS] Checking OTP status...');
        const response = await api.get(
          `/api/otp/status/${bookingId}?driverId=${driverId}`
        );

        console.log('🔍 [OTP STATUS] Response:', response.data);

        if (response.data.success) {
          const otpData = response.data.data;
          
          // Show OTP section if OTP is generated OR booking is in correct state
          const shouldShowOTPSection = 
            otpData.otpGenerated || 
            otpData.status === 'ACCEPTED' || 
            otpData.status === 'STARTED' ||
            otpData.status === 'OTP_VERIFIED';

          console.log('🔍 [OTP STATUS] Should show OTP section:', shouldShowOTPSection, {
            otpGenerated: otpData.otpGenerated,
            status: otpData.status
          });

          if (shouldShowOTPSection) {
            setShowOTPSection(true);
            if (otpData.otpGenerated) {
              setOtpSent(true);
            }
          }
        }
      } catch (error: any) {
        console.log("❌ [OTP STATUS] Error checking status:", {
          message: error.message,
          response: error.response?.data
        });
      }
    }
  };

  checkOTPStatus();
}, [isDriver, bookingId, driverId]);

  // Handle OTP input change
  const handleOtpChange = (value: string, index: number) => {
    console.log(`⌨️ [OTP INPUT] Index ${index}, Value: ${value}`);
    
    if (!/^\d*$/.test(value)) {
      console.log('❌ [OTP INPUT] Invalid character - numbers only');
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      console.log(`➡️ [OTP INPUT] Auto-focusing next input: ${index + 1}`);
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all digits are entered
    if (index === 3 && value) {
      const fullOtp = newOtp.join('');
      console.log(`🎯 [OTP INPUT] All digits entered: ${fullOtp}`);
      if (fullOtp.length === 4) {
        handleVerifyOTP(fullOtp);
      }
    }
  };

  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    console.log(`⌫ [OTP BACKSPACE] Index ${index}, Key: ${e.nativeEvent.key}`);
    
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      console.log(`⬅️ [OTP BACKSPACE] Auto-focusing previous input: ${index - 1}`);
      inputRefs[index - 1].current?.focus();
    }
  };

  // Generate OTP
  const handleGenerateOTP = async () => {
    console.log('🚀 [GENERATE OTP] Button clicked');
    setLoading(true);
    setError('');

    try {
      console.log('📤 [GENERATE OTP] Making API request:', {
        bookingId,
        driverId
      });

      const response = await api.post('/api/otp/generate', {
        bookingId,
        driverId
      });

      console.log('✅ [GENERATE OTP] API Response:', response.data);

      if (response.data.success) {
        console.log('🎉 [GENERATE OTP] OTP generated successfully');
        setOtpSent(true);
        setShowOTPSection(true);
        setTimer(60);
        Alert.alert('OTP Sent', 'OTP has been sent to the rider');
      } else {
        console.log('❌ [GENERATE OTP] API returned success: false');
      }
    } catch (error: any) {
      console.error('❌ [GENERATE OTP] API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = error.response?.data?.message || 'Failed to generate OTP';
      console.log('💬 [GENERATE OTP] Error message:', errorMessage);
      setError(errorMessage);
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      console.log('🏁 [GENERATE OTP] Process completed');
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (enteredOtp?: string) => {
    const fullOtp = enteredOtp || otp.join('');
    console.log('🔐 [VERIFY OTP] Starting verification:', { fullOtp, bookingId, driverId });

    if (fullOtp.length !== 4) {
      console.log('❌ [VERIFY OTP] Invalid OTP length:', fullOtp.length);
      setError('Please enter 4-digit OTP');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      console.log('📤 [VERIFY OTP] Making API request');
      const response = await api.post('/api/otp/verify', {
        bookingId,
        otp: fullOtp,
        driverId
      });

      console.log('✅ [VERIFY OTP] API Response:', response.data);

      if (response.data.success) {
        console.log('🎉 [VERIFY OTP] OTP verified successfully');
        Alert.alert('Success', 'OTP verified successfully! Ride is now starting.');
        setShowOTPSection(false);
        onOTPVerified();
      } else {
        console.log('❌ [VERIFY OTP] API returned success: false');
      }
    } catch (error: any) {
      console.error('❌ [VERIFY OTP] API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = error.response?.data?.message || 'Invalid OTP';
      const attemptsLeft = error.response?.data?.attemptsLeft;

      console.log('💬 [VERIFY OTP] Error details:', {
        errorMessage,
        attemptsLeft
      });

      if (attemptsLeft !== undefined) {
        setError(`${errorMessage} (${attemptsLeft} attempts left)`);
      } else {
        setError(errorMessage);
      }

      // Clear OTP on error
      console.log('🔄 [VERIFY OTP] Clearing OTP inputs due to error');
      setOtp(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setVerifying(false);
      console.log('🏁 [VERIFY OTP] Process completed');
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    console.log('🔄 [RESEND OTP] Button clicked, timer:', timer);
    
    if (timer > 0) {
      console.log('⏳ [RESEND OTP] Timer still running, skipping');
      return;
    }

    setResendLoading(true);
    setError('');

    try {
      console.log('📤 [RESEND OTP] Making API request');
      const response = await api.post('/api/otp/resend', {
        bookingId,
        driverId
      });

      console.log('✅ [RESEND OTP] API Response:', response.data);

      if (response.data.success) {
        console.log('🎉 [RESEND OTP] OTP resent successfully');
        Alert.alert('OTP Sent', 'New OTP has been sent to the rider');
        setTimer(60);
        setOtp(['', '', '', '']);
        inputRefs[0].current?.focus();
      } else {
        console.log('❌ [RESEND OTP] API returned success: false');
      }
    } catch (error: any) {
      console.error('❌ [RESEND OTP] API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
      console.log('💬 [RESEND OTP] Error message:', errorMessage);
      setError(errorMessage);
      
      Alert.alert('Error', errorMessage);
    } finally {
      setResendLoading(false);
      console.log('🏁 [RESEND OTP] Process completed');
    }
  };

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // If not driver or OTP not needed, don't show anything
  if (!isDriver) {
    console.log('👤 [OTP SECTION] Not driver view, returning null');
    return null;
  }

  console.log('🎨 [OTP SECTION] Rendering component state:', {
    showOTPSection,
    loading,
    verifying,
    otp: otp.join(''),
    error,
    timer
  });

  return (
    <View className="mx-4 my-4">
      {/* Generate OTP Button - Show when OTP section is hidden */}
      {!showOTPSection && (
        <TouchableOpacity
          onPress={handleGenerateOTP}
          disabled={loading}
          className="bg-orange-500 rounded-xl p-4 items-center justify-center active:bg-orange-600"
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Generating OTP...
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="key" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Generate OTP for Rider
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* OTP Input Section */}
      {showOTPSection && (
        <View className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Ionicons name="key" size={24} color="#3B82F6" />
              <Text className="text-gray-800 font-bold text-lg ml-2">
                Enter OTP
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                console.log('❌ [OTP SECTION] Close button clicked');
                setShowOTPSection(false);
              }}
              className="p-1"
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Customer Info */}
          <View className="bg-blue-50 rounded-lg p-3 mb-4">
            <Text className="text-blue-800 font-semibold">
              Customer: {customerName}
            </Text>
            <Text className="text-blue-600 text-sm">
              Phone: {customerPhone}
            </Text>
          </View>

          {/* OTP Input Boxes */}
          <View className="mb-4">
            <Text className="text-gray-600 text-center mb-3">
              Ask rider for 4-digit OTP
            </Text>

            <View className="flex-row justify-between mb-3">
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  className={`w-14 h-14 rounded-lg border-2 ${error ? 'border-red-500' : 'border-gray-300'
                    } bg-white items-center justify-center ${otp[index] ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                >
                  <TextInput
                    ref={inputRefs[index]}
                    value={otp[index]}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    className="text-xl font-bold text-gray-800 text-center w-full h-full"
                    editable={!verifying}
                    placeholder="•"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              ))}
            </View>

            {/* Error Message */}
            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
                <View className="flex-row items-center">
                  <Ionicons name="warning" size={16} color="#EF4444" />
                  <Text className="text-red-700 text-sm ml-2 flex-1">{error}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View className="space-y-2">
            <TouchableOpacity
              onPress={() => handleVerifyOTP()}
              disabled={verifying || otp.join('').length !== 4}
              className={`rounded-lg py-3 items-center justify-center ${verifying || otp.join('').length !== 4
                  ? 'bg-gray-400'
                  : 'bg-green-600 active:bg-green-700'
                }`}
            >
              {verifying ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Verifying...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold">
                  Verify OTP & Start Ride
                </Text>
              )}
            </TouchableOpacity>

            {/* Resend OTP */}
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-500 text-sm">
                Didn't receive OTP?
              </Text>

              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={timer > 0 || resendLoading}
                className={`rounded-lg px-4 py-2 ${timer > 0 || resendLoading
                    ? 'bg-gray-200'
                    : 'bg-blue-100 active:bg-blue-200'
                  }`}
              >
                {resendLoading ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <Text
                    className={`text-sm font-medium ${timer > 0 ? 'text-gray-500' : 'text-blue-600'
                      }`}
                  >
                    {timer > 0 ? `Resend (${formatTime(timer)})` : 'Resend OTP'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Instructions */}
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
            <Text className="text-yellow-800 text-sm">
              <Text className="font-semibold">Note: </Text>
              OTP has been automatically sent to the rider when you accepted the ride.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};