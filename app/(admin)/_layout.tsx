// app/(admin)/_layout.tsx
import { Redirect, Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
// Importa el hook useAuth desde la ruta correcta a tu contexts/AuthContext.tsx
import { useAuth } from "./../contexts/AuthContext"; // Ajusta la ruta si es necesario

export default function AdminLayout() {
  // Obtiene el estado de autenticación, administrador y carga del contexto
  const { user, isAdmin, isLoading } = useAuth();

  // --- Manejo del estado de carga ---
  // Mientras se verifica el estado de autenticación y administrador, muestra un indicador
  if (isLoading) {
    console.log("AdminLayout - Auth/Admin status loading...");
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Verificando permisos de administrador...</Text>
      </View>
    );
  }
  // --- Fin del manejo de carga ---

  // --- Protección de la ruta ---
  // Si NO hay usuario logueado O el usuario logueado NO es administrador
  // Redirige a la pantalla de inicio de sesión (o a otra ruta accesible públicamente)
  if (!user || !isAdmin) {
    console.log(
      `AdminLayout - Access denied. User: ${
        user?.uid || "none"
      }, isAdmin: ${isAdmin}. Redirecting...`
    );
    return <Redirect href="/(auth)" />; // Redirige al grupo de rutas de autenticación
  }
  // --- Fin de la protección ---

  // Si el usuario está logueado Y es administrador, permite el acceso a las rutas dentro de este layout
  console.log(`AdminLayout - Access granted for admin user: ${user.uid}`);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Define las pantallas accesibles DENTRO del área de administrador */}
      {/* La pantalla `index` aquí corresponde a `app/(admin)/console.tsx` */}
      <Stack.Screen name="console" />

      {/* Si tuvieras otras pantallas solo para admin (ej. app/(admin)/settings.tsx), irían aquí: */}
      {/* <Stack.Screen name="settings" /> */}
    </Stack>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Fondo blanco
  },
});
