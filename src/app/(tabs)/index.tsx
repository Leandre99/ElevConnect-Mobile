import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useApp } from '@/context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const { userRole, setUserRole, farms, animals, tasks, alerts, invoices, toggleTask } = useApp();

  // Compute Stats for Breeder
  const totalAnimals = animals.reduce((acc, curr) => acc + curr.nombre, 0);
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const activeAlerts = alerts.filter(a => a.status === 'Non traitée');

  // Compute Stats for Vet
  const vetAlertsToTreat = alerts.filter(a => a.status === 'Non traitée');
  const vetUnpaidInvoices = invoices.filter(i => i.status === 'unpaid');

  // Today's Date representation
  const todayStr = '10 Juin 2026';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top Header & Role Switcher */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>{todayStr}</Text>
            <Text style={styles.headerTitle}>
              {userRole === 'breeder' ? 'Bonjour, Jean 👋' : 'Bonjour, Dr. Diallo 🩺'}
            </Text>
          </View>
          
          {/* Interactive Role Switcher Pill */}
          <View style={styles.roleSwitcher}>
            <TouchableOpacity 
              style={[styles.rolePill, userRole === 'breeder' && styles.rolePillActive]}
              onPress={() => setUserRole('breeder')}
            >
              <Text style={[styles.rolePillText, userRole === 'breeder' && styles.rolePillTextActive]}>Éleveur</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.rolePill, userRole === 'vet' && styles.rolePillActive]}
              onPress={() => setUserRole('vet')}
            >
              <Text style={[styles.rolePillText, userRole === 'vet' && styles.rolePillTextActive]}>Véto</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {userRole === 'breeder' ? (
            /* ================= BREEDER DASHBOARD ================= */
            <View style={styles.dashboardView}>
              {/* Stat Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Ionicons name="business" size={20} color="#10B981" />
                  </View>
                  <Text style={styles.statValue}>{farms.length}</Text>
                  <Text style={styles.statLabel}>Fermes</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Ionicons name="logo-octocat" size={20} color="#3B82F6" />
                  </View>
                  <Text style={styles.statValue}>{totalAnimals}</Text>
                  <Text style={styles.statLabel}>Bêtes</Text>
                </View>

                <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/tasks')}>
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <Ionicons name="checkbox" size={20} color="#F59E0B" />
                  </View>
                  <Text style={styles.statValue}>{pendingTasks.length}</Text>
                  <Text style={styles.statLabel}>Tâches</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/alerts')}>
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                    <Ionicons name="warning" size={20} color="#EF4444" />
                  </View>
                  <Text style={styles.statValue}>{activeAlerts.length}</Text>
                  <Text style={styles.statLabel}>Alertes</Text>
                </TouchableOpacity>
              </View>

              {/* Farms Section */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Vos Exploitations</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/farms')}>
                  <Text style={styles.seeAllLink}>Gérer</Text>
                </TouchableOpacity>
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.farmsCarousel}
                snapToInterval={width * 0.76 + 16}
                decelerationRate="fast"
              >
                {farms.map(farm => {
                  const farmAnimals = animals.filter(a => a.ferme_id === farm.id);
                  const animalCount = farmAnimals.reduce((acc, curr) => acc + curr.nombre, 0);

                  return (
                    <TouchableOpacity 
                      key={farm.id}
                      style={styles.farmCarouselCard}
                      activeOpacity={0.9}
                      onPress={() => router.push({ pathname: '/(tabs)/farms', params: { activeFarmId: farm.id } })}
                    >
                      <View style={styles.farmCardTop}>
                        <Text style={styles.farmCardName}>{farm.nomferme}</Text>
                        <View style={[styles.badge, farm.is_active ? styles.badgeActive : styles.badgeInactive]}>
                          <Text style={styles.badgeText}>{farm.is_active ? 'Actif' : 'Inactif'}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.farmCardDesc} numberOfLines={2}>{farm.description}</Text>
                      
                      <View style={styles.farmCardBottom}>
                        <View style={styles.farmMeta}>
                          <Ionicons name="location-outline" size={14} color="#94A3B8" />
                          <Text style={styles.farmMetaText} numberOfLines={1}>{farm.adresse}</Text>
                        </View>
                        <View style={styles.farmMeta}>
                          <Ionicons name="paw-outline" size={14} color="#10B981" />
                          <Text style={[styles.farmMetaText, { color: '#10B981', fontWeight: 'bold' }]}>
                            {animalCount} bêtes
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Today's Tasks Summary */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tâches d'aujourd'hui</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
                  <Text style={styles.seeAllLink}>Calendrier</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tasksContainer}>
                {tasks.slice(0, 3).map(task => (
                  <View key={task.id} style={styles.taskItem}>
                    <TouchableOpacity 
                      style={[styles.taskCheckbox, task.status === 'completed' && styles.taskCheckboxChecked]}
                      onPress={() => toggleTask(task.id)}
                    >
                      {task.status === 'completed' && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskName, task.status === 'completed' && styles.taskCompletedText]}>
                        {task.nomtache}
                      </Text>
                      <Text style={styles.taskMeta}>
                        {task.espece} • {task.race} • Qte: {task.quantite}
                      </Text>
                    </View>
                    <View style={[
                      styles.taskTypeBadge,
                      task.type === 'alimentation' && { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
                      task.type === 'vaccin' && { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
                      task.type === 'soin' && { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
                      task.type === 'controle' && { backgroundColor: 'rgba(148, 163, 184, 0.15)' },
                    ]}>
                      <Text style={[
                        styles.taskTypeText,
                        task.type === 'alimentation' && { color: '#3B82F6' },
                        task.type === 'vaccin' && { color: '#F59E0B' },
                        task.type === 'soin' && { color: '#10B981' },
                        task.type === 'controle' && { color: '#94A3B8' },
                      ]}>
                        {task.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            /* ================= VETERINARIAN DASHBOARD ================= */
            <View style={styles.dashboardView}>
              {/* Stat Grid */}
              <View style={styles.statsGrid}>
                <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/alerts')}>
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                    <Ionicons name="warning" size={20} color="#EF4444" />
                  </View>
                  <Text style={styles.statValue}>{vetAlertsToTreat.length}</Text>
                  <Text style={styles.statLabel}>Urgences</Text>
                </TouchableOpacity>

                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                    <Ionicons name="videocam" size={20} color="#8B5CF6" />
                  </View>
                  <Text style={styles.statValue}>1</Text>
                  <Text style={styles.statLabel}>Visios</Text>
                </View>

                <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/profile')}>
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <Ionicons name="cash" size={20} color="#F59E0B" />
                  </View>
                  <Text style={styles.statValue}>{vetUnpaidInvoices.length}</Text>
                  <Text style={styles.statLabel}>Impayés</Text>
                </TouchableOpacity>

                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Ionicons name="medical" size={20} color="#10B981" />
                  </View>
                  <Text style={styles.statValue}>
                    {alerts.filter(a => a.status === 'Traitée').length}
                  </Text>
                  <Text style={styles.statLabel}>Traités</Text>
                </View>
              </View>

              {/* Urgences Section */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Alertes Éleveurs en Attente</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/alerts')}>
                  <Text style={styles.seeAllLink}>Tout voir</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.urgenciesContainer}>
                {vetAlertsToTreat.length > 0 ? (
                  vetAlertsToTreat.map(alert => (
                    <TouchableOpacity 
                      key={alert.id}
                      style={styles.urgencyCard}
                      onPress={() => router.push('/(tabs)/alerts')}
                    >
                      <View style={styles.urgencyCardTop}>
                        <View style={styles.urgencyInfo}>
                          <Text style={styles.urgencySubject}>Maladie / Symptômes suspects</Text>
                          <Text style={styles.urgencyMeta}>{alert.espece} • {alert.race}</Text>
                        </View>
                        <View style={[
                          styles.priorityBadge, 
                          alert.priority === 'high' && styles.priorityHigh,
                          alert.priority === 'medium' && styles.priorityMedium,
                          alert.priority === 'low' && styles.priorityLow,
                        ]}>
                          <Text style={styles.priorityText}>{alert.priority.toUpperCase()}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.urgencyDescription} numberOfLines={2}>
                        {alert.description}
                      </Text>
                      
                      <View style={styles.urgencyCardBottom}>
                        <Text style={styles.urgencyDate}>Reçu le {alert.date}</Text>
                        <Text style={styles.urgencyActionText}>Intervenir →</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Aucune alerte en attente. Bon travail ! 🎉</Text>
                  </View>
                )}
              </View>

              {/* Consultation / Video Call Quick Banner */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Consultation Vidéo Programmée</Text>
              </View>
              
              <View style={styles.visioBanner}>
                <View style={styles.visioIconContainer}>
                  <Ionicons name="videocam" size={28} color="#8B5CF6" />
                </View>
                <View style={styles.visioInfo}>
                  <Text style={styles.visioTitle}>Aujourd'hui à 16:30</Text>
                  <Text style={styles.visioSubtitle}>Léthargie - Ferme GreenValley (Poulets)</Text>
                </View>
                <TouchableOpacity 
                  style={styles.visioJoinBtn}
                  onPress={() => router.push('/(tabs)/alerts')}
                >
                  <Text style={styles.visioJoinBtnText}>Rejoindre</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  roleSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rolePillActive: {
    backgroundColor: '#10B981',
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  rolePillTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  dashboardView: {
    gap: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 48 - 12) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  farmsCarousel: {
    gap: 16,
    paddingBottom: 10,
  },
  farmCarouselCard: {
    width: width * 0.76,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  farmCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  farmCardName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  badgeInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  farmCardDesc: {
    fontSize: 13,
    color: '#475569',
    marginTop: 10,
    lineHeight: 18,
  },
  farmCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  farmMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  farmMetaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  tasksContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskCheckboxChecked: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  taskInfo: {
    flex: 1,
    gap: 2,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  taskCompletedText: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  taskTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  taskTypeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  urgenciesContainer: {
    gap: 12,
  },
  urgencyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  urgencyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  urgencyInfo: {
    gap: 2,
  },
  urgencySubject: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  urgencyMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  priorityMedium: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  priorityLow: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EF4444',
  },
  urgencyDescription: {
    fontSize: 13,
    color: '#475569',
    marginTop: 10,
    lineHeight: 18,
  },
  urgencyCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  urgencyDate: {
    fontSize: 11,
    color: '#64748B',
  },
  urgencyActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  visioBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  visioIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visioInfo: {
    flex: 1,
    gap: 2,
  },
  visioTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  visioSubtitle: {
    fontSize: 12,
    color: '#475569',
  },
  visioJoinBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  visioJoinBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
});
