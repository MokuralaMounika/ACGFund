import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await loginUser(email, password);
      console.log("Login Success:", res);

      // ✅ Save login values to AsyncStorage
      await AsyncStorage.setItem("token", res.BearerToken);
      await AsyncStorage.setItem("userId", res.UserId);
      await AsyncStorage.setItem("email", res.Email);

      console.log("📦 Saved token:", res.BearerToken);
      console.log("📦 Saved userId:", res.UserId);

      // Navigate to Home Tabs
      navigation.replace("Main", { user: res });

    } catch (err) {
      Alert.alert("Login Failed", err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{flex:1}} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
      >
        
        <Image
          source={require('../../assets/images/akra_logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Welcome back to your ACGFund account</Text>

        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.checkboxRow}>
            <View style={styles.checkbox} />
            <Text style={styles.remember}>Remember me</Text>
          </View>

          <TouchableOpacity>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.loginBtn} 
          onPress={handleLogin} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Sign In</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingTop: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },

  logo: {
    width: 150,
    height: 100,
    marginBottom: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 5,
    color: '#0B2E4F',
    fontFamily: 'Geist',
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'Geist',
  },

  label: {
    width: '100%',
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 5,
    fontFamily: 'Geist',
  },

  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D3D7DF',
    borderRadius: 8,
    padding: 11,
    marginBottom: 18,
    backgroundColor: '#F3F6FA',
    fontFamily: 'Geist',
  },

  passwordContainer: {
    width: '100%',
  },

  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    alignItems: 'center',
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#777',
    marginRight: 5,
    borderRadius: 3,
  },

  remember: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Geist',
  },

  forgot: {
    fontSize: 14,
    color: '#7A1E1E',
    fontFamily: 'GeistMono',
  },

  loginBtn: {
    width: '100%',
    backgroundColor: '#7A1E1E',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

  loginText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Geist',
  },
});
