import { Redirect, router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import type { AuthFormMode } from '@/types/auth';

export default function LoginScreen() {
  const { isLoading: authLoading, login, register, user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const [mode, setMode] = useState<AuthFormMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && user) {
    return <Redirect href="/" />;
  }

  const isRegister = mode === 'register';

  const scrollToFormBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 180);
  };

  const submit = async () => {
    setError(null);

    if (!email.trim() || !password.trim() || (isRegister && !name.trim())) {
      setError('Veuillez remplir tous les champs requis.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres.');
      return;
    }

    setSubmitting(true);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }

      router.replace('/');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible de traiter l'authentification.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        keyboardVerticalOffset={Platform.select({ ios: 24, android: 0, default: 0 })}
        style={styles.keyboard}>
        <ScrollView
          ref={scrollViewRef}
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.content}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <Text style={styles.eyebrow}>Station IoT Meteo</Text>
            <Text style={styles.title}>{isRegister ? 'Creer un compte' : 'Connexion'}</Text>

            <View style={styles.form}>
              {isRegister ? (
                <TextInput
                  autoCapitalize="words"
                  onChangeText={setName}
                  placeholder="Nom"
                  placeholderTextColor="#82979b"
                  style={styles.input}
                  value={name}
                />
              ) : null}
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                onFocus={scrollToFormBottom}
                placeholder="Email"
                placeholderTextColor="#82979b"
                style={styles.input}
                value={email}
              />
              <TextInput
                onChangeText={setPassword}
                onFocus={scrollToFormBottom}
                placeholder="Mot de passe"
                placeholderTextColor="#82979b"
                secureTextEntry
                style={styles.input}
                value={password}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                disabled={submitting || authLoading}
                onPress={submit}
                style={({ pressed }) => [
                  styles.primaryButton,
                  (pressed || submitting || authLoading) && styles.primaryButtonPressed,
                ]}>
                {submitting || authLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {isRegister ? 'Creer le compte' : 'Se connecter'}
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => {
                  setError(null);
                  setMode(isRegister ? 'login' : 'register');
                }}
                style={styles.switchButton}>
                <Text style={styles.switchButtonText}>
                  {isRegister ? 'J ai deja un compte' : 'Creer un nouveau compte'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#eef5f4',
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 72,
    paddingTop: 24,
  },
  container: {
    width: '100%',
  },
  eyebrow: {
    color: '#1b7f7a',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#17343a',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
    marginTop: 10,
  },
  subtitle: {
    color: '#526b70',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginTop: 28,
    padding: 18,
    shadowColor: '#0b2f35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  input: {
    backgroundColor: '#f4f8f8',
    borderColor: '#d7e3e6',
    borderRadius: 8,
    borderWidth: 1,
    color: '#17343a',
    fontSize: 16,
    fontWeight: '700',
    minHeight: 52,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  error: {
    color: '#9a3f19',
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1b7f7a',
    borderRadius: 8,
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.76,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 14,
    padding: 8,
  },
  switchButtonText: {
    color: '#1b7f7a',
    fontSize: 15,
    fontWeight: '800',
  },
});
