import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Pressable,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
    const [role, setRole] = useState<"rider" | "driver" | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedRole = await AsyncStorage.getItem("userRole");
                const storedDriver = await AsyncStorage.getItem("driverData");
                const storedRider = await AsyncStorage.getItem("riderData");

                if (storedRole === "driver" && storedDriver) {
                    setRole("driver");
                    setUser(JSON.parse(storedDriver));
                } else if (storedRole === "rider" && storedRider) {
                    setRole("rider");
                    setUser(JSON.parse(storedRider));
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#0072FF" />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-gray-800 text-base">No profile found</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <LinearGradient
                colors={["#00C6FF", "#0072FF"]}
                className="items-center py-12 rounded-b-3xl mb-4"
            >
                <View className="items-center">
                    <Ionicons
                        name="person-circle"
                        size={100}
                        color="white"
                    />

             
                    <Text className="text-xl font-bold text-white mt-2">{user?.fullName}</Text>
                    <Text className="text-white opacity-80">{user?.phone}</Text>
                    {role === "driver" && user?.vehicleNumber && (
                        <Text className="text-white opacity-90">
                            Vehicle: {user.vehicleNumber}
                        </Text>
                    )}
                    <View className="flex-row items-center mt-2 bg-white/20 px-3 py-1 rounded-full">
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text className="text-white font-semibold ml-1">4.9</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Common Section */}
            <View className="bg-white p-4 mx-4 rounded-xl mb-4 shadow-sm shadow-black/10">
                <Text className="text-base font-semibold text-gray-800 mb-2">Account Info</Text>
                <ProfileItem icon="person-circle" label="Edit Profile" />
                <ProfileItem icon="key" label="Change Password" />
                {role === "rider" && <ProfileItem icon="time" label="Ride History" />}
                {role === "rider" && (
                    <ProfileItem icon="card" label="Payment Methods" />
                )}
            </View>

            {/* Driver-Specific Section */}
            {role === "driver" && (
                <View className="bg-white p-4 mx-4 rounded-xl mb-4 shadow-sm shadow-black/10">
                    <Text className="text-base font-semibold text-gray-800 mb-2">Driver Dashboard</Text>
                    <ProfileItem icon="car" label="Vehicle Information" />
                    <ProfileItem icon="cash" label="Earnings Summary" />
                    <ProfileItem icon="document-text" label="Uploaded Documents" />
                    {/* <ProfileItem
                        icon="navigate"
                        label={`Route: ${user.route?.fromCity || "N/A"} → ${user.route?.toCity || "N/A"
                            }`}
                    /> */}
                </View>
            )}

      

            {/* Support Section */}
            <View className="bg-white p-4 mx-4 rounded-xl mb-4 shadow-sm shadow-black/10">
                <Text className="text-base font-semibold text-gray-800 mb-2">Support</Text>
                <ProfileItem icon="help-circle" label="Help Center" />
                <ProfileItem icon="call" label="Contact Support" />
                <ProfileItem icon="information-circle" label="About Us" />
                <Pressable
                    className="flex-row items-center mt-2"
                    onPress={async () => {
                        await AsyncStorage.clear();
                        alert("Logged out successfully!");
                    }}
                >
                    <Ionicons name="log-out-outline" size={22} color="red" />
                    <Text className="text-red-500 ml-2">Logout</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
};

// Reusable profile menu item
const ProfileItem = ({ icon, label }: { icon: any; label: string }) => (
    <Pressable className="flex-row items-center py-2">
        <Ionicons name={icon} size={22} color="#0072FF" />
        <Text className="text-base text-gray-800 ml-2">{label}</Text>
    </Pressable>
);

export default ProfileScreen;