// app/_layout.tsx
import HeaderMenu from "@/components/ui/HeaderMenu";
import SidebarMenu from "@/components/ui/SidebarMenu";
import { Stack } from "expo-router";
import {
    View
} from "react-native";

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      <HeaderMenu username="Estudiante" />
      <SidebarMenu />
      
      {/* Contenido principal */}
      <View style={{ flex: 1, marginTop: 100 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </View>
  );
}