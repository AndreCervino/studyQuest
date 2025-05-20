import CountdownTimer from "@/components/ui/CountdownTimer"; // Importamos nuestro componente del temporizador
import { doc, increment, updateDoc } from "firebase/firestore"; // Importamos funciones de Firestore para actualizar el documento
import React, { useState } from "react"; // Importamos useState para manejar el estado del componente
import {
  Alert,
  Button,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"; // Importamos componentes de React Native (incluyendo Modal y Pressable para los modales)
import { auth, db } from "../../firebase"; // Importamos las instancias de Firebase auth y db

// Este es el componente principal de la pantalla de inicio, que orquesta el flujo del temporizador y puntos
export default function HomeScreen() {
  // Estado para controlar si el modal de selección de duración es visible
  const [isDurationModalVisible, setDurationModalVisible] = useState(false);
  // Estado para controlar si el modal de puntos ganados es visible
  const [isPointsModalVisible, setPointsModalVisible] = useState(false);
  // Estado para guardar la duración seleccionada por el usuario en segundos.
  // null indica que no hay ninguna sesión programada/activa en este momento.
  const [selectedDurationSeconds, setSelectedDurationSeconds] = useState<
    number | null
  >(null);
  // Estado para guardar los puntos acumulados en la sesión más reciente que ha terminado (sea por completado o detenido)
  const [sessionPointsEarned, setSessionPointsEarned] = useState<number>(0);

  // Esta función es llamada por el componente CountdownTimer cuando la cuenta regresiva llega a cero
  // o cuando el usuario presiona "Detener" en el temporizador.
  const handleTimerComplete = (pointsEarned: number) => {
    console.log(
      `Sesión del temporizador terminada. Puntos acumulados reportados: ${pointsEarned}`
    );
    // Guardamos los puntos reportados por el temporizador en el estado local
    setSessionPointsEarned(pointsEarned);
    // Mostramos el modal de puntos ganados
    setPointsModalVisible(true);
    // Reseteamos la duración seleccionada. Esto hará que el componente CountdownTimer deje de renderizarse
    // y vuelva a aparecer el botón "Programar Sesión".
    setSelectedDurationSeconds(null);
    // NOTA: En este punto, los puntos AÚN NO se han guardado en Firestore.
    // Esto ocurrirá solo si el usuario presiona "Aceptar" en el modal de puntos.
  };

  // Esta función se llama cuando el usuario selecciona una opción de duración en el modal
  const handleSelectDuration = (minutes: number) => {
    const seconds = minutes * 60; // Convertimos los minutos seleccionados a segundos
    console.log(
      `Duración seleccionada: ${minutes} minutos (${seconds} segundos)`
    );
    // Actualizamos el estado con la duración seleccionada.
    // Esto hará que el componente CountdownTimer se renderice con esta duración.
    setSelectedDurationSeconds(seconds);
    // Cerramos el modal de selección de duración.
    setDurationModalVisible(false);
    // El componente CountdownTimer (gracias al useEffect que agregamos) detectará el cambio en initialSeconds,
    // reseteará su estado interno y, si lo configuraste así, comenzará automáticamente.
    // Si no configuraste el inicio automático en CountdownTimer, necesitarás un botón "Iniciar" dentro de CountdownTimer
    // que llame a su función startCountdown después de que se renderice con la nueva initialSeconds.
    // Con la implementación actual del timer y su useEffect en initialSeconds, si descomentas startCountdown() allí, iniciará automáticamente.
  };

  // Esta función se llama cuando el usuario presiona el botón "Aceptar" en el modal de puntos ganados.
  // ¡Aquí es donde finalmente interactuamos con Firestore para guardar los puntos!
  const handleAcceptPoints = async () => {
    console.log(
      `Usuario aceptó los puntos. Sumando ${sessionPointsEarned} a Firestore.`
    );

    // Verificamos que haya un usuario autenticado y que haya puntos para sumar (> 0)
    if (!auth.currentUser?.uid || sessionPointsEarned <= 0) {
      console.warn(
        "No se pueden sumar puntos: Usuario no autenticado o puntos ganados no positivos."
      );
      // Cerramos el modal y reseteamos los puntos de la sesión aunque no se hayan guardado
      setPointsModalVisible(false);
      setSessionPointsEarned(0);
      return;
    }

    const userId = auth.currentUser.uid; // Obtenemos el ID del usuario autenticado
    const userDocRef = doc(db, "users", userId); // Creamos una referencia al documento del usuario en la colección "users"

    try {
      // Usamos updateDoc para actualizar el documento.
      // increment(sessionPointsEarned) es una operación atómica que suma el valor
      // a la propiedad 'points'. Esto es seguro incluso si el usuario completa
      // múltiples sesiones rápidamente o en diferentes dispositivos.
      await updateDoc(userDocRef, {
        points: increment(sessionPointsEarned), // Suma sessionPointsEarned al campo 'points'
      });
      console.log("Puntos actualizados exitosamente en Firestore.");
      // Gracias al onSnapshot en HeaderMenu, la UI de puntos se actualizará automáticamente.
    } catch (error) {
      console.error("Error al actualizar puntos en Firestore:", error);
      Alert.alert(
        "Error",
        "No se pudieron guardar los puntos. Inténtalo de nuevo."
      );
    }

    // Cerramos el modal de puntos ganados después de intentar guardar en Firestore
    setPointsModalVisible(false);
    // Reseteamos los puntos de la sesión a 0, ya que ya han sido manejados (guardados o con error)
    setSessionPointsEarned(0);
  };

  return (
    <View style={styles.container}>
      {/* mainContainer ahora envuelve todo el contenido principal */}
      <View style={styles.mainContainer}>
        {/* Renderizado condicional: Mostrar el botón "Programar Sesión" O el CountdownTimer */}
        {/* Si selectedDurationSeconds es null, mostramos el botón de programación */}
        {!selectedDurationSeconds ? (
          <Button
            title="Programar Sesión"
            onPress={() => setDurationModalVisible(true)} // Al presionar, abrimos el modal de duración
            color="#007AFF" // Color para el botón
          />
        ) : (
          /* Si selectedDurationSeconds tiene un valor, mostramos el CountdownTimer */
          <CountdownTimer
            initialSeconds={selectedDurationSeconds} // Pasamos la duración seleccionada como prop
            // Puedes pasar otras props al timer si necesitas configurarlas (ej. pointRate, etc.)
            // pointRate={3}
            // pointQuantity={1}
            // pointProbability={0.5}
            onTimerComplete={handleTimerComplete} // Pasamos la función que se llamará al terminar el timer
          />
        )}

        {/* --- Implementación de los Modales --- */}

        {/* Modal para seleccionar la duración de la sesión */}
        <Modal
          animationType="slide" // Tipo de animación al aparecer
          transparent={true} // Fondo semi-transparente detrás del modal
          visible={isDurationModalVisible} // Controla si el modal es visible usando el estado
          onRequestClose={() => {
            // Función opcional para manejar el cierre del modal (ej. con el botón de atrás en Android)
            setDurationModalVisible(!isDurationModalVisible); // Podrías decidir si esto cancela o solo cierra
          }}
        >
          <View style={styles.centeredView}>
            {" "}
            {/* Contenedor para centrar el modal */}
            <View style={styles.modalView}>
              {" "}
              {/* El recuadro blanco del modal */}
              <Text style={styles.modalTitle}>Selecciona la duración</Text>
              {/* Opciones de duración como botones Pressable */}
              <Pressable
                style={[styles.buttonModal, styles.buttonOption]}
                onPress={() => handleSelectDuration(20)} // Llama a handleSelectDuration con 20 minutos
              >
                <Text style={styles.textStyle}>20 minutos</Text>
              </Pressable>
              <Pressable
                style={[styles.buttonModal, styles.buttonOption]}
                onPress={() => handleSelectDuration(30)} // Llama a handleSelectDuration con 30 minutos
              >
                <Text style={styles.textStyle}>30 minutos</Text>
              </Pressable>
              <Pressable
                style={[styles.buttonModal, styles.buttonOption]}
                onPress={() => handleSelectDuration(50)} // Llama a handleSelectDuration con 50 minutos
              >
                <Text style={styles.textStyle}>50 minutos</Text>
              </Pressable>
              {/* Botón para cancelar la selección */}
              <Pressable
                style={[styles.buttonModal, styles.buttonClose]}
                onPress={() => setDurationModalVisible(false)} // Simplemente cierra el modal sin seleccionar duración
              >
                <Text style={styles.textStyle}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Modal para mostrar los puntos ganados al finalizar el temporizador */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isPointsModalVisible} // Controla si el modal es visible usando el estado
          // onRequestClose={() => {
          //   // Podrías decidir si permitir cerrar este modal sin presionar Aceptar.
          //   // Según tu requerimiento, los puntos se suman SOLO al presionar Aceptar,
          //   // por lo que es mejor no permitir cerrar aquí con el botón de atrás.
          //   // setPointsModalVisible(!isPointsModalVisible);
          // }}
        >
          <View style={styles.centeredView}>
            {" "}
            {/* Contenedor para centrar el modal */}
            <View style={styles.modalView}>
              {" "}
              {/* El recuadro blanco del modal */}
              <Text style={styles.modalTitle}>¡Temporizador completado!</Text>
              {/* Muestra los puntos que se guardaron en el estado sessionPointsEarned */}
              <Text style={styles.modalText}>
                Has ganado: +{sessionPointsEarned} puntos
              </Text>
              {/* Botón "Aceptar" para confirmar y guardar los puntos */}
              <Pressable
                style={[styles.buttonModal, styles.buttonAccept]}
                onPress={handleAcceptPoints} // Llama a la función que guarda los puntos en Firestore
              >
                <Text style={styles.textStyle}>Aceptar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* --- Fin de la Implementación de los Modales --- */}
      </View>
    </View>
  );
}

