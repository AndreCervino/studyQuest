import { StyleSheet, Text, View } from "react-native";

interface HeaderMenuProps {
  username: string;
}

export default function HeaderMenu({ username }: HeaderMenuProps) {
  return (
    <View style={styles.container}>
      {/* Círculo vacío izquierdo */}
      <View style={styles.circle} />
      
      {/* Círculo con username */}
      <View style={styles.square}>
        <Text style={styles.usernameText}>{username}</Text>
      </View>
      <View style={styles.spacer}></View>
      
      {/* Círculo vacío derecho */}
      <View style={styles.square} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  square: {
    minWidth: 40,
    minHeight: 40,
    padding: 5,
    borderRadius: 5, // Circular
    borderWidth: 2,
    borderColor: "#007AFF", // Azul de tu paleta
    justifyContent: "center",
    alignItems: "center",
  },
  spacer: {
    width:"60%"

  },
  circle: {
    width: 70,
    height:70,
    borderRadius: 100, // Circular
    borderWidth: 2,
    borderColor: "#007AFF", // Azul de tu paleta
    justifyContent: "center",
    alignItems: "center",
  },
  usernameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
    headerContainer: {
    zIndex: 100, // Asegura que el header esté sobre la sidebar
  }
});