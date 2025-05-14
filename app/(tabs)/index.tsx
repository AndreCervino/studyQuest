// app/(tabs)/index.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text, // Asegúrate de que Text está importado
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Importamos las funciones necesarias de firebase/auth
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
      // Esto también loguea al usuario automáticamente
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;
      console.log("Usuario de Auth creado con UID:", uid);

      // PASO 2: Guardar datos adicionales (como el nombre de usuario) en Firestore
      // **¡Con tus reglas de prueba actuales, esto debería pasar!**
      // Si sigue fallando con 400, busca problemas de conexión o el error de UI.
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, {
        email: email,
        username: username, // ¡Aquí guardamos el nombre de usuario!
        points: 0,
        upgrades: [],
        createdAt: new Date().toISOString(),
      });
      console.log("Documento de usuario creado en Firestore para UID:", uid);

      // Si ambos pasos fueron exitosos, navega al home.
      // Usamos 'replace' para que el usuario no pueda volver a la pantalla de registro
      // usando el botón de atrás una vez que se registró.
      // El listener en _layout.tsx también ayudará a la navegación.
      Alert.alert("Éxito", "Usuario registrado correctamente.");
      // Añadimos un pequeño delay para que la alerta se muestre antes de navegar
      setTimeout(() => {
        router.replace("/home"); // <--- Usando replace
      }, 50); // Un delay corto, puedes ajustarlo o eliminarlo si no te gusta la alerta primero
    } catch (error: any) {
      // Manejo de errores
      console.error("Error durante el registro:", error);
      let errorMessage = "Ocurrió un error desconocido durante el registro.";

      if (error.code) {
        // Intenta usar el código de error de Firebase si está disponible
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
          // Para otros errores de Firebase no manejados explícitamente
          errorMessage = `Error de Firebase: ${error.message}`;
        }
      } else if (error.message) {
        // Si no hay código, usa el mensaje general del error
        errorMessage = `Error: ${error.message}`;
      }

      Alert.alert("Error de registro", errorMessage);

      // Considera la lógica para desloguear si falla el setDoc si es importante para ti
      // (Ver comentario en mi respuesta anterior)
    } finally {
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
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
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

      {/* POSIBLE CORRECCIÓN AL Unexpected text node */}
      {/* Asegúrate de que todo el texto esté dentro de <Text> */}
      <View style={styles.footer}>
        {/* Esta es una forma común y segura de estructurar esto */}
        <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
        <TouchableOpacity onPress={() => router.push("/login" as any)}>
          <Text style={styles.footerLink}>Inicia sesión</Text>
        </TouchableOpacity>
      </View>
      {/* O si el texto estaba suelto en otra parte, encuéntralo y envuélvelo en <Text> */}
    </View>
  );
}

// --- Estilos ---
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
    flexDirection: "row", // Para que el texto y el enlace estén en línea
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#666",
    fontSize: 16,
  },
  footerLink: {
    color: "#007BFF", // Color azul para enlaces
    fontSize: 16,
    fontWeight: "600",
    // Añade un pequeño margen si es necesario para separarlo del texto anterior
    marginLeft: 5,
  },
});
