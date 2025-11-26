import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function ProfileScreen({ route, navigation }) {
  const user = route?.params?.user;

  // <-- local uploaded image (dev-provided). We pass it as a file URI.
  const localAvatarUri = "file:///mnt/data/ce24967c-f2e4-4072-a02a-0bcaba42c1fc.png";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Top bar with small back arrow */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          {/* Small chevron/back arrow */}
          <Ionicons name="chevron-back" size={22} color="#0B2E4F" />
        </TouchableOpacity>

        <Text style={styles.header}>Profile</Text>

        {/* Spacer so header stays centered */}
        <View style={{ width: 36 }} />
      </View>

      <Text style={styles.sectionTitle}>Account Information</Text>

      {/* CARD */}
      <View style={styles.card}>
        {/* Profile Image (uses uploaded image path) */}
        <View style={styles.avatarWrap}>
          <Image
            source={{ uri: localAvatarUri }}
            style={styles.avatarImage}
            resizeMode="cover"
            onError={() => console.log("Failed to load local avatar URI")}
          />
        </View>

        {/* Name + Role */}
        <Text style={styles.nameText}>
          {user?.FirstName ?? "First"} {user?.LastName ?? "Last"}
        </Text>
        <Text style={styles.roleText}>{user?.Roles?.[0] ?? "Real Estate Agent"}</Text>

        <View style={styles.separator} />

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.Email ?? "not.provided@example.com"}</Text>

      </View>

      {/* SIGN OUT BUTTON */}
      <TouchableOpacity style={styles.logoutBtn} onPress={() => {/* handle sign out */}}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    // transparent background so it's subtle — change if you want a shade
  },

  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B2E4F",
    textAlign: "center",
    fontFamily: "Geist-Bold",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0B2E4F",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#F8F9FC",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E3E6EC",
    marginBottom: 28,
    alignItems: "stretch",
  },

  avatarWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#E3E6EC",
    overflow: "hidden",
    marginBottom: 12,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  nameText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B2E4F",
    textAlign: "center",
    fontFamily: "Geist-Bold",
  },

  roleText: {
    fontSize: 14,
    color: "#7A8CA5",
    textAlign: "center",
    marginBottom: 15,
    fontFamily: "Geist-Regular",
  },

  separator: {
    height: 1,
    backgroundColor: "#E3E6ED",
    marginVertical: 10,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7A8CA5",
    marginTop: 8,
  },

  value: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 5,
    color: "#2C3E50",
  },

  logoutBtn: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 10,
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    marginTop: 10,
  },

  logoutText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
