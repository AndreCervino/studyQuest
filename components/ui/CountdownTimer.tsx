import {} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Eliminamos las importaciones de auth y db
// import { auth, db } from "../../firebase";

interface CountdownTimerProps {
  // initialSeconds es ahora obligatorio, siempre se lo pasaremos desde el padre
  initialSeconds: number;
  pointRate?: number; // Frecuencia en segundos para intentar dar puntos
  pointQuantity?: number; // Cantidad de puntos a dar cada vez
  pointProbability?: number; // Probabilidad de dar puntos en un intervalo dado
  // onTimerComplete ahora notifica al padre cuántos puntos se acumularon en la sesión
  onTimerComplete?: (totalPoints: number) => void;
  // Opcional: añadir una prop para notificar al padre si el temporizador está corriendo o detenido
  // onTimerStateChange?: (isRunning: boolean) => void;
}

export default function CountdownTimer({
  initialSeconds, // No hay valor por defecto, el padre lo proporciona
  pointRate = 3,
  pointQuantity = 1,
  pointProbability = 0.5,
  onTimerComplete,
}: // onTimerStateChange,
CountdownTimerProps) {
  // secondsLeft se inicializa con initialSeconds y se actualiza por el timer
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  // pendingPoints acumula los puntos durante la sesión actual
  const [pendingPoints, setPendingPoints] = useState(0);
  // Ref para mantener la ID del intervalo del timer
  const intervalRef = useRef<number | null>(null);
  // Ref para registrar el tiempo transcurrido cuando se dieron puntos por última vez
  const lastPointTimeRef = useRef<number>(0);
  // Estado para controlar si el temporizador está activo
  const [isRunning, setIsRunning] = useState(false);

  // --- Se eliminó la función addPoints y toda interacción con Firestore ---

  // Intenta dar puntos basado en el tiempo transcurrido de la sesión
  const tryGivePoints = (elapsedTime: number) => {
    // Aseguramos que elapsedTime sea un número entero para la operación de módulo
    const currentElapsed = Math.floor(elapsedTime);

    if (
      currentElapsed > 0 && // No dar puntos al inicio (tiempo transcurrido es 0)
      currentElapsed % pointRate === 0 && // Chequea si el tiempo transcurrido es múltiplo de pointRate
      currentElapsed !== lastPointTimeRef.current && // Asegura que no se den puntos múltiples veces en el mismo segundo
      Math.random() < pointProbability // Chequea la probabilidad
    ) {
      setPendingPoints((prev) => prev + pointQuantity);
      lastPointTimeRef.current = currentElapsed; // Registra el tiempo transcurrido en el que se dieron puntos
    }
  };

  // Formatea segundos a formato MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Inicia la cuenta regresiva
  const startCountdown = () => {
    stopCountdown(); // Detiene cualquier intervalo anterior

    // El estado (secondsLeft, pendingPoints, lastPointTimeRef)
    // se reinicia al cambiar initialSeconds en el useEffect de abajo.
    // Aquí solo iniciamos el timer.

    setIsRunning(true);
    // onTimerStateChange?.(true); // Notifica al padre

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const newTime = prev - 1;
        // Calcula el tiempo transcurrido desde el inicio de la duración total
        const elapsedTime = initialSeconds - newTime;

        if (newTime > 0) {
          tryGivePoints(elapsedTime); // Chequea si dar puntos basado en tiempo transcurrido
          return newTime;
        } else {
          // El temporizador llegó a cero
          endSession(); // Llama a la lógica de fin de sesión
          return 0; // El tiempo ha terminado
        }
      });
    }, 1000) as unknown as number; // Especificamos el tipo para setInterval en TypeScript
  };

  // Detiene la cuenta regresiva
  const stopCountdown = () => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
      // onTimerStateChange?.(false); // Notifica al padre
    }
  };

  // Maneja el fin de la sesión del temporizador (ya sea por completado o detenido manualmente)
  const endSession = () => {
    stopCountdown(); // Asegura que el intervalo se detenga
    // Llama a la función onTimerComplete del padre, pasando los puntos acumulados.
    // Es responsabilidad del padre decidir qué hacer con estos puntos (ej. mostrar modal, guardar en Firestore).
    onTimerComplete?.(pendingPoints);
    // No guardamos en Firestore aquí.
    // Opcional: resetear los puntos acumulados si no quieres que se muestren después de terminar
    // setPendingPoints(0);
  };

  // Este useEffect se dispara cada vez que la prop initialSeconds cambia.
  // Esto ocurre cuando el usuario selecciona una nueva duración en el modal del padre.
  useEffect(() => {
    // Reinicia el estado del temporizador con la nueva duración
    setSecondsLeft(initialSeconds);
    setPendingPoints(0); // Reinicia los puntos para la nueva sesión
    lastPointTimeRef.current = 0; // Reinicia el registro del último punto
    stopCountdown(); // Asegura que cualquier timer anterior se detenga

    // Decide aquí si el temporizador debe empezar automáticamente al seleccionar la duración,
    // o si el usuario debe presionar "Iniciar" después de seleccionar.
    // Si quieres que empiece automáticamente:
    // startCountdown(); // <--- Descomenta si quieres inicio automático al seleccionar duración

    // Función de limpieza: se ejecuta cuando el componente se desmonta O
    // cuando initialSeconds cambia antes de que el efecto se vuelva a ejecutar.
    return () => {
      // La limpieza solo detiene el intervalo, NO guarda puntos
      stopCountdown();
    };
  }, [initialSeconds]); // Dependencia: el efecto se ejecuta si initialSeconds cambia

  // Un useEffect adicional para el montaje inicial si initialSeconds
  // ya viene con un valor en el primer render y quieres auto-iniciar.
  // Si siempre pasas initialSeconds y auto-inicias en el useEffect de arriba,
  // este no sería estrictamente necesario.
  useEffect(() => {
    // Si quieres auto-iniciar solo la primera vez que el componente se monta con una duración
    // if (initialSeconds > 0 && !intervalRef.current) {
    //    startCountdown();
    // }
  }, []); // Se ejecuta solo en el montaje inicial

  // Maneja el toque en el botón "Iniciar" / "Detener"
  const toggleCountdown = () => {
    if (intervalRef.current !== null) {
      // Si está corriendo, al tocar "Detener" se finaliza la sesión
      // esto llamará a endSession, que a su vez llama a onTimerComplete
      endSession();
    } else {
      // Si no está corriendo, al tocar "Iniciar" se comienza la cuenta regresiva
      startCountdown();
    }
  };

  return (
    <View style={styles.container}>
      {/* Podrías añadir lógica para ocultar el timer si secondsLeft es 0 y no está corriendo */}
      {/* o mostrar un mensaje de "Sesión completada" */}
      {/* Por ahora, mostramos el último estado */}
      <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
      <Text style={styles.pointsText}>Puntos acumulados: {pendingPoints}</Text>
      {/* Mostramos el botón si una duración ha sido establecida (controlado por el padre) */}
      <TouchableOpacity style={styles.button} onPress={toggleCountdown}>
        <Text style={styles.buttonText}>
          {isRunning
            ? "Detener"
            : secondsLeft === initialSeconds && secondsLeft > 0
            ? "Iniciar"
            : "Iniciar"}
          {/* Puedes refinar el texto del botón si secondsLeft es 0 (ej. "Nueva sesión") */}
          {/* {isRunning ? "Detener" : "Iniciar"} */}
        </Text>
      </TouchableOpacity>
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
    // Asegura que ocupe el ancho disponible si es necesario
  },
  timerText: {
    fontSize: 72,
    fontWeight: "bold",
    // fontFamily: "monospace", // Asegúrate de que esta fuente esté disponible
    marginBottom: 20,
    color: "#333",
  },
  pointsText: {
    fontSize: 18,
    color: "#28a745", // Verde para puntos
    marginBottom: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#007AFF", // Azul
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
    minWidth: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },
});
