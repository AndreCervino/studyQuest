import CountdownTimer from "@/components/ui/CountdownTimer";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const handleTimerComplete = () => {
    console.log("Temporizador completado - Puntos añadidos");
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <CountdownTimer
          initialSeconds={300}
          onTimerComplete={handleTimerComplete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "90%",
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
});
