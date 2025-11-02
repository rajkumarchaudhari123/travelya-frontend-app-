import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
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
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0072FF" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.center}>
                <Text style={{ color: "#333", fontSize: 16 }}>No profile found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
            {/* Header */}
            <LinearGradient
                colors={["#00C6FF", "#0072FF"]}
                style={styles.headerContainer}
            >
                <View style={styles.profileSection}>
                    <Image
                        source={{
                            uri:
                                user?.profilePic ||
                                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                        }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{user?.fullName}</Text>
                    <Text style={styles.phone}>{user?.phone}</Text>
                    {role === "driver" && user?.vehicleNumber && (
                        <Text style={{ color: "#fff", opacity: 0.9 }}>
                            Vehicle: {user.vehicleNumber}
                        </Text>
                    )}
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>4.9</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Common Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Info</Text>
                <ProfileItem icon="person-circle" label="Edit Profile" />
                <ProfileItem icon="key" label="Change Password" />
                {role === "rider" && <ProfileItem icon="time" label="Ride History" />}
                {role === "rider" && (
                    <ProfileItem icon="card" label="Payment Methods" />
                )}
            </View>

            {/* Driver-Specific Section */}
            {role === "driver" && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Driver Dashboard</Text>
                    <ProfileItem icon="car" label="Vehicle Information" />
                    <ProfileItem icon="cash" label="Earnings Summary" />
                    <ProfileItem icon="document-text" label="Uploaded Documents" />
                    <ProfileItem
                        icon="navigate"
                        label={`Route: ${user.route?.fromCity || "N/A"} → ${user.route?.toCity || "N/A"
                            }`}
                    />
                </View>
            )}

            {/* App Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>App Settings</Text>
                <ProfileItem icon="moon" label="Dark Mode" />
                <ProfileItem icon="language" label="Language" />
                <ProfileItem icon="notifications" label="Notifications" />
            </View>

            {/* Support Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>
                <ProfileItem icon="help-circle" label="Help Center" />
                <ProfileItem icon="call" label="Contact Support" />
                <ProfileItem icon="information-circle" label="About Us" />
                <Pressable
                    style={styles.logoutButton}
                    onPress={async () => {
                        await AsyncStorage.clear();
                        alert("Logged out successfully!");
                    }}
                >
                    <Ionicons name="log-out-outline" size={22} color="red" />
                    <Text style={{ color: "red", marginLeft: 10 }}>Logout</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
};

// Reusable profile menu item
const ProfileItem = ({ icon, label }: { icon: any; label: string }) => (
    <Pressable style={styles.profileItem}>
        <Ionicons name={icon} size={22} color="#0072FF" />
        <Text style={styles.profileText}>{label}</Text>
    </Pressable>
);

const styles = StyleSheet.create({
    headerContainer: {
        alignItems: "center",
        paddingVertical: 50,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        marginBottom: 15,
    },
    profileSection: { alignItems: "center" },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 2,
        borderColor: "#fff",
    },
    name: { fontSize: 20, fontWeight: "700", color: "#fff", marginTop: 10 },
    phone: { color: "#fff", opacity: 0.8 },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: { color: "#fff", marginLeft: 5, fontWeight: "600" },
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
    profileItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        gap: 10,
    },
    profileText: { fontSize: 15, color: "#333" },
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

export default ProfileScreen;
