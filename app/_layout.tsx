// app/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native"; // Importa ActivityIndicator y StyleSheet

// Importamos la instancia de auth desde tu archivo de Firebase
import { auth } from "../firebase"; // Asegúrate de que la ruta sea correcta

// Importa tus componentes de menú.
// **Nota:** Estos menús se mostrarán solo cuando el usuario esté autenticado.
// Las pantallas de login y registro NO tendrán estos menús.
import HeaderMenu from "@/components/ui/HeaderMenu";
import SidebarMenu from "@/components/ui/SidebarMenu";

export default function RootLayout() {
  // Estado para almacenar el usuario autenticado por Firebase. Es 'null' si no hay usuario.
  const [user, setUser] = useState<any>(null); // Puedes usar un tipo más específico si tienes uno definido
  // Estado para saber si ya hemos terminado de verificar el estado inicial de autenticación
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Este listener se activa cada vez que el estado de autenticación cambia
    // (al iniciar la app, al loguearse, al registrarse, al cerrar sesión)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // Actualiza el estado local con el usuario de Firebase (o null)
      setIsAuthLoading(false); // Ya verificamos el estado inicial
      console.log(
        "Estado de autenticación cambiado:",
        firebaseUser ? firebaseUser.uid : "null"
      ); // Útil para depurar
    });

    // onAuthStateChanged devuelve una función para 'limpiar' (dejar de escuchar)
    // Es importante llamarla cuando el componente de layout se desmonte
    return () => unsubscribe();
  }, []); // El array vacío asegura que este efecto solo se ejecute una vez al montar el layout

  // --- Lógica de renderizado basada en el estado de autenticación ---

  // 1. Si aún estamos verificando el estado inicial (por ejemplo, al abrir la app)
  if (isAuthLoading) {
    // Puedes mostrar una pantalla de carga o un splash screen aquí
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        {/* Opcional: texto de carga */}
      </View>
    );
  }

  // 2. Si NO hay usuario autenticado (user es null)
  if (!user) {
    // Renderiza un Stack de navegación que SOLO contiene las pantallas de autenticación.
    // Cualquier intento de ir a otra ruta (como '/home') será redirigido a '/login'.
    return (
      <Stack screenOptions={{ headerShown: false }}>
        {/* Define tus rutas de login y registro aquí */}
        <Stack.Screen name="login" /> {/* app/login.tsx */}
        <Stack.Screen name="register" /> {/* app/register.tsx */}
        {/* Si intentan acceder a cualquier otra ruta sin estar logueados, redirige a login */}
        <Redirect href="/login" />
      </Stack>
    );
  }

  // 3. Si SÍ hay usuario autenticado (user es un objeto)
  // Renderiza la estructura principal de la aplicación con los menús y las pestañas/rutas protegidas.
  return (
    <View style={{ flex: 1 }}>
      {/* Los menús se muestran aquí, fuera del Stack principal, como lo tenías.
          Esto significa que solo se renderizarán si el usuario está logueado. */}
      <HeaderMenu username={user.email || "Usuario"} />{" "}
      {/* Usa el email o el nombre de usuario si lo guardas en Auth */}
      <SidebarMenu />
      {/* Contenido principal de la aplicación.
          El marginTop debe coincidir con la altura del HeaderMenu para que no quede cubierto */}
      <View style={{ flex: 1, marginTop: 100 }}>
        {" "}
        {/* Ajusta 100px según la altura real de tu HeaderMenu */}
        {/* Este Stack contiene las rutas accesibles una vez que el usuario está logueado */}
        <Stack>
          {/* Tu grupo de pestañas u otras rutas protegidas */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Añade aquí otras pantallas principales si no están dentro de (tabs) */}
        </Stack>
      </View>
    </View>
  );
}

// Estilos para la pantalla de carga
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // Un fondo similar al de tus pantallas
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#333",
  },
});
