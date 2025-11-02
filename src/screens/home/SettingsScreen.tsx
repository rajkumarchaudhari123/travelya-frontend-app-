import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  StyleSheet,
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0072FF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: darkMode ? "#111" : "#f8f8f8" },
      ]}
    >
      {/* Gradient Header */}
      <LinearGradient
        colors={["#00C6FF", "#0072FF"]}
        style={styles.headerContainer}
      >
        <Text style={styles.headerText}>
          {role === "rider" ? "Rider Settings" : "Driver Settings"}
        </Text>
      </LinearGradient>

      {/* Common Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>

        <View style={styles.row}>
          <Text style={styles.rowText}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowText}>Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
      </View>

      {/* Role-Based Section */}
      {role === "rider" ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ride Preferences</Text>
          <SettingItem icon="home" label="Saved Addresses" />
          <SettingItem icon="card" label="Payment Methods" />
          <SettingItem icon="time" label="Ride History" />
          <SettingItem icon="location" label="Preferred Pickup Points" />
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Options</Text>
          <SettingItem icon="car" label="Vehicle Information" />
          <SettingItem icon="cash" label="Earnings Summary" />
          <SettingItem icon="document-text" label="Uploaded Documents" />
          <SettingItem icon="sync" label="Ride Availability" />
        </View>
      )}

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support & Help</Text>
        <SettingItem icon="help-circle" label="Help Center" />
        <SettingItem icon="chatbubbles" label="Contact Support" />
        <SettingItem icon="information-circle" label="App Version 1.0.0" />

        <Pressable onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="red" />
          <Text style={[styles.rowText, { color: "red", marginLeft: 10 }]}>
            Logout
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

// ✅ Reusable setting item component
const SettingItem = ({ icon, label }: { icon: any; label: string }) => (
  <Pressable style={styles.settingItem}>
    <Ionicons name={icon} size={22} color="#0072FF" />
    <Text style={styles.rowText}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    paddingVertical: 50,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 15,
  },
  headerText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  section: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rowText: { fontSize: 15, color: "#333" },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SettingsScreen;
