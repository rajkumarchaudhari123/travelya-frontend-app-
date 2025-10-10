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
  Alert // Add Alert import
} from "react-native";
import Checkbox from "expo-checkbox";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from '@react-navigation/native'; // Add navigation import
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Add type import
import api from '../../api/axios';
import { AuthStackParamList } from '@/navigation/RootNavigator'; // Import your param list

// Define navigation prop type
type RiderRegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'RiderRegister'
>;

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  profilePhotoUrl: string;
  homeAddress: string;
  workAddress: string;
  language: string;
  accessibilityNeeds: string;
  marketingOptIn: boolean;
  acceptTerms: boolean;
};

type JourneyType = {
  intercity: boolean;
  local: boolean;
};

const RiderRegisterScreen = () => {
  const navigation = useNavigation<RiderRegisterScreenNavigationProp>(); // Initialize navigation
  
  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    email: "",
    profilePhotoUrl: "",
    homeAddress: "",
    workAddress: "",
    language: "",
    accessibilityNeeds: "",
    marketingOptIn: false,
    acceptTerms: false,
  });

  const [journeyModalVisible, setJourneyModalVisible] = useState(true);
  const [journeyType, setJourneyType] = useState<JourneyType>({
    intercity: false,
    local: false,
  });

  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");

  // Function to handle image picking
  const handlePickImage = async (field: keyof FormState) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setForm((prev) => ({ ...prev, [field]: result.assets[0].uri }));
    }
  };

  // Handle form submission with Axios
  const handleSubmit = async () => {
    const payload = { ...form, journeyType, fromCity, toCity };
    console.log("Rider Data Submitted:", payload);

    try {
      // Use Axios instance to send a POST request to the backend API
      const response = await api.post("/rider/rider", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = response.data;
      console.log("Response:", result);

      // Navigate to the DestinationSearchScreen after successful registration
      navigation.navigate('DestinationSearch'); // Use the correct screen name from your param list
    } catch (error) {
      console.error("Error submitting data:", error);
      Alert.alert("Registration failed", "Please try again later.");
    }
  };

  const canContinue = journeyType.intercity || journeyType.local;

  return (
    <>
      {/* Journey Type Modal */}
      <Modal visible={journeyModalVisible} transparent animationType="slide" onRequestClose={() => setJourneyModalVisible(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl p-5">
            <View className="h-1.5 w-16 bg-gray-300 self-center rounded-full mb-4" />
            <Text className="text-xl font-bold mb-2 text-center">Choose your journey type</Text>
            <Text className="text-gray-600 text-center mb-4">Intercity (Delhi → Bihar / Delhi → Mumbai) or Local (Noida ↔ Gurugram)</Text>

            <View className="gap-3">
              {/* Intercity */}
              <Pressable onPress={() => setJourneyType((prev) => ({ ...prev, intercity: !prev.intercity }))} className="flex-row items-center p-3 border border-gray-200 rounded-xl">
                <Checkbox value={journeyType.intercity} onValueChange={() => setJourneyType((prev) => ({ ...prev, intercity: !prev.intercity }))} className="mr-3" />
                <View>
                  <Text className="font-semibold">Outstation / Intercity</Text>
                  <Text className="text-gray-600 text-sm">e.g., Delhi → Bihar, Delhi → Mumbai</Text>
                </View>
              </Pressable>

              {/* Local */}
              <Pressable onPress={() => setJourneyType((prev) => ({ ...prev, local: !prev.local }))} className="flex-row items-center p-3 border border-gray-200 rounded-xl">
                <Checkbox value={journeyType.local} onValueChange={() => setJourneyType((prev) => ({ ...prev, local: !prev.local }))} className="mr-3" />
                <View>
                  <Text className="font-semibold">Local Area</Text>
                  <Text className="text-gray-600 text-sm">e.g., Noida ↔ Gurugram (same-city / nearby)</Text>
                </View>
              </Pressable>
            </View>

            {/* Optional route inputs (show after selecting type) */}
            {(journeyType.intercity || journeyType.local) && (
              <View className="mt-4">
                <Text className="mb-1 font-semibold">Route</Text>
                <View className="flex-row gap-3">
                  <TextInput className="flex-1 border border-gray-300 rounded-lg px-3 py-2" placeholder={journeyType.local ? "Area / Sector" : "From City"} value={fromCity} onChangeText={setFromCity} />
                  <TextInput className="flex-1 border border-gray-300 rounded-lg px-3 py-2" placeholder={journeyType.local ? "Area / Locality" : "To City"} value={toCity} onChangeText={setToCity} />
                </View>
              </View>
            )}

            <View className="flex-row gap-3 mt-5">
              <TouchableOpacity onPress={() => setJourneyModalVisible(false)} className="flex-1 bg-gray-100 rounded-xl p-3">
                <Text className="text-center font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={!canContinue} onPress={() => setJourneyModalVisible(false)} className={`flex-1 rounded-xl p-3 ${canContinue ? "bg-blue-600" : "bg-blue-300"}`}>
                <Text className="text-white text-center font-semibold">Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Main Form (shown after Continue) */}
      <ScrollView className="flex-1 bg-white p-4">
        <Text className="text-xl font-bold text-center mb-1">Rider Registration</Text>
        <Text className="text-center text-gray-600 mb-4">
          Journey: {journeyType.intercity ? "Intercity" : journeyType.local ? "Local" : "Not selected"} {fromCity || toCity ? ` • ${fromCity || "—"} → ${toCity || "—"}` : ""}
        </Text>

        {/* Full Name */}
        <Text className="mb-1 font-semibold">Full Name</Text>
        <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3" placeholder="Enter your full name" value={form.fullName} onChangeText={(t) => setForm({ ...form, fullName: t })} />

        {/* Phone */}
        <Text className="mb-1 font-semibold">Phone Number</Text>
        <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3" placeholder="Enter phone number" keyboardType="phone-pad" value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} />

        {/* Email */}
        <Text className="mb-1 font-semibold">Email</Text>
        <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3" placeholder="Enter email" keyboardType="email-address" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} />

        {/* Profile Photo */}
        <Text className="mb-2 font-semibold">Profile Photo</Text>
        <TouchableOpacity onPress={() => handlePickImage("profilePhotoUrl")} className="border border-dashed border-gray-400 rounded-lg h-32 justify-center items-center">
          {form.profilePhotoUrl ? <Image source={{ uri: form.profilePhotoUrl }} className="w-full h-full rounded-lg" /> : <Text className="text-gray-500">Upload Profile Photo</Text>}
        </TouchableOpacity>

        {/* Home Address */}
        <Text className="mb-1 font-semibold">Home Address</Text>
        <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3" placeholder="Enter home address" value={form.homeAddress} onChangeText={(t) => setForm({ ...form, homeAddress: t })} />

        {/* Work Address */}
        <Text className="mb-1 font-semibold">Work Address</Text>
        <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3" placeholder="Enter work address (optional)" value={form.workAddress} onChangeText={(t) => setForm({ ...form, workAddress: t })} />

        {/* Preferences */}
        <Text className="mb-1 font-semibold">Preferred Language</Text>
        <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3" placeholder="Enter preferred language" value={form.language} onChangeText={(t) => setForm({ ...form, language: t })} />

        {/* Accessibility Needs */}
        <Text className="mb-1 font-semibold">Accessibility Needs</Text>
        <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3" placeholder="Enter accessibility needs (optional)" value={form.accessibilityNeeds} onChangeText={(t) => setForm({ ...form, accessibilityNeeds: t })} />

        {/* Marketing Opt-In */}
        <View className="mb-3">
          <Checkbox value={form.marketingOptIn} onValueChange={(v) => setForm({ ...form, marketingOptIn: v })} />
          <Text className="ml-2 text-gray-700">Opt-in for marketing updates</Text>
        </View>

        {/* Legal */}
        <View className="mb-4">
          <Checkbox value={form.acceptTerms} onValueChange={(v) => setForm({ ...form, acceptTerms: v })} />
          <Text className="ml-2 text-gray-700">I accept the Terms & Privacy Policy</Text>
        </View>

        {/* Submit */}
        <TouchableOpacity onPress={handleSubmit} className="bg-blue-600 rounded-xl p-3 mt-4 mb-8">
          <Text className="text-white text-center font-semibold text-lg">Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

export default RiderRegisterScreen;