import { Redirect, Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

// Impor instancia  auth dende archivo de Firebase

import { auth } from "../firebase";

// Import componentes de menu

import HeaderMenu from "@/components/ui/HeaderMenu";
import SidebarMenu from "@/components/ui/SidebarMenu";

export default function RootLayout() {
  // -------------- State para almacenar usuario autenicado por Firebase. 'null' = non hay usuario -----------

  const [user, setUser] = useState<any>(null);

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    //  - ---------  listener cada vez que estado de autenticacion cambia ----------

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // Actualiza estado local con user de Firebase/'null'
      setIsAuthLoading(false);
      console.log(
        "Estado de autenticación cambiado:",
        firebaseUser ? firebaseUser.uid : "null"
      );
    });

    // apagar listener
    return () => unsubscribe();
  }, []);

  if (isAuthLoading) {
    // TODO:      añadir pantalla de carga aqui(?)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />{" "}
      </View>
    );
  }

  if (!user) {
    // ----------- se usuario non autenticado mostra solo a pantallas de login/register---------
    return (
      <Stack screenOptions={{ headerShown: false }}>
        {/* rutas de directorio (auth) */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        <Redirect href="/login" />
      </Stack>
    );
  }

  //----------- se usuario SI esta autenticado mostra pantallas de app --------
  return (
    <View style={{ flex: 1 }}>
      <HeaderMenu username={user.email || "Usuario"} />
      <SidebarMenu />

      <View style={{ flex: 1, marginTop: 90 }}>
        {/* rutas de directorio (tabs) */}
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </View>
  );
}

// stylesheet de pantalla de carga
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
