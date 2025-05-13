import { useRouter } from "expo-router";
import React, { useState } from "react"; // Importar React y useState
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Importamos la función de login y la instancia de auth desde tu archivo de Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase"; // Asegúrate de que la ruta a tu archivo firebase.ts sea correcta

export default function SimpleLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Estado para mostrar el indicador de carga

  const handleLogin = async () => {
    // Validación básica
    if (!email || !password) {
      Alert.alert("Error", "Por favor, ingresa correo y contraseña.");
      return;
    }

    setIsLoading(true); // Activar indicador de carga

    try {
      // Intenta iniciar sesión con email y contraseña usando tu instancia 'auth'
      await signInWithEmailAndPassword(auth, email, password);

      // Si el login es exitoso, Firebase maneja el estado del usuario.
      // Ahora puedes navegar a la pantalla principal.
      console.log("Inicio de sesión exitoso!");
      router.push("/home"); // Redirige al usuario a la ruta /home
    } catch (error) {
      // Si hay un error durante el login (ej: credenciales incorrectas, usuario no existe)
      console.error("Error al iniciar sesión:", error);
      // Mostrar un mensaje de error al usuario
      Alert.alert(
        "Error de inicio de sesión",
        "Verifica tu correo y contraseña e inténtalo de nuevo."
        // Puedes añadir detalles del error si quieres, como error.message
      );
    } finally {
      // Esto se ejecuta tanto si hay éxito como si hay error
      setIsLoading(false); // Desactivar indicador de carga
    }
  };

  // --- UI de la pantalla de Login ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      {/* Campo de Email */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail} // Actualiza el estado del email al escribir
      />

      {/* Campo de Contraseña */}
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry // Oculta la entrada para la contraseña
        value={password}
        onChangeText={setPassword} // Actualiza el estado de la contraseña al escribir
      />

      {/* Botón de Iniciar Sesión */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]} // Estilo para botón deshabilitado
        onPress={handleLogin} // Llama a la función handleLogin al presionar
        disabled={isLoading} // Deshabilita el botón mientras carga
      >
        {/* Muestra indicador de carga si está cargando, de lo contrario muestra texto */}
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      {/* Enlace para ir a la pantalla de Registro (Opcional) */}
      <TouchableOpacity onPress={() => router.push("/register" as any)}>
        <Text style={styles.registerLink}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- Estilos básicos ---
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa todo el espacio disponible
    justifyContent: "center", // Centra verticalmente
    alignItems: "center", // Centra horizontalmente
    padding: 20,
    backgroundColor: "#f5f5f5", // Un fondo suave
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%", // Ocupa todo el ancho del contenedor padre
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
    backgroundColor: "#007BFF", // Un color azul para el botón
    borderRadius: 5,
    alignItems: "center", // Centra el texto del botón
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#a0a0a0", // Color gris cuando está deshabilitado
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
