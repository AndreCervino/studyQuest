import { doc, increment, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebase";

interface CountdownTimerProps {
  initialSeconds?: number;
  onTimerComplete?: () => void;
}

export default function CountdownTimer({
  initialSeconds = 300,
  onTimerComplete,
}: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const intervalRef = useRef<number | null>(null);

  const addPoints = async (pointsToAdd: number) => {
    if (!auth.currentUser?.uid) return;

    const userDocRef = doc(db, "users", auth.currentUser.uid);
    try {
      await updateDoc(userDocRef, {
        points: increment(pointsToAdd),
      });
    } catch (error) {
      console.error("Error updating points:", error);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const stopCountdown = () => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startCountdown = () => {
    stopCountdown();
    setSecondsLeft(initialSeconds);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stopCountdown();
          addPoints(10);
          onTimerComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000) as unknown as number;
  };

  const toggleCountdown = () => {
    if (intervalRef.current !== null) {
      stopCountdown();
    } else {
      startCountdown();
    }
  };

  useEffect(() => {
    return () => stopCountdown();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
      <TouchableOpacity style={styles.button} onPress={toggleCountdown}>
        <Text style={styles.buttonText}>
          {intervalRef.current !== null ? "Detener" : "Iniciar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    fontSize: 72,
    fontWeight: "bold",
    fontFamily: "monospace",
    marginBottom: 40,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
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