// Estilos para los componentes
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    backgroundColor: "#fff", // Fondo blanco para toda la pantalla
    alignItems: "center",
    justifyContent: "flex-start", // Alineamos al inicio verticalmente para dejar espacio al HeaderMenu
    width: "100%", // Asegura que el contenedor ocupe todo el ancho
    paddingTop: 80, // Añade un padding superior para dejar espacio al HeaderMenu (ajusta según la altura de tu HeaderMenu)
  },
  mainContainer: {
    width: "90%",
    height: "90%", // Altura automática para adaptarse al contenido
    minHeight: "60%", // Mínima altura para que se vea bien
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: "#007AFF",
  },
  // Estilos para los modales
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Fondo semi-transparente oscuro
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
    // Estilo base para los botones dentro de los modales
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginVertical: 5, // Espacio vertical entre botones del modal
    width: 180, // Ancho fijo para los botones del modal
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOption: {
    // Estilo específico para los botones de opción de duración
    backgroundColor: "#2196F3", // Azul para opciones
  },
  buttonAccept: {
    // Estilo específico para el botón Aceptar puntos
    backgroundColor: "#4CAF50", // Verde para aceptar
  },
  buttonClose: {
    // Estilo específico para el botón Cancelar
    backgroundColor: "#FF6347", // Rojo/Naranja para cancelar
    marginTop: 10, // Un poco más de espacio si es un botón de cancelar/cerrar
  },
  textStyle: {
    // Estilo para el texto dentro de los botones del modal
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
