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
      withSequence(withTiming(1.05, { duration: 3000 }), withTiming(0.95, { duration: 3000 })),
      -1,
      true
    );
    pulseAnim2.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 4000 }), withTiming(0.92, { duration: 4000 })),
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
      <StatusBar style="dark" />
      
      {/* Decorative backdrop shapes */}
      <Animated.View style={[styles.circle, styles.circle1, animatedCircle1]} />
      <Animated.View style={[styles.circle, styles.circle2, animatedCircle2]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Brand Header */}
          <Animated.View style={styles.header} entering={FadeInDown.duration(800).springify()}>
            <Text style={styles.brandTitle}>Elev<Text style={styles.brandAccent}>Connect</Text></Text>
            <Text style={styles.brandSubtitle}>Élevage intelligent & Télémédecine vétérinaire</Text>
          </Animated.View>

          {/* Hero Illustration Placeholder */}
          <Animated.View style={styles.heroSection} entering={FadeInDown.delay(200).duration(800).springify()}>
            <View style={styles.heroCard}>
              <Text style={styles.heroText}>🎯</Text>
              <Text style={styles.heroHeading}>Gérez vos exploitations n'importe où</Text>
              <Text style={styles.heroSub}>Suivi de croissance, rapports automatisés et connexion instantanée avec le vétérinaire.</Text>
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
                <Text style={[styles.roleDesc, userRole === 'breeder' && styles.roleDescActive]}>Gérez vos fermes</Text>
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
                <Text style={[styles.roleDesc, userRole === 'vet' && styles.roleDescActive]}>Soignez & diagnostiquez</Text>
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
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-evenly', // Distributes space evenly so it fits dynamically
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circle1: {
    width: width * 0.9,
    height: width * 0.9,
    backgroundColor: '#3B82F6',
    top: -100,
    right: -100,
    opacity: 0.08,
  },
  circle2: {
    width: width * 1.1,
    height: width * 1.1,
    backgroundColor: '#10B981',
    bottom: -150,
    left: -150,
    opacity: 0.1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
  },
  brandTitle: {
    fontSize: 34, // Slightly smaller
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  brandAccent: {
    color: '#10B981',
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  heroSection: {
    alignItems: 'center',
    width: '100%',
  },
  heroCard: {
    width: '100%',
    backgroundColor: '#FFFFFF', // Solid white
    borderRadius: 20,
    padding: 24, // Added a bit more padding for breathing room
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0', // Subtle solid border
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  heroText: {
    fontSize: 44, // Smaller emoji
    marginBottom: 10,
  },
  heroHeading: {
    fontSize: 19, // Smaller heading
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  roleContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
    textAlign: 'center',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12, // Reduced padding
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  roleButtonActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  roleEmoji: {
    fontSize: 28, // Smaller emoji
    marginBottom: 6,
  },
  roleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  roleTextActive: {
    color: '#059669',
  },
  roleDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  roleDescActive: {
    color: '#10B981',
  },
  actionContainer: {
    gap: 10, // Reduced gap
    paddingBottom: 10,
  },
  btnPrimary: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14, // Reduced height
    alignItems: 'center',
    width: '100%',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 14, // Reduced height
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  btnSecondaryText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '700',
  },
});
