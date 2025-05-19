import { Stack, usePathname, useRouter } from "expo-router"; // Importa useRouter
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { auth } from "../firebase";

export default function RootLayout() {
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter(); // Obtén la instancia del router

  useEffect(() => {
    console.log("Configurando listener onAuthStateChanged...");
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log(
        "onAuthStateChanged - Estado de autenticación detectado:",
        firebaseUser?.uid || "null"
      );
      setUser(firebaseUser);
      setIsAuthLoading(false);

      // --- LÓGICA DE NAVEGACIÓN PROGRAMÁTICA ---
      // Si un usuario se autentica y NO está ya en la zona de tabs, redirige.
      // Usamos router.replace para reemplazar la ruta actual en el historial.
      if (firebaseUser && !pathname.startsWith("/(tabs)/")) {
        console.log(
          "onAuthStateChanged - Usuario autenticado fuera de tabs, redirigiendo a /(tabs)/home"
        );
        router.replace("/(tabs)/home");
      }
      // Si un usuario NO está autenticado y SÍ está en la zona de tabs, redirige al login.
      // Esto cubre el caso de que un usuario cierre sesión mientras está en una pantalla de tabs.
      if (!firebaseUser && pathname.startsWith("/(tabs)/")) {
        console.log(
          "onAuthStateChanged - Usuario no autenticado en tabs, redirigiendo a /"
        ); // O a "/login"
        // Considera redirigir a "/" o a tu ruta de login específica si no es la raíz.
        // Para este ejemplo, redirigimos a la raíz que debería llevar al stack (auth).
        router.replace("/");
      }
      // --- FIN LÓGICA DE NAVEGACIÓN PROGRAMÁTICA ---
    });

    // Devuelve la función de limpieza para desuscribirse al desmontar
    return () => {
      console.log("Desuscribiendo de onAuthStateChanged.");
      unsubscribe();
    };
  }, []); // Dependencias: Array vacío. Este efecto solo se ejecuta una vez al montar.

  // --- Renderizado basado en estados (sin redirecciones declarativas aquí) ---

  // Mostrar indicador de carga mientras se verifica el estado inicial de auth
  if (isAuthLoading) {
    console.log("RootLayout - Mostrando pantalla de carga inicial...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Si no hay usuario autenticado, renderiza el Stack principal (donde debe estar el stack (auth))
  if (!user) {
    console.log(
      "RootLayout - No hay usuario autenticado, renderizando stack principal (auth)..."
    );
    // Este Stack renderizará lo que esté en app/(auth)/_layout.tsx
    // Asegúrate de que app/(auth)/_layout.tsx no contenga redirecciones
    // incondicionales a rutas fuera de (auth).
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  // Si hay usuario autenticado, renderiza el Stack principal (donde debe estar el stack (tabs))
  // La navegación para ir a /(tabs)/home se maneja programáticamente en el useEffect.
  console.log(
    "RootLayout - Usuario autenticado, renderizando stack principal (tabs)..."
  );
  return <Stack screenOptions={{ headerShown: false }} />; // Este Stack renderizará lo que esté en app/(tabs)/_layout.tsx
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
