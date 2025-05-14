// app/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

// Importamos la instancia de auth desde tu archivo de Firebase
// Ajusta la ruta si tu archivo firebase.ts no está en la raíz de 'app'
import { auth } from "../firebase";

// Importa tus componentes de menú.
// Asegúrate de que las rutas a estos componentes sean correctas
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
        <ActivityIndicator size="large" color="#0000ff" />{" "}
        {/* Opcional: texto de carga */}
      </View>
    );
  }

  // 2. Si NO hay usuario autenticado (user es null)
  if (!user) {
    // Renderiza un Stack de navegación que SOLO contiene las pantallas de autenticación.
    // Estas rutas están definidas por los archivos dentro de la carpeta (auth).
    // Cualquier intento de ir a otra ruta (fuera de (auth)) será redirigido a /login.
    return (
      <Stack screenOptions={{ headerShown: false }}>
        {/*
          Define las rutas del grupo (auth).
          Expo Router automáticamente mapea app/(auth)/login.tsx a la ruta '/login'
          y app/(auth)/register.tsx a la ruta '/register'.
          Los 'name' en Stack.Screen deben coincidir con los nombres de archivo.
        */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/*
          Esto es una capa adicional de seguridad. Si alguien intenta ir
          a una ruta *no-auth* (como '/home') mientras no está logueado,
          el `if (!user)` lo atrapará aquí en el root _layout,
          y este Redirect lo enviará de vuelta a '/login'.
          Esto solo se activa si el Stack para rutas *no-auth* (el de abajo)
          no se renderiza porque el usuario no está logueado.
        */}
        <Redirect href="/login" />
      </Stack>
    );
  }

  // 3. Si SÍ hay usuario autenticado (user es un objeto)
  // Renderiza la estructura principal de la aplicación con los menús y las pestañas/rutas protegidas.
  // Estas rutas están definidas por los archivos dentro de la carpeta (tabs).
  return (
    // Este View padre permite superponer el Header y la Sidebar si lo deseas
    <View style={{ flex: 1 }}>
      {/* Los menús se muestran aquí, fuera del Stack principal, como lo tenías.
          Esto significa que solo se renderizarán si el usuario está logueado.
          Pasa el username que ahora se puede obtener del objeto 'user' de Firebase. */}
      <HeaderMenu username={user.email || "Usuario"} />
      <SidebarMenu />

      {/* Contenido principal de la aplicación (las pestañas y otras rutas protegidas).
          El marginTop debe coincidir aproximadamente con la altura total del HeaderMenu
          para que el contenido no quede oculto detrás de él. */}
      <View style={{ flex: 1, marginTop: 100 }}>
        {/*
          Este Stack maneja la navegación dentro de la parte autenticada de la app.
          'name="(tabs)"' le dice a Expo Router que renderice el _layout.tsx
          dentro de la carpeta app/(tabs), el cual a su vez definirá las pestañas
          y sus pantallas correspondientes (como home.tsx).
          No necesitas listar explícitamente home, etc. aquí, ya que el
          _layout.tsx dentro de (tabs) se encarga de eso.
        */}
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/*
            Si tuvieras otras pantallas protegidas FUERA del grupo (tabs),
            las listarías aquí:
            <Stack.Screen name="some-other-protected-screen" options={{ ... }} />
          */}
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
  // Si usas un texto de carga, descomenta y ajusta este estilo
  // loadingText: {
  //   marginTop: 10,
  //   fontSize: 18,
  //   color: "#333",
  // },
});
