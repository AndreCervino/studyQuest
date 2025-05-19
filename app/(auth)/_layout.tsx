import { Slot, Stack } from "expo-router";

export default function AuthLayout() {
  console.log("📦 [AUTH LAYOUT] Layout de (auth) cargado");
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Slot />
    </Stack>
  );
}
