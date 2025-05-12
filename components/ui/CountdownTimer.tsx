import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CountdownTimerProps {
  initialSeconds?: number;
}

export default function CountdownTimer({
  initialSeconds = 300,
}: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const intervalRef = useRef<number | null>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const stopCountdown = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSecondsLeft(0);
  };

  const startCountdown = () => {
    stopCountdown();
    setSecondsLeft(initialSeconds);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stopCountdown();
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
