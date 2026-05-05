import { useState } from "react";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { View, Text, TextInput, StyleSheet, Pressable, TouchableOpacity } from "react-native";

import colors from "@/constants/colors";
import Loader from "@/components/Loader";
import Button from "@/components/Button";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError("Email tidak boleh kosong");
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      setEmailError("Format email tidak valid");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (value: string) => {
    if (!value.trim()) {
      setPasswordError("Password tidak boleh kosong");
    } else {
      setPasswordError("");
    }
  };

  const isFormValid = email.trim() !== "" && password.trim() !== "" && emailError === "" && passwordError === "";
  const handleLogin = (provider: string) => {
    validateEmail(email);
    validatePassword(password);

    if (!isFormValid) return;

    setLoading(true);
    console.log(`Memicu login dengan ${provider}`);
    // Di sini nantinya Anda akan memasukkan logika Expo Auth Session
    // Untuk saat ini, kita fokus pada UI
    setTimeout(() => setLoading(false), 5000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Login with Password</Text>

        <View style={{ gap: 8, marginBottom: 20 }}>
          <View style={[
            styles.inputContainer,
            emailError ? styles.inputError : null
          ]}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={emailError ? "#f87171" : colors.textDark}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textDark}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) validateEmail(text);
              }}
              onBlur={() => validateEmail(email)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
        </View>
        <View style={{ gap: 8, marginBottom: 20 }}>
          <View style={[
            styles.inputContainer,
            passwordError ? styles.inputError : null
          ]}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={passwordError ? "#f87171" : colors.textDark}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textDark}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) validatePassword(text);
              }}
              onBlur={() => validatePassword(password)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={colors.textDark}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
        </View>

        <View style={styles.btnContent}>
          <Button
            onPress={() => handleLogin("Google")}
            button={styles.loginButton}
          >
            <Ionicons name="logo-google" size={30} color="black" />
          </Button>
          <Button
            onPress={() => handleLogin("Github")}
            button={styles.loginButton}
          >
            <FontAwesome name="github" size={30} color="black" />
          </Button>
          <Button
            title="Login"
            onPress={() => handleLogin("Email & Password")}
            button={[styles.loginButton2, !isFormValid && { opacity: 0.5 }]}
            text={styles.loginButtonText}
        />
        </View>
        <Loader visible={loading} />
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLink}>
          <Pressable>
            <Text style={styles.footerText}>Provision</Text>
          </Pressable>
          <Pressable>
            <Text style={styles.footerText}>Contact Us</Text>
          </Pressable>
          <Pressable>
            <Text style={styles.footerText}>About Us</Text>
          </Pressable>
        </View>
        <Text style={styles.copyright}>Copyright ©2026 PhiNime All rights Reserved</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    padding: 10
  },
  content: {
    overflow: "hidden",
    position: "relative",
    width: "100%"
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginBottom: 30
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    gap: 10,
    height: 52
  },
  inputError: {
    borderColor: "#f87171",
    backgroundColor: "rgba(248,113,113,0.05)"
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    marginLeft: 4
  },
  btnContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center"
  },
  loginButton: {
    marginRight: 10,
    paddingHorizontal: 10,
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center"
  },
  loginButton2: {
    width: 232,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center"
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000"
  },
  footer: {
    marginTop: 170,
    alignItems: "center"
  },
  footerLink: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 18,
    gap: 18
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "500"
  },
  copyright: {
    color: "#8a8a93",
    fontSize: 13,
    textAlign: "center"
  }
});