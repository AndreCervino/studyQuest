import HeaderMenu from "@/components/ui/HeaderMenu";
import SidebarMenu from "@/components/ui/SidebarMenu";
import { Stack } from "expo-router";
import { View } from "react-native";
import { auth } from "../../firebase"; // Asegúrate de que auth se exporta correctamente

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <HeaderMenu username={auth.currentUser?.email || "Usuario"} />
      <SidebarMenu />
      <View style={{ flex: 1, marginTop: 90 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}
