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

// Imports de FIREBASE
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

export default function SimpleLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Indicador de carga

  const handleLogin = async () => {
    // Validacions (TODO: non van os alerts)
    if (!email || !password) {
      Alert.alert("Error", "Por favor, ingresa correo y contraseña.");
      return;
    }

    setIsLoading(true);

    try {
      //----  Inicio de sesion ----
      await signInWithEmailAndPassword(auth, email, password);

      console.log("Inicio de sesión exitoso!");
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 50);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      Alert.alert(
        "Error de inicio de sesión",
        "Verifica tu correo y contraseña e inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false); // Acaba indicador de carga
    }
  };

  // ----- UI de la pantalla de Login ----
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      {/* Campo de email */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail} // Actualiza estado de email o escribir
      />

      {/* Campo de password */}
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry // Oculta contraseña
        value={password}
        onChangeText={setPassword}
      />

      {/* Button Iniciar Sesión */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {/* Indicador de carga on/off */}
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      {/* Navega a pantalla de register */}
      <TouchableOpacity onPress={() => router.push("/register" as any)}>
        <Text style={styles.registerLink}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
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
    borderRadius: 5,
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
  registerLink: {
    marginTop: 20,
    color: "#007BFF",
    fontSize: 16,
  },
});
