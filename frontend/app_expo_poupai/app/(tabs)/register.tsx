import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [error, setError] = useState("");

  function handleRegister() {
    if (!email || !password || !confirmPassword) {
      setError("Preencha todos os campos");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    setError("");
    router.replace("/login");
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header roxo, mesmo padrão das outras telas */}
      <View style={styles.headerBox}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Troque o caminho da imagem se necessário */}
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerTitle}>Poupai</Text>
            <Text style={styles.headerSubtitle}>Crie sua conta</Text>
          </View>
        </View>
      </View>

      {/* Card de cadastro */}
      <View style={styles.cardBox}>
        <Text style={styles.cardTitle}>Criar conta</Text>

        <Text style={styles.label}>E-mail</Text>
        <View style={styles.inputWrapper}>
          <Feather name="mail" size={18} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon]}
            placeholder="seu@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputWrapper}>
          <Feather name="lock" size={18} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon, { paddingRight: 44 }]}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass1}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass1((v) => !v)}>
            <Feather name={showPass1 ? "eye-off" : "eye"} size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirmar senha</Text>
        <View style={styles.inputWrapper}>
          <Feather name="lock" size={18} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon, { paddingRight: 44 }]}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPass2}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass2((v) => !v)}>
            <Feather name={showPass2 ? "eye-off" : "eye"} size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister} activeOpacity={0.9}>
          <Text style={styles.primaryBtnText}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")} style={{ alignSelf: "center" }}>
          <Text style={styles.linkText}>Já tem uma conta? Entrar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerBox: {
    backgroundColor: "#7B5CFA",
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 2,
  },
  headerSubtitle: {
    color: "#E0E7FF",
    fontSize: 13,
  },

  cardBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 6,
  },

  inputWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    top: 14,
  },
  inputWithIcon: {
    paddingLeft: 38,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  eyeBtn: {
    position: "absolute",
    right: 10,
    top: 8,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  primaryBtn: {
    backgroundColor: "#7B5CFA",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 10,
    shadowColor: "#7B5CFA",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  linkText: {
    color: "#7B5CFA",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 4,
  },

  errorText: {
    color: "#EF4444",
    marginBottom: 6,
    fontSize: 13,
  },
});
