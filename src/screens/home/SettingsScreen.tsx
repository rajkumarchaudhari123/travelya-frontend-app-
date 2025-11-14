import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen = () => {
  const [role, setRole] = useState<"rider" | "driver" | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(true);

  // ✅ Detect role from AsyncStorage (same as ProfileScreen)
  useEffect(() => {
    const getRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem("userRole");
        if (storedRole === "driver" || storedRole === "rider") {
          setRole(storedRole);
        } else {
          setRole("rider"); // fallback
        }
      } catch (err) {
        console.error("Error fetching userRole:", err);
      } finally {
        setLoading(false);
      }
    };
    getRole();
  }, []);

  const logout = async () => {
    await AsyncStorage.clear();
    alert("Logged out successfully!");
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0072FF" />
      </View>
    );
  }

  return (
    <ScrollView className={`flex-1 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Gradient Header */}
      <LinearGradient
        colors={["#00C6FF", "#0072FF"]}
        className="py-12 items-center rounded-b-3xl mb-4"
      >
        <Text className="text-white text-xl font-bold">
          {role === "rider" ? "Rider Settings" : "Driver Settings"}
        </Text>
      </LinearGradient>

      {/* Common Section */}
      <View className="bg-white mx-4 p-4 rounded-xl mb-4 shadow-sm shadow-black/10">
        <Text className="text-base font-semibold text-gray-800 mb-3">General</Text>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base text-gray-800">Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>

        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-base text-gray-800">Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
      </View>

      {/* Role-Based Section */}
      {role === "rider" ? (
        <View className="bg-white mx-4 p-4 rounded-xl mb-4 shadow-sm shadow-black/10">
          <Text className="text-base font-semibold text-gray-800 mb-3">Ride Preferences</Text>
          <SettingItem icon="home" label="Saved Addresses" />
          <SettingItem icon="card" label="Payment Methods" />
          <SettingItem icon="time" label="Ride History" />
          <SettingItem icon="location" label="Preferred Pickup Points" />
        </View>
      ) : (
        <View className="bg-white mx-4 p-4 rounded-xl mb-4 shadow-sm shadow-black/10">
          <Text className="text-base font-semibold text-gray-800 mb-3">Driver Options</Text>
          <SettingItem icon="car" label="Vehicle Information" />
          <SettingItem icon="cash" label="Earnings Summary" />
          <SettingItem icon="document-text" label="Uploaded Documents" />
          <SettingItem icon="sync" label="Ride Availability" />
        </View>
      )}

      {/* Support Section */}
      <View className="bg-white mx-4 p-4 rounded-xl mb-4 shadow-sm shadow-black/10">
        <Text className="text-base font-semibold text-gray-800 mb-3">Support & Help</Text>
        <SettingItem icon="help-circle" label="Help Center" />
        <SettingItem icon="chatbubbles" label="Contact Support" />
        <SettingItem icon="information-circle" label="App Version 1.0.0" />

        <Pressable onPress={logout} className="flex-row items-center mt-3">
          <Ionicons name="log-out-outline" size={22} color="red" />
          <Text className="text-red-500 text-base ml-3">Logout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

// ✅ Reusable setting item component
const SettingItem = ({ icon, label }: { icon: any; label: string }) => (
  <Pressable className="flex-row items-center py-2">
    <Ionicons name={icon} size={22} color="#0072FF" />
    <Text className="text-base text-gray-800 ml-3">{label}</Text>
  </Pressable>
);

export default SettingsScreen;