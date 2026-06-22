import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useApp, Task, Animal } from '@/context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function TasksScreen() {
  const { userRole, tasks, toggleTask, animals, farms } = useApp();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [selectedDay, setSelectedDay] = useState(10); // June 10

  // Calendar days strip mock (June 8 to June 14)
  const days = [
    { name: 'Lun', num: 8 },
    { name: 'Mar', num: 9 },
    { name: 'Mer', num: 10 }, // Today
    { name: 'Jeu', num: 11 },
    { name: 'Ven', num: 12 },
    { name: 'Sam', num: 13 },
    { name: 'Dim', num: 14 },
  ];

  // Filter tasks by active tab status
  const filteredTasks = tasks.filter(t => t.status === activeTab);

  // Compute progress bar stats
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Get task type icon and colors
  const getTaskStyles = (type: Task['type']) => {
    switch (type) {
      case 'alimentation':
        return { icon: 'nutrition', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' };
      case 'vaccin':
        return { icon: 'eyedropper', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' };
      case 'soin':
        return { icon: 'bandage', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' };
      case 'controle':
        return { icon: 'eye', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)' };
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tâches Quotidiennes</Text>
        </View>

        {/* Day Selector Strip */}
        <View style={styles.dayStripContainer}>
          {days.map(day => (
            <TouchableOpacity
              key={day.num}
              style={[
                styles.dayCard,
                selectedDay === day.num && styles.dayCardActive
              ]}
              onPress={() => setSelectedDay(day.num)}
            >
              <Text style={[styles.dayName, selectedDay === day.num && styles.dayTextActive]}>
                {day.name}
              </Text>
              <Text style={[styles.dayNum, selectedDay === day.num && styles.dayTextActive]}>
                {day.num}
              </Text>
              {day.num === 10 && <View style={styles.todayIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Progress Section */}
          <View style={styles.progressCard}>
            <View style={styles.progressTextRow}>
              <View>
                <Text style={styles.progressCardTitle}>Progression du jour</Text>
                <Text style={styles.progressCardSub}>
                  {completedTasksCount} sur {totalTasksCount} tâches accomplies
                </Text>
              </View>
              <Text style={styles.progressPercentageText}>{completionPercentage}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${completionPercentage}%` }]} />
            </View>
          </View>

          {/* Maturation Lifecycles Timeline Preview */}
          <Text style={styles.sectionTitle}>Cycles de Maturation des Lots</Text>
          <View style={styles.maturationTimelineDeck}>
            {animals.map(animal => {
              const farmName = farms.find(f => f.id === animal.ferme_id)?.nomferme || 'Ferme';
              let maturityLabel = '';
              let ageInDays = animal.age * 30; // approx
              let pct = Math.min(100, Math.round((ageInDays / animal.maturation_jours) * 100));

              if (animal.espece === 'Volaille') {
                maturityLabel = `Jour ${ageInDays} / ${animal.maturation_jours} (Maturation)`;
              } else if (animal.espece === 'Lapin') {
                maturityLabel = `Jour ${ageInDays} / ${animal.maturation_jours} (Maturation)`;
              } else {
                maturityLabel = `Maturité à ${animal.maturation_jours} jours (~${Math.round(animal.maturation_jours/30)} mois)`;
              }

              return (
                <View key={animal.id} style={styles.maturationCard}>
                  <View style={styles.maturationHeader}>
                    <Text style={styles.maturationTitle}>
                      {animal.nombre > 1 ? `Lot: ${animal.nombre} ${animal.espece}s` : `1 ${animal.espece}`} ({animal.race})
                    </Text>
                    <Text style={styles.maturationFarm}>{farmName}</Text>
                  </View>
                  <Text style={styles.maturationDays}>{maturityLabel}</Text>
                  <View style={styles.maturationBarBg}>
                    <View style={[styles.maturationBarFill, { width: `${pct}%` }]} />
                  </View>
                  <View style={styles.maturationFooter}>
                    <Text style={styles.maturationFooterText}>Progression globale : {pct}%</Text>
                    {pct >= 90 ? (
                      <View style={styles.readyBadge}>
                        <Text style={styles.readyBadgeText}>PRÊT À VENDRE</Text>
                      </View>
                    ) : (
                      <Text style={styles.maturationGrowthText}>Croissance en cours</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Chores Tabs & Checklist */}
          <View style={styles.taskTabHeader}>
            <Text style={styles.sectionTitle}>Liste des soins</Text>
            <View style={styles.taskTabs}>
              <TouchableOpacity
                style={[styles.taskTabButton, activeTab === 'pending' && styles.taskTabButtonActive]}
                onPress={() => setActiveTab('pending')}
              >
                <Text style={[styles.taskTabBtnText, activeTab === 'pending' && styles.taskTabBtnTextActive]}>
                  À faire
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.taskTabButton, activeTab === 'completed' && styles.taskTabButtonActive]}
                onPress={() => setActiveTab('completed')}
              >
                <Text style={[styles.taskTabBtnText, activeTab === 'completed' && styles.taskTabBtnTextActive]}>
                  Terminées
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Chores list */}
          <View style={styles.tasksContainer}>
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => {
                const stylesInfo = getTaskStyles(task.type);
                const taskFarmName = farms.find(f => f.id === task.ferme_id)?.nomferme || 'Ferme';

                return (
                  <View key={task.id} style={styles.taskItem}>
                    {userRole === 'breeder' && (
                      <TouchableOpacity
                        style={[styles.taskCheckbox, task.status === 'completed' && styles.taskCheckboxChecked]}
                        onPress={() => toggleTask(task.id)}
                      >
                        {task.status === 'completed' && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                    )}
                    
                    <View style={[styles.taskIconWrapper, { backgroundColor: stylesInfo.bg }]}>
                      <Ionicons name={stylesInfo.icon as any} size={22} color={stylesInfo.color} />
                    </View>

                    <View style={styles.taskInfo}>
                      <Text style={styles.taskName}>{task.nomtache}</Text>
                      <Text style={styles.taskSub}>
                        {task.espece} • {task.race} • {task.age_target}
                      </Text>
                      <Text style={styles.taskFarmLabel}>🏢 {taskFarmName}</Text>
                    </View>

                    <View style={styles.taskRightMeta}>
                      <Text style={styles.taskQty}>{task.quantite}</Text>
                      <Text style={styles.taskTime}>Auj</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkbox-outline" size={44} color="#475569" />
                <Text style={styles.emptyText}>
                  Aucune tâche {activeTab === 'pending' ? 'en attente' : 'terminée'} pour cette journée.
                </Text>
              </View>
            )}
          </View>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  dayStripContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  dayCard: {
    width: (width - 32 - 12 * 6) / 7,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayCardActive: {
    backgroundColor: '#10B981',
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  dayNum: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 4,
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 20,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  progressCardSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  progressPercentageText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#10B981',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 10,
  },
  maturationTimelineDeck: {
    gap: 12,
  },
  maturationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  maturationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maturationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  maturationFarm: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  maturationDays: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  maturationBarBg: {
    height: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 4,
  },
  maturationBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  maturationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  maturationFooterText: {
    fontSize: 11,
    color: '#64748B',
  },
  maturationGrowthText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '700',
  },
  readyBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  readyBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
  },
  taskTabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  taskTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 2,
  },
  taskTabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  taskTabButtonActive: {
    backgroundColor: '#10B981',
  },
  taskTabBtnText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  taskTabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tasksContainer: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  taskIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
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
  taskSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  taskFarmLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  taskRightMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  taskQty: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  taskTime: {
    fontSize: 11,
    color: '#64748B',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    gap: 8,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
  },
});
