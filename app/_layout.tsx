// app/_layout.tsx
import { Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "./contexts/AuthContext"; // Importa el Provider y el hook

// Componente que decide qué Stack renderizar basado en el contexto
function RootLayoutContent() {
  const { user, isLoading } = useAuth(); // Lee el estado del contexto

  // Muestra indicador de carga mientras se verifica el estado inicial de auth
  if (isLoading) {
    console.log(
      "RootLayoutContent - Mostrando pantalla de carga (desde contexto)..."
    );
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Si no hay usuario, renderiza el Stack de (auth)
  if (!user) {
    console.log(
      "RootLayoutContent - No hay usuario, renderizando stack (auth)..."
    );
    return <Stack screenOptions={{ headerShown: false }} />; // Esto cargará app/(auth)/_layout.tsx
  }

  // Si hay usuario, renderiza el Stack de (tabs)
  console.log(
    "RootLayoutContent - Usuario autenticado, renderizando stack (tabs)..."
  );
  return <Stack screenOptions={{ headerShown: false }} />; // Esto cargará app/(tabs)/_layout.tsx
}

// El layout principal que envuelve todo con el AuthProvider
export default function RootLayout() {
  console.log("RootLayout - Montando proveedor de autenticación.");
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
