// components/ui/HeaderMenu.tsx
import { useRouter } from "expo-router"; // Importamos useRouter
import { signOut } from "firebase/auth"; // Importamos la función signOut
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native"; // Importamos TouchableOpacity y Alert
import { auth } from "../../firebase"; // Importamos tu instancia de auth

interface HeaderMenuProps {
  username: string; // Prop para mostrar el nombre de usuario
}

export default function HeaderMenu({ username }: HeaderMenuProps) {
  const router = useRouter(); // Inicializamos el hook useRouter

  // Función asíncrona para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      // Llamamos a la función signOut de Firebase
      await signOut(auth);
      console.log("Sesión cerrada exitosamente.");

      // Firebase Auth automáticamente actualizará el estado de autenticación,
      // lo cual será detectado por el listener en _layout.tsx.
      // El _layout.tsx, al ver que no hay usuario logueado, redirigirá al login.
      // Sin embargo, para asegurar una transición inmediata y limpiar el historial,
      // podemos navegar explícitamente al login aquí también.
      // Usamos 'replace' para que no se pueda volver atrás a la pantalla logueada.
      router.replace("/login"); // Reemplazamos la ruta actual con la de login
    } catch (error: any) {
      // Manejo de errores durante el cierre de sesión (menos común, pero posible)
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar la sesión. Inténtalo de nuevo.");
    }
  };

  return (
    // Añadimos el estilo headerContainer al container principal si quieres controlar su zIndex
    <View style={[styles.container, styles.headerContainer]}>
      {/* Círculo vacío izquierdo (quizás para un avatar o icono) */}
      <View style={styles.circle} />

      {/* Círculo con username */}
      {/* Cambiamos este a View ya que el TouchableOpacity será el botón de logout */}
      <View style={styles.square}>
        {/* Podrías mostrar el nombre de usuario aquí si quieres */}
        <Text style={styles.usernameText}>{username}</Text>
      </View>

      {/* Espacio flexible para empujar el botón a la derecha */}
      <View style={styles.spacer}></View>

      {/* Círculo vacío derecho (este será el botón de Logout) */}
      {/* Envolvemos el contenido del círculo en un TouchableOpacity */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Salir</Text>{" "}
        {/* Texto del botón */}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-start", // Alinea los elementos al inicio
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    width: "100%", // Asegura que ocupe todo el ancho
  },
  headerContainer: {
    // Estilo para controlar el zIndex si es necesario
    zIndex: 100, // Asegura que el header esté sobre la sidebar u otro contenido
    // Es posible que necesites un 'position: 'absolute'' o similar dependiendo del layout padre
    position: "absolute", // O 'relative', ajusta según la necesidad de tu layout
    top: 0,
    left: 0,
    right: 0,
  },
  square: {
    // Reutilizamos el estilo square, aunque su contenido sea solo texto
    minWidth: 40,
    minHeight: 40,
    padding: 5,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10, // Añadido margen a la derecha para separar del spacer
  },
  circle: {
    // Reutilizamos el estilo circle
    width: 50, // Ajustado un poco el tamaño para el header
    height: 50,
    borderRadius: 25, // Hacerlo circular
    borderWidth: 2,
    borderColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10, // Añadido margen a la derecha
  },
  spacer: {
    flex: 1, // Usa flex: 1 para tomar el espacio restante y empujar el botón a la derecha
  },
  usernameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  // Nuevo estilo para el botón de logout (el círculo de la derecha)
  logoutButton: {
    minWidth: 60, // Ajusta según el texto "Salir" o "Logout"
    minHeight: 40,
    paddingHorizontal: 10, // Ajusta el padding horizontal
    paddingVertical: 5, // Ajusta el padding vertical
    borderRadius: 20, // Bordes redondeados
    borderWidth: 2,
    borderColor: "#FF0000", // Color rojo para salir
    backgroundColor: "#FF4444", // Un fondo rojo suave (opcional)
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff", // Texto blanco para contraste con el fondo rojo
  },
});
