import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Modal, Pressable } from "react-native";
import Checkbox from "expo-checkbox";
import * as ImagePicker from "expo-image-picker";
import api from '../../api/axios'; // Import the Axios instance

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
    console.log("Driver Data Submitted:", payload);

    try {
      // Use Axios instance to send a POST request to the backend API
      const response = await api.post("/driver/register", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = response.data;
      console.log("Response:", result);
    } catch (error) {
      console.error("Error submitting data:", error);
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
        <Text className="text-xl font-bold text-center mb-1">Driver Registration</Text>
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

        {/* Vehicle Number */}
        <Text className="mb-1 font-semibold">Vehicle Number</Text>
        <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3" placeholder="Enter vehicle number" value={form.vehicleNumber} onChangeText={(t) => setForm({ ...form, vehicleNumber: t })} />

        {/* License Number */}
        <Text className="mb-1 font-semibold">License Number</Text>
        <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3" placeholder="Enter license number" value={form.licenseNumber} onChangeText={(t) => setForm({ ...form, licenseNumber: t })} />

        {/* Document Uploads */}
        <Text className="mb-2 font-semibold">Upload Documents</Text>
        {(["idFront", "idBack", "licenseDoc", "rcDoc", "selfie"] as (keyof FormState)[]).map((field) => (
          <View key={String(field)} className="mb-3">
            <TouchableOpacity onPress={() => handlePickImage(field)} className="border border-dashed border-gray-400 rounded-lg h-32 justify-center items-center">
              {form[field] ? <Image source={{ uri: form[field] as string }} className="w-full h-full rounded-lg" /> : <Text className="text-gray-500">Upload {field === "idFront" ? "ID Front" : field === "idBack" ? "ID Back" : field === "licenseDoc" ? "License" : field === "rcDoc" ? "RC" : "Selfie"}</Text>}
            </TouchableOpacity>
          </View>
        ))}

        {/* Submit */}
        <TouchableOpacity onPress={handleSubmit} className="bg-blue-600 rounded-xl p-3 mt-4 mb-8">
          <Text className="text-white text-center font-semibold text-lg">Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

export default DriverRegisterScreen;
