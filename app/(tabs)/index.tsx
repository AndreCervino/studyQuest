import CountdownTimer from "@/components/ui/CountdownTimer";

import { Alert, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const handleTimerComplete = (pointsEarned: number) => {
    Alert.alert("¡Temporizador completado!", `+ ${pointsEarned} puntos`, [
      { text: "OK" },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <CountdownTimer
          // -------- variables para upgrades(TODO) ------------

          initialSeconds={10}
          pointRate={3}
          pointQuantity={1}
          pointProbability={0.5}
          onTimerComplete={handleTimerComplete}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "gray",
    borderRadius: 20,
  },
  mainContainer: {
    width: "90%",
    height: "90%",
    borderWidth: 4,
    borderColor: "#007AFF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
    padding: 20,
  },
  configContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  configText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
});
