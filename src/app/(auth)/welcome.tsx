import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  FadeInDown
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { userRole, setUserRole } = useApp();

  const pulseAnim = useSharedValue(1);
  const pulseAnim2 = useSharedValue(1);

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 2000 }), withTiming(0.95, { duration: 2000 })),
      -1,
      true
    );
    pulseAnim2.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 3000 }), withTiming(0.9, { duration: 3000 })),
      -1,
      true
    );
  }, []);

  const animatedCircle1 = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }]
  }));
  const animatedCircle2 = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim2.value }]
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Decorative backdrop shapes */}
      <Animated.View style={[styles.circle, styles.circle1, animatedCircle1]} />
      <Animated.View style={[styles.circle, styles.circle2, animatedCircle2]} />

      <SafeAreaView style={styles.safeArea}>
        {/* Brand Header */}
        <Animated.View style={styles.header} entering={FadeInDown.duration(800).springify()}>
          <Text style={styles.brandTitle}>Elev<Text style={styles.brandAccent}>Connect</Text></Text>
          <Text style={styles.brandSubtitle}>Élevage intelligent & Télémédecine vétérinaire</Text>
        </Animated.View>

        {/* Hero Illustration Placeholder (Styled shapes) */}
        <Animated.View style={styles.heroSection} entering={FadeInDown.delay(200).duration(800).springify()}>
          <View style={styles.heroCard}>
            <Text style={styles.heroText}>🎯</Text>
            <Text style={styles.heroHeading}>Gérez vos exploitations n'importe où</Text>
            <Text style={styles.heroSub}>Suivi de croissance, rapports de santé automatisés et connexion instantanée avec votre vétérinaire.</Text>
          </View>
        </Animated.View>

        {/* Role Selection */}
        <Animated.View style={styles.roleContainer} entering={FadeInDown.delay(400).duration(800).springify()}>
          <Text style={styles.sectionTitle}>Choisissez votre profil :</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity 
              style={[
                styles.roleButton, 
                userRole === 'breeder' && styles.roleButtonActive
              ]}
              onPress={() => setUserRole('breeder')}
              activeOpacity={0.8}
            >
              <Text style={styles.roleEmoji}>🚜</Text>
              <Text style={[styles.roleText, userRole === 'breeder' && styles.roleTextActive]}>Éleveur</Text>
              <Text style={styles.roleDesc}>Gérez vos fermes & bêtes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.roleButton, 
                userRole === 'vet' && styles.roleButtonActive
              ]}
              onPress={() => setUserRole('vet')}
              activeOpacity={0.8}
            >
              <Text style={styles.roleEmoji}>🩺</Text>
              <Text style={[styles.roleText, userRole === 'vet' && styles.roleTextActive]}>Vétérinaire</Text>
              <Text style={styles.roleDesc}>Soignez & diagnostiquez</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bottom Actions */}
        <Animated.View style={styles.actionContainer} entering={FadeInDown.delay(600).duration(800).springify()}>
          <TouchableOpacity 
            style={styles.btnPrimary} 
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.9}
          >
            <Text style={styles.btnPrimaryText}>Commencer</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnSecondary} 
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.9}
          >
            <Text style={styles.btnSecondaryText}>Créer un compte</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circle1: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: '#1E3A8A', // Blue 900
    top: -100,
    right: -100,
    opacity: 0.4,
  },
  circle2: {
    width: width * 0.9,
    height: width * 0.9,
    backgroundColor: '#064E3B', // Green 900
    bottom: -150,
    left: -150,
    opacity: 0.5,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  brandAccent: {
    color: '#10B981', // Emerald 500
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#94A3B8', // Slate 400
    marginTop: 6,
    textAlign: 'center',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  heroCard: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.7)', // Slate 800 glassmorphism
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroText: {
    fontSize: 50,
    marginBottom: 16,
  },
  heroHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  roleContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  roleButtonActive: {
    borderColor: '#10B981',
    backgroundColor: '#0F172A',
  },
  roleEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
  },
  roleTextActive: {
    color: '#10B981',
  },
  roleDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  actionContainer: {
    gap: 12,
    marginBottom: 20,
  },
  btnPrimary: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  btnSecondaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
