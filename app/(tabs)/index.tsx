import CountdownTimer from "@/components/ui/CountdownTimer";
import { doc, increment, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  Button,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Imports de Firebase
import { db } from "../../firebase";

//  Import de HOOK useAuth
import { useAuth } from "./../contexts/AuthContext";

export default function HomeScreen() {
  // --- uso de HOOK useAuth (estado de autenticación, si es administrador y el estado de carga)---

  const { user, isAdmin, isLoading } = useAuth();

  const [isDurationModalVisible, setDurationModalVisible] = useState(false);

  const [isPointsModalVisible, setPointsModalVisible] = useState(false);

  const [selectedDurationSeconds, setSelectedDurationSeconds] = useState<
    number | null
  >(null);

  const [sessionPointsEarned, setSessionPointsEarned] = useState<number>(0);

  const handleTimerComplete = (pointsEarned: number) => {
    console.log(
      `Sesión del temporizador terminada. Puntos acumulados reportados: ${pointsEarned}`
    );
    setSessionPointsEarned(pointsEarned);
    setPointsModalVisible(true);
    setSelectedDurationSeconds(null); // reset para sacar button de programar sesion
  };

  // funcionalidade de modal de programar sesion
  const handleSelectDuration = (minutes: number) => {
    const seconds = minutes * 60;
    console.log(
      `Duración seleccionada: ${minutes} minutos (${seconds} segundos)`
    );
    setSelectedDurationSeconds(seconds); //setea duracion timer
    setDurationModalVisible(false);
  };

  // funcion para recibir puntos con boton Aceptar
  const handleAcceptPoints = async () => {
    console.log(
      `Usuario aceptó los puntos. Sumando ${sessionPointsEarned} a Firestore.`
    );

    // verifica login + puntos a sumar

    if (!user?.uid || sessionPointsEarned <= 0) {
      console.warn(
        "No se pueden sumar puntos: Usuario no autenticado o puntos ganados no positivos."
      );
      setPointsModalVisible(false);
      setSessionPointsEarned(0);
      return;
    }

    const userId = user.uid; // usa user.uid de hook useAuth
    const userDocRef = doc(db, "users", userId);

    try {
      await updateDoc(userDocRef, {
        points: increment(sessionPointsEarned),
      });
      console.log("Puntos actualizados exitosamente en Firestore.");
    } catch (error) {
      console.error("Error al actualizar puntos en Firestore:", error);
      Alert.alert(
        "Error",
        "No se pudieron guardar los puntos. Inténtalo de nuevo."
      );
    }

    setPointsModalVisible(false);
    setSessionPointsEarned(0);
  };

  // ------ carga inicial ---

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando sesión...</Text>
      </View>
    );
  }
  // --- carga inicial(END) ----

  return (
    <View style={styles.container}>
      {/* -------------------logica mensaxe admin----------- */}
      {isAdmin && (
        <Text style={styles.adminMessage}>
          🎉 ¡Bienvenido administrador! 🎉
        </Text>
      )}
      <View style={styles.mainContainer}>
        {/* mostrar el botón "Programar sesion" OR timer */}
        {!selectedDurationSeconds ? (
          <Button
            title="Programar Sesión"
            onPress={() => setDurationModalVisible(true)}
            color="#007AFF"
          />
        ) : (
          <CountdownTimer
            initialSeconds={selectedDurationSeconds}
            onTimerComplete={handleTimerComplete}
          />
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={isDurationModalVisible}
          onRequestClose={() => {
            setDurationModalVisible(!isDurationModalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Selecciona la duración</Text>
              <Pressable
                style={[styles.buttonModal, styles.buttonOption]}
                onPress={() => handleSelectDuration(20)}
              >
                <Text style={styles.textStyle}>20 minutos</Text>
              </Pressable>
              <Pressable
                style={[styles.buttonModal, styles.buttonOption]}
                onPress={() => handleSelectDuration(30)}
              >
                <Text style={styles.textStyle}>30 minutos</Text>
              </Pressable>
              <Pressable
                style={[styles.buttonModal, styles.buttonOption]}
                onPress={() => handleSelectDuration(50)}
              >
                <Text style={styles.textStyle}>50 minutos</Text>
              </Pressable>
              <Pressable
                style={[styles.buttonModal, styles.buttonClose]}
                onPress={() => setDurationModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cancelar</Text>
              </Pressable>
            </View>
          </View>

          {/* -------------------MODALS---------------------- */}
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isPointsModalVisible}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>¡Temporizador completado!</Text>
              <Text style={styles.modalText}>
                Has ganado: +{sessionPointsEarned} puntos
              </Text>
              <Pressable
                style={[styles.buttonModal, styles.buttonAccept]}
                onPress={handleAcceptPoints}
              >
                <Text style={styles.textStyle}>Aceptar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        {/* -------------------MODALS (END)---------------------- */}
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
    justifyContent: "flex-start",
    width: "100%",
    paddingTop: 80,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  mainContainer: {
    width: "90%",
    height: "auto",
    minHeight: "60%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: "#007AFF",
  },

  adminMessage: {
    marginTop: 0,
    marginBottom: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#28a745",
    textAlign: "center",
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
  },
  buttonModal: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginVertical: 5,
    width: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOption: {
    backgroundColor: "#2196F3",
  },
  buttonAccept: {
    backgroundColor: "#4CAF50",
  },
  buttonClose: {
    backgroundColor: "#FF6347",
    marginTop: 10,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
