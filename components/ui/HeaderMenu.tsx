import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebase";

interface HeaderMenuProps {
  username: string;
}

export default function HeaderMenu({ username }: HeaderMenuProps) {
  const router = useRouter();
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    if (!auth.currentUser?.uid) return;

    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      const userData = doc.data();
      setPoints(userData?.points || 0);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login"); // Esto está dentro de (auth)/login.tsx
    } catch (error) {
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };

  return (
    <View style={[styles.container, styles.headerContainer]}>
      <View style={styles.circle} />
      <View style={styles.userInfo}>
        <Text style={styles.usernameText}>{username}</Text>
        <Text style={styles.pointsText}>{points} pts</Text>
      </View>
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Salir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "#f0f0f0",
    width: "100%",
  },
  headerContainer: {
    zIndex: 100,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#007AFF",
    marginRight: 10,
  },
  userInfo: {
    alignItems: "flex-start",
  },
  usernameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  pointsText: {
    fontSize: 14,
    color: "#28a745",
    fontWeight: "bold",
  },
  spacer: {
    flex: 1,
  },
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FF0000",
    backgroundColor: "#FF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
