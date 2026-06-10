import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useApp, Farm, Animal } from '@/context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SPECIES_LIST = ['Bovin', 'Ovin', 'Caprin', 'Porc', 'Volaille', 'Lapin', 'Poisson'];
const BREED_MAPPING: Record<string, string[]> = {
  Bovin: ['Goudali', 'Zébu Fulani', 'Borgou', 'Holstein', 'Charolaise'],
  Ovin: ['Djallonké', 'Sahel', 'Bali-Bali', 'Ladoum'],
  Caprin: ['Rousse de Maradi', 'Boer', 'Alpine', 'Saanen'],
  Porc: ['Large White', 'Landrace', 'Duroc', 'Local'],
  Volaille: ['Poulet de chair (Cobb 500)', 'Pondeuse (Isa Brown)', 'Brahma', 'Goliath'],
  Lapin: ['Néo-zélandais', 'Californien', 'Géant des Flandres', 'Local'],
  Poisson: ['Tilapia du Nil', 'Silure (Clarias)'],
};

export default function FarmsScreen() {
  const { userRole, farms, addFarm, animals, addAnimal, reportMortality } = useApp();
  const [selectedFarmId, setSelectedFarmId] = useState(farms[0]?.id || '');

  // Modals Visibility
  const [farmModalVisible, setFarmModalVisible] = useState(false);
  const [animalModalVisible, setAnimalModalVisible] = useState(false);

  // Add Farm Form State
  const [farmName, setFarmName] = useState('');
  const [farmDesc, setFarmDesc] = useState('');
  const [farmAddr, setFarmAddr] = useState('');

  // Add Animal Form State
  const [animalSpecies, setAnimalSpecies] = useState(SPECIES_LIST[0]);
  const [animalBreed, setAnimalBreed] = useState(BREED_MAPPING[SPECIES_LIST[0]][0]);
  const [animalAge, setAnimalAge] = useState('');
  const [animalQty, setAnimalQty] = useState('1'); // > 1 for Lot, 1 for Individual
  const [animalTag, setAnimalTag] = useState('');

  // Handle Species Change to update breed selection
  const handleSpeciesChange = (species: string) => {
    setAnimalSpecies(species);
    setAnimalBreed(BREED_MAPPING[species][0]);
  };

  const handleCreateFarm = () => {
    if (!farmName || !farmDesc || !farmAddr) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    addFarm({
      nomferme: farmName,
      description: farmDesc,
      adresse: farmAddr,
    });
    setFarmName('');
    setFarmDesc('');
    setFarmAddr('');
    setFarmModalVisible(false);
    Alert.alert('Succès', 'Ferme créée avec succès !');
  };

  const handleCreateAnimal = () => {
    if (!animalAge || !animalQty) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires (âge et quantité).');
      return;
    }

    const qty = parseInt(animalQty, 10);
    const age = parseInt(animalAge, 10);

    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Erreur', 'La quantité doit être un nombre positif supérieur à 0.');
      return;
    }

    if (isNaN(age) || age < 0) {
      Alert.alert('Erreur', "L'âge doit être un nombre valide.");
      return;
    }

    addAnimal({
      espece: animalSpecies,
      race: animalBreed,
      age: age,
      nombre: qty,
      ferme_id: selectedFarmId,
      date_entree: new Date().toISOString().split('T')[0],
      maturation_jours: qty > 1 ? 90 : 450, // simple mock calculation
      tags: qty === 1 && animalTag ? animalTag : undefined,
    });

    // Reset Form
    setAnimalAge('');
    setAnimalQty('1');
    setAnimalTag('');
    setAnimalModalVisible(false);
    Alert.alert('Succès', 'Animal ou Lot ajouté avec succès !');
  };

  const selectedFarm = farms.find(f => f.id === selectedFarmId);
  const farmAnimals = animals.filter(a => a.ferme_id === selectedFarmId);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mes Exploitations</Text>
          {userRole === 'breeder' && (
            <TouchableOpacity 
              style={styles.btnAddFarm} 
              onPress={() => setFarmModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.btnAddFarmText}>Ferme</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Farms Selector Horizontal Deck */}
          <Text style={styles.sectionLabel}>Sélectionnez une ferme :</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.farmsDeck}
          >
            {farms.map(farm => (
              <TouchableOpacity
                key={farm.id}
                style={[styles.farmDeckCard, selectedFarmId === farm.id && styles.farmDeckCardActive]}
                onPress={() => setSelectedFarmId(farm.id)}
              >
                <Ionicons 
                  name="business" 
                  size={20} 
                  color={selectedFarmId === farm.id ? '#FFFFFF' : '#10B981'} 
                />
                <Text style={[styles.farmDeckCardText, selectedFarmId === farm.id && styles.farmDeckCardTextActive]}>
                  {farm.nomferme}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Selected Farm Information Card */}
          {selectedFarm && (
            <View style={styles.farmDetailsCard}>
              <View style={styles.farmDetailsHeader}>
                <Text style={styles.farmDetailsName}>{selectedFarm.nomferme}</Text>
                <View style={styles.badgeActive}>
                  <Text style={styles.badgeActiveText}>Actif</Text>
                </View>
              </View>
              <Text style={styles.farmDetailsDesc}>{selectedFarm.description}</Text>
              <View style={styles.farmDetailsMeta}>
                <Ionicons name="location-outline" size={16} color="#64748B" />
                <Text style={styles.farmDetailsAddress}>{selectedFarm.adresse}</Text>
              </View>
            </View>
          )}

          {/* Animals Section */}
          <View style={styles.animalsSectionHeader}>
            <Text style={styles.animalsSectionTitle}>Animaux & Troupeaux</Text>
            {userRole === 'breeder' && selectedFarmId !== '' && (
              <TouchableOpacity 
                style={styles.btnAddAnimal}
                onPress={() => setAnimalModalVisible(true)}
              >
                <Ionicons name="paw" size={16} color="#10B981" />
                <Text style={styles.btnAddAnimalText}>Ajouter Bête/Lot</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Animals Cards */}
          <View style={styles.animalsGrid}>
            {farmAnimals.length > 0 ? (
              farmAnimals.map(animal => {
                const isLot = animal.nombre > 1;

                return (
                  <View key={animal.id} style={styles.animalCard}>
                    <View style={styles.animalCardHeader}>
                      <View style={styles.animalSpeciesGroup}>
                        <Text style={styles.animalIcon}>{isLot ? '🐔' : '🐂'}</Text>
                        <View>
                          <Text style={styles.animalBreed}>{animal.race}</Text>
                          <Text style={styles.animalSpecies}>{animal.espece}</Text>
                        </View>
                      </View>
                      <View style={[styles.animalModeBadge, isLot ? styles.modeLot : styles.modeIndiv]}>
                        <Text style={styles.animalModeText}>{isLot ? `LOT: ${animal.nombre}` : 'INDIVIDUEL'}</Text>
                      </View>
                    </View>

                    <View style={styles.animalStatsRow}>
                      <View style={styles.animalStatCell}>
                        <Text style={styles.animalStatLabel}>Âge</Text>
                        <Text style={styles.animalStatValue}>{animal.age} mois</Text>
                      </View>
                      
                      {!isLot && animal.tags && (
                        <View style={styles.animalStatCell}>
                          <Text style={styles.animalStatLabel}>Boucle ID</Text>
                          <Text style={styles.animalStatValue}>{animal.tags}</Text>
                        </View>
                      )}

                      <View style={styles.animalStatCell}>
                        <Text style={styles.animalStatLabel}>Date d'entrée</Text>
                        <Text style={styles.animalStatValue}>{animal.date_entree}</Text>
                      </View>
                    </View>

                    {/* Lot specific controls for reporting mortality */}
                    {isLot && userRole === 'breeder' && (
                      <View style={styles.lotControls}>
                        <Text style={styles.lotControlsTitle}>Déclarer perte (Mortalité) :</Text>
                        <View style={styles.lotButtons}>
                          <TouchableOpacity 
                            style={styles.lossBtn}
                            onPress={() => {
                              Alert.alert('Déclarer Perte', 'Confirmer la perte de 1 sujet dans ce lot ?', [
                                { text: 'Annuler', style: 'cancel' },
                                { text: 'Confirmer', onPress: () => reportMortality(animal.id, 1) }
                              ]);
                            }}
                          >
                            <Text style={styles.lossBtnText}>-1 sujet</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.lossBtn, styles.lossBtn5]}
                            onPress={() => {
                              Alert.alert('Déclarer Pertes', 'Confirmer la perte de 5 sujets dans ce lot ?', [
                                { text: 'Annuler', style: 'cancel' },
                                { text: 'Confirmer', onPress: () => reportMortality(animal.id, 5) }
                              ]);
                            }}
                          >
                            <Text style={styles.lossBtnText}>-5 sujets</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="paw-outline" size={48} color="#475569" />
                <Text style={styles.emptyText}>Aucun animal répertorié dans cette exploitation.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* ================= MODAL ADD FARM ================= */}
      <Modal visible={farmModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle Exploitation</Text>
              <TouchableOpacity onPress={() => setFarmModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nom de la ferme</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ex: Ferme Avicole du Nord"
                  placeholderTextColor="#64748B"
                  value={farmName}
                  onChangeText={setFarmName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextarea]}
                  placeholder="Ex: Élevage intensif de porcs Large White et maraîchage bio..."
                  placeholderTextColor="#64748B"
                  multiline={true}
                  numberOfLines={4}
                  value={farmDesc}
                  onChangeText={setFarmDesc}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Adresse / Localisation</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ex: Route nationale 2, Hahotoe"
                  placeholderTextColor="#64748B"
                  value={farmAddr}
                  onChangeText={setFarmAddr}
                />
              </View>

              <TouchableOpacity style={styles.btnSubmit} onPress={handleCreateFarm}>
                <Text style={styles.btnSubmitText}>Créer la ferme</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ================= MODAL ADD ANIMAL ================= */}
      <Modal visible={animalModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter Bêtes / Lot</Text>
              <TouchableOpacity onPress={() => setAnimalModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
              {/* Species Select */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Espèce</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalSelect}>
                  {SPECIES_LIST.map(species => (
                    <TouchableOpacity
                      key={species}
                      style={[styles.selectChip, animalSpecies === species && styles.selectChipActive]}
                      onPress={() => handleSpeciesChange(species)}
                    >
                      <Text style={[styles.selectChipText, animalSpecies === species && styles.selectChipTextActive]}>
                        {species}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Breed Select */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Race</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalSelect}>
                  {BREED_MAPPING[animalSpecies].map(breed => (
                    <TouchableOpacity
                      key={breed}
                      style={[styles.selectChip, animalBreed === breed && styles.selectChipActive]}
                      onPress={() => setAnimalBreed(breed)}
                    >
                      <Text style={[styles.selectChipText, animalBreed === breed && styles.selectChipTextActive]}>
                        {breed}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Age & Quantity Row */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Âge (mois)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ex: 6"
                    placeholderTextColor="#64748B"
                    value={animalAge}
                    onChangeText={setAnimalAge}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Quantité (nombre)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ex: 150"
                    placeholderTextColor="#64748B"
                    value={animalQty}
                    onChangeText={setAnimalQty}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Individual Tag - Only display if Quantity == 1 */}
              {animalQty === '1' && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Numéro de Boucle (Tag auriculaire)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ex: GD-401"
                    placeholderTextColor="#64748B"
                    value={animalTag}
                    onChangeText={setAnimalTag}
                    autoCapitalize="characters"
                  />
                </View>
              )}

              <TouchableOpacity style={styles.btnSubmit} onPress={handleCreateAnimal}>
                <Text style={styles.btnSubmitText}>Valider l'ajout</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnAddFarm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnAddFarmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    gap: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  farmsDeck: {
    gap: 12,
    paddingBottom: 6,
  },
  farmDeckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  farmDeckCardActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  farmDeckCardText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  farmDeckCardTextActive: {
    color: '#FFFFFF',
  },
  farmDetailsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 10,
  },
  farmDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  farmDetailsName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeActiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  farmDetailsDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  farmDetailsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  farmDetailsAddress: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  animalsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  animalsSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnAddAnimal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  btnAddAnimalText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  animalsGrid: {
    gap: 16,
  },
  animalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  animalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  animalSpeciesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  animalIcon: {
    fontSize: 32,
  },
  animalBreed: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  animalSpecies: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  animalModeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modeLot: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  modeIndiv: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
  },
  animalModeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3B82F6', // gets overridden
  },
  animalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderRadius: 12,
    padding: 12,
  },
  animalStatCell: {
    alignItems: 'center',
    flex: 1,
  },
  animalStatLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  animalStatValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  lotControls: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  lotControlsTitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 10,
  },
  lotButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  lossBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  lossBtn5: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  lossBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E293B',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalForm: {
    gap: 16,
    paddingBottom: 40,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  formInput: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  formTextarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnSubmit: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  btnSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  horizontalSelect: {
    flexDirection: 'row',
    paddingBottom: 4,
  },
  selectChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  selectChipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  selectChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
