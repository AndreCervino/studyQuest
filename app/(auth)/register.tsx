import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Imports firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
// Imports Firestore
import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "../../firebase";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !username) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    setIsLoading(true);

    try {
      // crea usuario + login automatico

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;
      console.log("Usuario de Auth creado con UID:", uid);

      // garda datos en Firestore bd

      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, {
        email: email,
        username: username,
        points: 0,
        upgrades: [],
        createdAt: new Date().toISOString(),
      });
      console.log("Documento de usuario creado en Firestore para UID:", uid);

      Alert.alert("Éxito", "Usuario registrado correctamente.");
      // delay para alerta
      setTimeout(() => {
        router.replace("/home"); // REPLACE
      }, 50);
    } catch (error: any) {
      // --- Errores ---
      console.error("Error durante el registro:", error);
      let errorMessage = "Ocurrió un error desconocido durante el registro.";

      if (error.code) {
        if (error.code === "auth/email-already-in-use") {
          errorMessage = "El correo electrónico ya está en uso.";
        } else if (error.code === "auth/invalid-email") {
          errorMessage = "El formato del correo electrónico es inválido.";
        } else if (error.code === "auth/operation-not-allowed") {
          errorMessage = "Registro con email/contraseña no está habilitado.";
        } else if (error.code === "auth/weak-password") {
          errorMessage =
            "La contraseña es demasiado débil. Intenta una más fuerte.";
        } else {
          errorMessage = `Error de Firebase: ${error.message}`;
        }
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      Alert.alert("Error de registro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ----- UI pantalla de Register ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

      {/* Campo username */}
      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        placeholderTextColor="#999"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />

      {/* Campo email */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Campo password */}
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Button registrarse */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        {/* navega a Login */}
        <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
        <TouchableOpacity onPress={() => router.push("/login" as any)}>
          <Text style={styles.footerLink}>Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#007BFF",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#a0a0a0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#666",
    fontSize: 16,
  },
  footerLink: {
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
});
