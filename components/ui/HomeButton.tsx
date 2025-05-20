import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function HomeButton() {
  const router = useRouter();

  const handleNavigation = () => {
    router.push("/(tabs)");
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleNavigation()}
      >
        <Ionicons name="home-outline" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 15,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
