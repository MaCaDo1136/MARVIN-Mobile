import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { sendMessage } from "./api";

type Msg = { role: "user" | "assistant"; content: string };

export default function App() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const reply = await sendMessage(text);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "No pude conectar con Marvin." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Marvin</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, loading && styles.dotBusy]} />
            <Text style={styles.statusText}>{loading ? "pensando" : "listo"}</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          {messages.map((m, i) => (
            <BlurView
              key={i}
              intensity={40}
              tint="dark"
              style={[
                styles.bubble,
                m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant,
              ]}
            >
              <Text style={styles.bubbleText}>{m.content}</Text>
            </BlurView>
          ))}
        </ScrollView>

        <BlurView intensity={50} tint="dark" style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe algo..."
            placeholderTextColor="#6b7078"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={loading}
          >
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </BlurView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#12131a" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  title: { color: "#F2F3F5", fontSize: 17, fontWeight: "600" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7AA2FF",
  },
  dotBusy: { opacity: 0.5 },
  statusText: { color: "#9AA0AC", fontSize: 11 },
  messages: { flex: 1, paddingHorizontal: 14 },
  bubble: {
    maxWidth: "78%",
    padding: 11,
    borderRadius: 14,
    marginVertical: 4,
    overflow: "hidden",
  },
  bubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(122,162,255,0.22)",
    borderColor: "rgba(122,162,255,0.45)",
    borderWidth: 1,
  },
  bubbleAssistant: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
  },
  bubbleText: { color: "#F2F3F5", fontSize: 14, lineHeight: 20 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    marginBottom: 24,
    padding: 8,
    borderRadius: 20,
    overflow: "hidden",
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
  },
  input: {
    flex: 1,
    color: "#F2F3F5",
    fontSize: 14,
    paddingHorizontal: 10,
    maxHeight: 100,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#7AA2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: "#12131a", fontSize: 14 },
});
