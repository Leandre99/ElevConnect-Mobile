import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useApp } from '@/context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const { userRole, setUserRole, farms, animals, tasks, alerts, invoices, toggleTask } = useApp();

  // Breeder Active Tab State
  const [breederActiveTab, setBreederActiveTab] = useState<'farms' | 'animals' | 'tasks' | 'alerts'>('farms');

  // Vet Active Tab State
  const [vetActiveTab, setVetActiveTab] = useState<'urgencies' | 'visios' | 'unpaid' | 'treated'>('urgencies');

  // Compute Stats for Breeder
  const totalAnimals = animals.reduce((acc, curr) => acc + curr.nombre, 0);
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const activeAlerts = alerts.filter(a => a.status === 'Non traitée');

  // Compute Stats for Vet
  const vetAlertsToTreat = alerts.filter(a => a.status === 'Non traitée');
  const vetTreatedAlerts = alerts.filter(a => a.status === 'Traitée');
  const vetUnpaidInvoices = invoices.filter(i => i.status === 'unpaid');
  
  // Mock Visios
  const mockVisios = [
    { id: 'v1', time: "Aujourd'hui à 16:30", subject: "Léthargie - Ferme GreenValley", type: "Poulets" }
  ];

  // Today's Date representation
  const todayStr = '10 Juin 2026';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top Header & Role Switcher */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>{todayStr}</Text>
            <Text style={styles.headerTitle}>
              {userRole === 'breeder' ? 'Bonjour, Jean 👋' : 'Bonjour, Dr. Diallo 🩺'}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {userRole === 'breeder' ? (
            /* ================= BREEDER DASHBOARD ================= */
            <View style={styles.dashboardView}>
              {/* Stat Grid - Clickable to switch tabs */}
              <View style={styles.statsGrid}>
                <TouchableOpacity 
                  style={[styles.statCard, breederActiveTab === 'farms' && styles.statCardActive]} 
                  onPress={() => setBreederActiveTab('farms')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="business" size={20} color="#10B981" />
                  </View>
                  <Text style={styles.statValue}>{farms.length}</Text>
                  <Text style={styles.statLabel}>Fermes</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.statCard, breederActiveTab === 'animals' && styles.statCardActive]} 
                  onPress={() => setBreederActiveTab('animals')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <Ionicons name="logo-octocat" size={20} color="#3B82F6" />
                  </View>
                  <Text style={styles.statValue}>{totalAnimals}</Text>
                  <Text style={styles.statLabel}>Bêtes</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.statCard, breederActiveTab === 'tasks' && styles.statCardActive]} 
                  onPress={() => setBreederActiveTab('tasks')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                    <Ionicons name="checkbox" size={20} color="#F59E0B" />
                  </View>
                  <Text style={styles.statValue}>{pendingTasks.length}</Text>
                  <Text style={styles.statLabel}>Tâches</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.statCard, breederActiveTab === 'alerts' && styles.statCardActive]} 
                  onPress={() => setBreederActiveTab('alerts')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Ionicons name="warning" size={20} color="#EF4444" />
                  </View>
                  <Text style={styles.statValue}>{activeAlerts.length}</Text>
                  <Text style={styles.statLabel}>Alertes</Text>
                </TouchableOpacity>
              </View>

              {/* Dynamic Content Section based on selected tab */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {breederActiveTab === 'farms' && "Vos Exploitations"}
                  {breederActiveTab === 'animals' && "Aperçu de votre cheptel"}
                  {breederActiveTab === 'tasks' && "Tâches du jour"}
                  {breederActiveTab === 'alerts' && "Alertes en cours"}
                </Text>
                <TouchableOpacity onPress={() => router.push(
                  breederActiveTab === 'farms' ? '/(tabs)/farms' : 
                  breederActiveTab === 'tasks' ? '/(tabs)/tasks' : 
                  '/(tabs)/alerts'
                )}>
                  {breederActiveTab !== 'animals' && <Text style={styles.seeAllLink}>Gérer</Text>}
                </TouchableOpacity>
              </View>

              <View style={styles.dynamicContainer}>
                {/* 1. FARMS TAB */}
                {breederActiveTab === 'farms' && (
                  farms.length > 0 ? (
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
                                <Text style={[styles.badgeText, !farm.is_active && { color: '#EF4444' }]}>
                                  {farm.is_active ? 'Actif' : 'Inactif'}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.farmCardDesc} numberOfLines={2}>{farm.description}</Text>
                            <View style={styles.farmCardBottom}>
                              <View style={styles.farmMeta}>
                                <Ionicons name="location-outline" size={14} color="#64748B" />
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
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>Aucune ferme trouvée.</Text>
                    </View>
                  )
                )}

                {/* 2. ANIMALS TAB */}
                {breederActiveTab === 'animals' && (
                  animals.length > 0 ? (
                    animals.map(animal => {
                      const farmName = farms.find(f => f.id === animal.ferme_id)?.nomferme || 'Inconnue';
                      return (
                        <View key={animal.id} style={styles.urgencyCard}>
                          <View style={styles.urgencyCardTop}>
                            <View style={styles.urgencyInfo}>
                              <Text style={styles.urgencySubject}>{animal.espece}</Text>
                              <Text style={styles.urgencyMeta}>Race: {animal.race}</Text>
                            </View>
                            <View style={[styles.priorityBadge, { backgroundColor: '#EFF6FF' }]}>
                              <Text style={[styles.priorityText, { color: '#3B82F6' }]}>{animal.nombre} bêtes</Text>
                            </View>
                          </View>
                          <View style={styles.urgencyCardBottom}>
                            <Text style={styles.urgencyDate}>Ferme: {farmName}</Text>
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>Aucun animal enregistré.</Text>
                    </View>
                  )
                )}

                {/* 3. TASKS TAB */}
                {breederActiveTab === 'tasks' && (
                  tasks.length > 0 ? (
                    <View style={styles.tasksContainer}>
                      {tasks.map(task => (
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
                            task.type === 'alimentation' && { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
                            task.type === 'vaccin' && { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
                            task.type === 'soin' && { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
                            task.type === 'controle' && { backgroundColor: '#F1F5F9' },
                          ]}>
                            <Text style={[
                              styles.taskTypeText,
                              task.type === 'alimentation' && { color: '#3B82F6' },
                              task.type === 'vaccin' && { color: '#F59E0B' },
                              task.type === 'soin' && { color: '#10B981' },
                              task.type === 'controle' && { color: '#64748B' },
                            ]}>
                              {task.type.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>Aucune tâche pour aujourd'hui 🎉</Text>
                    </View>
                  )
                )}

                {/* 4. ALERTS TAB */}
                {breederActiveTab === 'alerts' && (
                  activeAlerts.length > 0 ? (
                    activeAlerts.map(alert => (
                      <TouchableOpacity 
                        key={alert.id}
                        style={styles.urgencyCard}
                        onPress={() => router.push('/(tabs)/alerts')}
                      >
                        <View style={styles.urgencyCardTop}>
                          <View style={styles.urgencyInfo}>
                            <Text style={styles.urgencySubject}>Alerte en cours</Text>
                            <Text style={styles.urgencyMeta}>{alert.espece} • {alert.race}</Text>
                          </View>
                          <View style={[
                            styles.priorityBadge, 
                            alert.priority === 'high' && styles.priorityHigh,
                            alert.priority === 'medium' && styles.priorityMedium,
                            alert.priority === 'low' && styles.priorityLow,
                          ]}>
                            <Text style={[
                              styles.priorityText,
                              alert.priority === 'high' && { color: '#EF4444' },
                              alert.priority === 'medium' && { color: '#F59E0B' },
                              alert.priority === 'low' && { color: '#3B82F6' }
                            ]}>{alert.priority.toUpperCase()}</Text>
                          </View>
                        </View>
                        <Text style={styles.urgencyDescription} numberOfLines={2}>
                          {alert.description}
                        </Text>
                        <View style={styles.urgencyCardBottom}>
                          <Text style={styles.urgencyDate}>Envoyé le {alert.date}</Text>
                          <Text style={styles.urgencyActionText}>Détails</Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>Tout va bien, aucune alerte de santé.</Text>
                    </View>
                  )
                )}
              </View>
            </View>
          ) : (
            /* ================= VETERINARIAN DASHBOARD ================= */
            <View style={styles.dashboardView}>
              {/* Stat Grid - Clickable to switch tabs */}
              <View style={styles.statsGrid}>
                <TouchableOpacity 
                  style={[styles.statCard, vetActiveTab === 'urgencies' && styles.statCardActive]} 
                  onPress={() => setVetActiveTab('urgencies')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Ionicons name="warning" size={20} color="#EF4444" />
                  </View>
                  <Text style={styles.statValue}>{vetAlertsToTreat.length}</Text>
                  <Text style={styles.statLabel}>Urgences</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.statCard, vetActiveTab === 'visios' && styles.statCardActive]} 
                  onPress={() => setVetActiveTab('visios')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                    <Ionicons name="videocam" size={20} color="#8B5CF6" />
                  </View>
                  <Text style={styles.statValue}>{mockVisios.length}</Text>
                  <Text style={styles.statLabel}>Visios</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.statCard, vetActiveTab === 'unpaid' && styles.statCardActive]} 
                  onPress={() => setVetActiveTab('unpaid')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                    <Ionicons name="cash" size={20} color="#F59E0B" />
                  </View>
                  <Text style={styles.statValue}>{vetUnpaidInvoices.length}</Text>
                  <Text style={styles.statLabel}>Comptabilité</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.statCard, vetActiveTab === 'treated' && styles.statCardActive]} 
                  onPress={() => setVetActiveTab('treated')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="medical" size={20} color="#10B981" />
                  </View>
                  <Text style={styles.statValue}>{vetTreatedAlerts.length}</Text>
                  <Text style={styles.statLabel}>Traités</Text>
                </TouchableOpacity>
              </View>

              {/* Dynamic Content Section based on selected tab */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {vetActiveTab === 'urgencies' && "Urgences en attente"}
                  {vetActiveTab === 'visios' && "Consultations vidéo"}
                  {vetActiveTab === 'unpaid' && "Comptabilité"}
                  {vetActiveTab === 'treated' && "Cas traités"}
                </Text>
              </View>

              <View style={styles.dynamicContainer}>
                {/* 1. URGENCIES TAB */}
                {vetActiveTab === 'urgencies' && (
                  vetAlertsToTreat.length > 0 ? (
                    vetAlertsToTreat.map(alert => (
                      <TouchableOpacity 
                        key={alert.id}
                        style={styles.urgencyCard}
                        onPress={() => router.push('/(tabs)/alerts')}
                      >
                        <View style={styles.urgencyCardTop}>
                          <View style={styles.urgencyInfo}>
                            <Text style={styles.urgencySubject}>Intervention Requise</Text>
                            <Text style={styles.urgencyMeta}>{alert.espece} • {alert.race}</Text>
                          </View>
                          <View style={[
                            styles.priorityBadge, 
                            alert.priority === 'high' && styles.priorityHigh,
                            alert.priority === 'medium' && styles.priorityMedium,
                            alert.priority === 'low' && styles.priorityLow,
                          ]}>
                            <Text style={[
                              styles.priorityText,
                              alert.priority === 'high' && { color: '#EF4444' },
                              alert.priority === 'medium' && { color: '#F59E0B' },
                              alert.priority === 'low' && { color: '#3B82F6' }
                            ]}>{alert.priority.toUpperCase()}</Text>
                          </View>
                        </View>
                        <Text style={styles.urgencyDescription} numberOfLines={2}>
                          {alert.description}
                        </Text>
                        <View style={styles.urgencyCardBottom}>
                          <Text style={styles.urgencyDate}>Reçu le {alert.date}</Text>
                          <Text style={styles.urgencyActionText}>Voir l'alerte</Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>Aucune urgence en attente.</Text>
                    </View>
                  )
                )}

                {/* 2. VISIOS TAB */}
                {vetActiveTab === 'visios' && (
                  mockVisios.length > 0 ? (
                    mockVisios.map(visio => (
                      <View key={visio.id} style={styles.visioBanner}>
                        <View style={styles.visioIconContainer}>
                          <Ionicons name="videocam" size={24} color="#8B5CF6" />
                        </View>
                        <View style={styles.visioInfo}>
                          <Text style={styles.visioTitle}>{visio.time}</Text>
                          <Text style={styles.visioSubtitle}>{visio.subject}</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.visioJoinBtn}
                          onPress={() => router.push('/(tabs)/alerts')}
                        >
                          <Text style={styles.visioJoinBtnText}>Rejoindre</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>Aucune visio programmée.</Text>
                    </View>
                  )
                )}

                {/* 3. UNPAID TAB */}
                {vetActiveTab === 'unpaid' && (
                  vetUnpaidInvoices.length > 0 ? (
                    vetUnpaidInvoices.map(invoice => (
                      <View key={invoice.id} style={styles.urgencyCard}>
                        <View style={styles.urgencyCardTop}>
                          <View style={styles.urgencyInfo}>
                            <Text style={styles.urgencySubject}>Facture #{invoice.id.substring(0,8)}</Text>
                            <Text style={styles.urgencyMeta}>{invoice.date}</Text>
                          </View>
                          <Text style={{ fontSize: 16, fontWeight: '800', color: '#F59E0B' }}>
                            {invoice.amount.toLocaleString()} F
                          </Text>
                        </View>
                        <Text style={styles.urgencyDescription} numberOfLines={2}>
                          {invoice.description}
                        </Text>
                        <View style={styles.urgencyCardBottom}>
                          <Text style={styles.urgencyDate}>En attente de paiement</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>Aucun impayé.</Text>
                    </View>
                  )
                )}

                {/* 4. TREATED TAB */}
                {vetActiveTab === 'treated' && (
                  vetTreatedAlerts.length > 0 ? (
                    vetTreatedAlerts.map(alert => (
                      <View key={alert.id} style={styles.urgencyCard}>
                        <View style={styles.urgencyCardTop}>
                          <View style={styles.urgencyInfo}>
                            <Text style={styles.urgencySubject}>Cas Traité</Text>
                            <Text style={styles.urgencyMeta}>{alert.espece} • {alert.race}</Text>
                          </View>
                          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        </View>
                        <Text style={styles.urgencyDescription} numberOfLines={2}>
                          {alert.description}
                        </Text>
                        <View style={styles.urgencyCardBottom}>
                          <Text style={styles.urgencyDate}>Traité le {alert.date}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>Aucun cas traité récemment.</Text>
                    </View>
                  )
                )}
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
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
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    shadowOpacity: 0.1,
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
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
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
    fontWeight: '700',
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
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
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
    backgroundColor: '#F0FDF4',
  },
  badgeInactive: {
    backgroundColor: '#FEF2F2',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  farmCardDesc: {
    fontSize: 13,
    color: '#64748B',
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
    fontWeight: '600',
  },
  tasksContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#94A3B8',
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
    borderColor: '#CBD5E1',
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
    fontSize: 15,
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
    fontSize: 10,
    fontWeight: '800',
  },
  dynamicContainer: {
    gap: 12,
  },
  urgencyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#94A3B8',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  urgencyMeta: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityHigh: {
    backgroundColor: '#FEF2F2',
  },
  priorityMedium: {
    backgroundColor: '#FFFBEB',
  },
  priorityLow: {
    backgroundColor: '#EFF6FF',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  urgencyDescription: {
    fontSize: 14,
    color: '#475569',
    marginTop: 10,
    lineHeight: 20,
  },
  urgencyCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  urgencyDate: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  urgencyActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  visioBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  visioIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visioInfo: {
    flex: 1,
    gap: 2,
  },
  visioTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  visioSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  visioJoinBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  visioJoinBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
