import CountdownTimer from "@/components/ui/CountdownTimer";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <CountdownTimer initialSeconds={300} />
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
    borderRadius: 20
  },
  mainContainer: {
    width: "90%",
    height: "90%",
    borderWidth: 4,
    borderColor: "#007AFF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
