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

// Importamos la función para crear usuario y la instancia de auth
import { createUserWithEmailAndPassword } from "firebase/auth";
// Importamos funciones para interactuar con Firestore
import { doc, setDoc } from "firebase/firestore";
// Importamos tus instancias de auth y db desde tu archivo de Firebase
import { auth, db } from "../../firebase"; // Asegúrate de que la ruta sea correcta

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Estado para el nombre de usuario
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validación básica
    if (!email || !password || !username) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    setIsLoading(true); // Activar indicador de carga

    try {
      // PASO 1: Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Si la creación en Auth es exitosa, obtenemos el UID del nuevo usuario
      const uid = userCredential.user.uid;
      console.log("Usuario de Auth creado con UID:", uid);

      // PASO 2: Guardar datos adicionales (como el nombre de usuario) en Firestore
      const userDocRef = doc(db, "users", uid); // Referencia al documento del usuario usando su UID

      await setDoc(userDocRef, {
        email: email, // Puedes guardar el email aquí también si lo necesitas
        username: username, // ¡Aquí guardamos el nombre de usuario!
        points: 0, // Inicializa puntos u otros campos
        upgrades: [], // Inicializa otras listas/arrays
        createdAt: new Date().toISOString(), // Opcional: marca de tiempo de creación
      });

      console.log("Documento de usuario creado en Firestore para UID:", uid);

      // Si ambos pasos fueron exitosos, navega al home (o a donde quieras)
      // Nota: createUserWithEmailAndPassword también loguea al usuario automáticamente
      Alert.alert("Éxito", "Usuario registrado correctamente.");
      router.push("/home"); // Redirige al usuario después de un registro exitoso
    } catch (error: any) {
      // Manejo de errores de Firebase (Auth o Firestore)
      console.error("Error durante el registro:", error);

      let errorMessage = "Ocurrió un error desconocido durante el registro.";

      // Errores comunes de Firebase Authentication
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "El correo electrónico ya está en uso.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "El formato del correo electrónico es inválido.";
      } else if (error.code === "auth/operation-not-allowed") {
        // Esto debería manejarse habilitando Email/Password en la consola
        errorMessage = "Registro con email/contraseña no está habilitado.";
      } else if (error.code === "auth/weak-password") {
        errorMessage =
          "La contraseña es demasiado débil. Intenta una más fuerte.";
      }
      // Otros posibles errores de conexión o Firestore

      Alert.alert("Error de registro", errorMessage);
    } finally {
      // Esto se ejecuta tanto si hay éxito como si hay error
      setIsLoading(false); // Desactivar indicador de carga
    }
  };

  // --- UI de la pantalla de Registro ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

      {/* Campo de Nombre de Usuario */}
      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        placeholderTextColor="#999"
        autoCapitalize="none" // Los nombres de usuario suelen ser sin mayúsculas
        value={username}
        onChangeText={setUsername} // Actualiza el estado del nombre de usuario
      />

      {/* Campo de Email */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Campo de Contraseña */}
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Botón de Registrarse */}
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

      {/* Enlace para ir a la pantalla de Login */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
        {/* Usamos router.push para navegar a la ruta de login */}
        <TouchableOpacity onPress={() => router.push("/login" as any)}>
          <Text style={styles.footerLink}>Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- Estilos (puedes reutilizar o adaptar los de tu LoginScreen) ---
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
    backgroundColor: "#28a745", // Un color verde para registrarse
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
  },
});
