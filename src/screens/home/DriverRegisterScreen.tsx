import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Checkbox from "expo-checkbox";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axios';
import { AuthStackParamList } from '@/navigation/RootNavigator';

type DriverRegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'DriverRegister'
>;

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  vehicleNumber: string;
  licenseNumber: string;
  idFront: string | null;
  idBack: string | null;
  licenseDoc: string | null;
  rcDoc: string | null;
  selfie: string | null;
};

type JourneyType = {
  intercity: boolean;
  local: boolean;
};

const DriverRegisterScreen = () => {
  const navigation = useNavigation<DriverRegisterScreenNavigationProp>();

  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    email: "",
    vehicleNumber: "",
    licenseNumber: "",
    idFront: null,
    idBack: null,
    licenseDoc: null,
    rcDoc: null,
    selfie: null,
  });

  const [journeyModalVisible, setJourneyModalVisible] = useState(true);
  const [journeyType, setJourneyType] = useState<JourneyType>({
    intercity: false,
    local: false,
  });

  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePickImage = async (field: keyof FormState) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        setForm((prev) => ({ ...prev, [field]: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.fullName?.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    if (!form.phone?.trim() || form.phone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    if (!form.vehicleNumber?.trim()) {
      Alert.alert("Error", "Please enter your vehicle number");
      return;
    }

    if (!form.licenseNumber?.trim()) {
      Alert.alert("Error", "Please enter your license number");
      return;
    }

    if (!journeyType.intercity && !journeyType.local) {
      Alert.alert("Error", "Please select a journey type");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        journeyType,
        fromCity: fromCity.trim(),
        toCity: toCity.trim(),
      };

      console.log("Submitting driver registration:", payload);

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]: [string, any]) => {
        if (value) {
          if (
            key === "idFront" ||
            key === "idBack" ||
            key === "licenseDoc" ||
            key === "rcDoc" ||
            key === "selfie"
          ) {
            formData.append(
              key,
              {
                uri: value,
                type: "image/jpeg",
                name: `${key}.jpg`,
              } as any // 👈 fix for TypeScript
            );
          } else {
            formData.append(key, value);
          }
        }
      });

      formData.append("journeyType", JSON.stringify(journeyType));
      formData.append("fromCity", fromCity.trim());
      formData.append("toCity", toCity.trim());

      const response = await api.post("/api/driver/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });


      const result = response.data;
      console.log("Driver Registration Response:", result);

      if (response.status === 200 || response.status === 201) {
        // Store driver authentication data
        await AsyncStorage.multiSet([
          ['userToken', 'driver-auth-token'],
          ['userRole', 'driver'],
          ['driverData', JSON.stringify({
            id: result.driverId || `driver-${Date.now()}`,
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            vehicleNumber: form.vehicleNumber.trim(),
            email: form.email?.trim() || '',
            journeyType: journeyType,
            route: { fromCity, toCity }
          })]
        ]);

        console.log('Driver data stored successfully');

        // Show success message
        Alert.alert(
          "Registration Successful! ",
          "Welcome to Driver App! You can now start receiving ride requests.",
          [
            {
              text: "Get Started",
              onPress: async () => {
                // Navigate to Driver Dashboard
                await AsyncStorage.setItem("userRole", "driver");
                await AsyncStorage.setItem("userToken", "driver-auth-token");
                navigation.reset({ index: 0, routes: [{ name: "DriverDashboard" }] });

              }
            }
          ]
        );

      } else {
        throw new Error(result.message || "Registration failed");
      }

    } catch (error: any) {
      console.error("Registration error:", error);

      let errorMessage = "Registration failed. Please check your connection and try again.";

      if (error.response) {
        // Server responded with error status
        if (error.response.status === 400) {
          errorMessage = "Invalid data provided. Please check your information.";
        } else if (error.response.status === 409) {
          errorMessage = "Driver already registered with this phone number.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check your internet connection.";
      }

      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canContinue = journeyType.intercity || journeyType.local;

  const getDocumentDisplayName = (field: keyof FormState): string => {
    const displayNames: Record<keyof FormState, string> = {
      fullName: "Full Name",
      phone: "Phone",
      email: "Email",
      vehicleNumber: "Vehicle Number",
      licenseNumber: "License Number",
      idFront: "ID Card Front",
      idBack: "ID Card Back",
      licenseDoc: "License Document",
      rcDoc: "RC Document",
      selfie: "Selfie Photo"
    };
    return displayNames[field];
  };

  const getDocumentDescription = (field: keyof FormState): string => {
    const descriptions: Record<keyof FormState, string> = {
      idFront: "Front side of your government ID",
      idBack: "Back side of your government ID",
      licenseDoc: "Your driving license document",
      rcDoc: "Vehicle RC document",
      selfie: "Clear selfie for verification",
      fullName: "",
      phone: "",
      email: "",
      vehicleNumber: "",
      licenseNumber: ""
    };
    return descriptions[field] || "";
  };

  return (
    <>
      {/* Journey Type Selection Modal */}
      <Modal
        visible={journeyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setJourneyModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            {/* Drag Handle */}
            <View className="h-1.5 w-16 bg-gray-300 self-center rounded-full mb-4" />

            <Text className="text-2xl font-bold mb-2 text-center text-gray-800">
              Choose Your Journey Type
            </Text>
            <Text className="text-gray-600 text-center mb-6 text-base">
              Select the type of rides you want to offer
            </Text>

            <View className="gap-4 mb-6">
              {/* Intercity Option */}
              <Pressable
                onPress={() => setJourneyType((prev) => ({ ...prev, intercity: !prev.intercity }))}
                className={`flex-row items-center p-4 border-2 rounded-2xl ${journeyType.intercity ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
              >
                <Checkbox
                  value={journeyType.intercity}
                  onValueChange={() => setJourneyType((prev) => ({ ...prev, intercity: !prev.intercity }))}
                  color={journeyType.intercity ? "#3B82F6" : undefined}
                  className="mr-4"
                />
                <View className="flex-1">
                  <Text className="font-bold text-lg text-gray-800 mb-1">
                    Outstation / Intercity
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Long distance trips between cities • Delhi → Mumbai, Delhi → Bihar
                  </Text>
                </View>
              </Pressable>

              {/* Local Option */}
              <Pressable
                onPress={() => setJourneyType((prev) => ({ ...prev, local: !prev.local }))}
                className={`flex-row items-center p-4 border-2 rounded-2xl ${journeyType.local ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                  }`}
              >
                <Checkbox
                  value={journeyType.local}
                  onValueChange={() => setJourneyType((prev) => ({ ...prev, local: !prev.local }))}
                  color={journeyType.local ? "#10B981" : undefined}
                  className="mr-4"
                />
                <View className="flex-1">
                  <Text className="font-bold text-lg text-gray-800 mb-1">
                    Local Area Rides
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Short distance trips within city • Noida ↔ Gurugram, Delhi ↔ Noida
                  </Text>
                </View>
              </Pressable>
            </View>

            {/* Route Inputs */}
            {(journeyType.intercity || journeyType.local) && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-800 mb-3">
                  Preferred Route {!fromCity && !toCity && "(Optional)"}
                </Text>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <TextInput
                      className="border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                      placeholder={journeyType.local ? "From Area/Sector" : "From City"}
                      placeholderTextColor="#9CA3AF"
                      value={fromCity}
                      onChangeText={setFromCity}
                    />
                  </View>
                  <View className="flex-1">
                    <TextInput
                      className="border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                      placeholder={journeyType.local ? "To Area/Locality" : "To City"}
                      placeholderTextColor="#9CA3AF"
                      value={toCity}
                      onChangeText={setToCity}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setJourneyModalVisible(false)}
                className="flex-1 bg-gray-100 rounded-xl py-4"
              >
                <Text className="text-gray-800 text-center font-semibold text-lg">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!canContinue}
                onPress={() => setJourneyModalVisible(false)}
                className={`flex-1 rounded-xl py-4 ${canContinue ? "bg-blue-600" : "bg-blue-300"
                  }`}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Main Registration Form */}
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Header */}
        <View className="bg-white px-6 pt-16 pb-6 shadow-sm">
          <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
            Driver Registration
          </Text>
          <Text className="text-gray-600 text-center text-base">
            {journeyType.intercity ? "Intercity Driver" : journeyType.local ? "Local Driver" : "Complete your profile"}
            {fromCity || toCity ? ` • ${fromCity || "—"} → ${toCity || "—"}` : ""}
          </Text>
        </View>

        <View className="p-6">
          {/* Personal Information Section */}
          <View className="bg-white rounded-2xl p-5 shadow-sm mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Personal Information
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-800 font-semibold mb-2">
                  Full Name <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={form.fullName}
                  onChangeText={(text) => setForm(prev => ({ ...prev, fullName: text }))}
                />
              </View>

              <View>
                <Text className="text-gray-800 font-semibold mb-2">
                  Phone Number <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                  placeholder="Enter 10-digit phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(text) => setForm(prev => ({ ...prev, phone: text }))}
                  maxLength={10}
                />
              </View>

              <View>
                <Text className="text-gray-800 font-semibold mb-2">
                  Email Address
                </Text>
                <TextInput
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                  placeholder="Enter email address (optional)"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
                />
              </View>
            </View>
          </View>

          {/* Vehicle Information Section */}
          <View className="bg-white rounded-2xl p-5 shadow-sm mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Vehicle Information
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-800 font-semibold mb-2">
                  Vehicle Number <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                  placeholder="e.g., DL01AB1234"
                  placeholderTextColor="#9CA3AF"
                  value={form.vehicleNumber}
                  onChangeText={(text) => setForm(prev => ({ ...prev, vehicleNumber: text }))}
                  autoCapitalize="characters"
                />
              </View>

              <View>
                <Text className="text-gray-800 font-semibold mb-2">
                  License Number <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                  placeholder="Enter driving license number"
                  placeholderTextColor="#9CA3AF"
                  value={form.licenseNumber}
                  onChangeText={(text) => setForm(prev => ({ ...prev, licenseNumber: text }))}
                />
              </View>
            </View>
          </View>

          {/* Documents Upload Section */}
          <View className="bg-white rounded-2xl p-5 shadow-sm mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-2">
              Upload Documents
            </Text>
            <Text className="text-gray-600 mb-4">
              Upload clear photos of your documents for verification
            </Text>

            <View className="space-y-5">
              {(['idFront', 'idBack', 'licenseDoc', 'rcDoc', 'selfie'] as (keyof FormState)[]).map((field) => (
                <View key={field} className="border-2 border-dashed border-gray-300 rounded-2xl p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-800 text-lg">
                        {getDocumentDisplayName(field)}
                      </Text>
                      {getDocumentDescription(field) && (
                        <Text className="text-gray-600 text-sm mt-1">
                          {getDocumentDescription(field)}
                        </Text>
                      )}
                    </View>
                    {form[field] && (
                      <TouchableOpacity
                        onPress={() => setForm(prev => ({ ...prev, [field]: null }))}
                        className="bg-red-100 px-3 py-1 rounded-full"
                      >
                        <Text className="text-red-600 text-sm font-semibold">
                          Remove
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => handlePickImage(field)}
                    className={`rounded-xl overflow-hidden ${form[field] ? 'h-40' : 'h-32 border-2 border-dashed border-gray-400'
                      } justify-center items-center bg-gray-50`}
                  >
                    {form[field] ? (
                      <Image
                        source={{ uri: form[field] as string }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="items-center">
                        <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                          <Text className="text-blue-600 text-2xl font-bold">+</Text>
                        </View>
                        <Text className="text-gray-600 font-semibold text-center">
                          Tap to Upload
                        </Text>
                        <Text className="text-gray-500 text-sm text-center mt-1">
                          {getDocumentDisplayName(field)}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`rounded-2xl py-5 mt-4 flex-row justify-center items-center shadow-lg ${loading ? 'bg-blue-400' : 'bg-blue-600'
              }`}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-bold text-lg ml-3">
                  Registering...
                </Text>
              </>
            ) : (
              <Text className="text-white font-bold text-lg">
                Complete Registration & Start Driving
              </Text>
            )}
          </TouchableOpacity>

          {/* Info Text */}
          <Text className="text-gray-500 text-center text-sm mt-4 px-4">
            By registering, you agree to our Terms of Service and Privacy Policy. Your documents will be verified within 24-48 hours.
          </Text>
        </View>
      </ScrollView>
    </>
  );
};

export default DriverRegisterScreen;