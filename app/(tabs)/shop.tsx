import HomeButton from "@/components/ui/HomeButton";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.shopContainer}>
        <HomeButton />
      </View>

      <View style={styles.mainContainer}>
        <Text style={styles.text}>TIENDA(WIP)</Text>
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
  shopContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 10,
    width: "100%",
    marginLeft: 120,
    justifyContent: "flex-start",
  },
  mainContainer: {
    width: "90%",
    height: "90%",
    marginBottom: 10,
    borderWidth: 4,
    borderColor: "#007AFF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
    padding: 20,
  },
  text: {
    fontSize: 30,
  },
});
