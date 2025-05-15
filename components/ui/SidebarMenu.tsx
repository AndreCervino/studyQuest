import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

const { height } = Dimensions.get("window");

// Solución para el error de tipo con Animated.View
const AnimatedView = Animated.View as unknown as React.ComponentType<any>;

export default function SidebarMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(-250))[0];

  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? -250 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const menuOptions = ["Screen1", "Screen2", "Screen3", "Screen4"];

  return (
    <>
      {/* Botón para abrir/cerrar el menú */}
      <TouchableOpacity style={styles.toggleButton} onPress={toggleMenu}>
        <Text style={styles.toggleIcon}>{isOpen ? "✕" : "☰"}</Text>
      </TouchableOpacity>

      {/* Menú lateral animado */}
      <AnimatedView
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {menuOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              console.log(`Ir a ${option}`);
              toggleMenu();
            }}
          >
            <Text style={styles.menuText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </AnimatedView>

      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {isOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleMenu}
          activeOpacity={1}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    position: "absolute",
    top: 110,
    left: 20,
    zIndex: 100,
    backgroundColor: "#007AFF",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleIcon: {
    color: "white",
    fontSize: 20,
  },
  sidebar: {
    position: "absolute",
    justifyContent: "space-evenly",
    borderRadius: 25,
    top: 100,
    left: 0,
    width: 250,
    height: "85%",
    backgroundColor: "white",
    zIndex: 90,
    paddingTop: 20,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 80,
  },
});
