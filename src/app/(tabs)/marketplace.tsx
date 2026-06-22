import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Dimensions } from 'react-native';
import { useApp, Animal } from '@/context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface MarketItem {
  id: string;
  animalId?: string;
  title: string;
  breed: string;
  espece: string;
  qty: number;
  price: number;
  location: string;
  seller: string;
  desc: string;
  icon: string;
}

const CATEGORIES = ['Tous', 'Volaille', 'Bovin', 'Ovin', 'Caprin', 'Porcin'];

export default function MarketplaceScreen() {
  const { userRole, animals, farms, invoices } = useApp();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  
  // Modals Visibility
  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [selectedAnimalToSell, setSelectedAnimalToSell] = useState<Animal | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  // Pagination
  const [visibleItemsCount, setVisibleItemsCount] = useState(5);

  // Ad Details Modal
  const [selectedAd, setSelectedAd] = useState<MarketItem | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Form State
  const [sellPrice, setSellPrice] = useState('');
  const [sellDesc, setSellDesc] = useState('');

  // Initial Mock Marketplace items
  const [marketItems, setMarketItems] = useState<MarketItem[]>([
    {
      id: 'm1', title: 'Lot de 100 poulets Cobb 500 matures', breed: 'Cobb 500', espece: 'Volaille', qty: 100, price: 250000,
      location: 'Ferme Avicole Sud, Cotonou', seller: 'Amadou B.', desc: 'Poulets élevés en plein air, vaccinés.', icon: '🐔'
    },
    {
      id: 'm2', title: 'Génisse Goudali de reproduction', breed: 'Goudali', espece: 'Bovin', qty: 1, price: 450000,
      location: 'Ranch du Borgou, Parakou', seller: 'Ferme Borgou-Lait', desc: 'Génisse de 18 mois, excellente lignée laitière.', icon: '🐂'
    },
    {
      id: 'm3', title: 'Mouton Ladoum Mâle Tabaski', breed: 'Ladoum', espece: 'Ovin', qty: 1, price: 850000,
      location: 'Dakar, Hann Bel-Air', seller: 'Élevage Royal', desc: 'Superbe bélier Ladoum de 14 mois, hauteur au garrot 95cm.', icon: '🐑'
    },
    {
      id: 'm4', title: 'Lot de 50 pondeuses Isa Brown', breed: 'Isa Brown', espece: 'Volaille', qty: 50, price: 150000,
      location: 'Porto-Novo', seller: 'Ferme Avicole Est', desc: 'Pondeuses en pic de ponte, très rentables.', icon: '🐔'
    },
    {
      id: 'm5', title: 'Vache Laitière Holstein', breed: 'Holstein', espece: 'Bovin', qty: 1, price: 1200000,
      location: 'Abomey-Calavi', seller: 'Coopérative Laitière', desc: 'Vache très productive, 20L par jour.', icon: '🐄'
    },
    {
      id: 'm6', title: 'Chèvre Rousse de Maradi', breed: 'Rousse de Maradi', espece: 'Caprin', qty: 3, price: 105000,
      location: 'Kandi', seller: 'Elevage Nord', desc: 'Lot de 3 chèvres en bonne santé.', icon: '🐐'
    },
    {
      id: 'm7', title: 'Porcelets Large White', breed: 'Large White', espece: 'Porcin', qty: 5, price: 250000,
      location: 'Ouidah', seller: 'Ferme Porcine', desc: 'Porcelets sevrés, vermifugés.', icon: '🐖'
    }
  ]);

  // Filter breeder's animals that are mature
  const matureAnimals = animals.filter(ani => {
    const ageInDays = ani.age * 30;
    return ageInDays >= (ani.maturation_jours - 60);
  });

  const handleBuyItem = (item: MarketItem) => {
    Alert.alert(
      'Confirmer l\'achat',
      `Voulez-vous acheter "${item.title}" pour ${item.price.toLocaleString()} FCFA ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: () => {
            const mockInvoice = {
              id: `i_mkt_${Date.now()}`,
              amount: item.price,
              status: 'unpaid' as const,
              description: `Achat Marketplace : ${item.qty}x ${item.breed} de ${item.seller}`,
              date: new Date().toISOString().split('T')[0],
              veterinaire: item.seller, 
            };
            
            invoices.unshift(mockInvoice);
            setMarketItems(prev => prev.filter(i => i.id !== item.id));
            setDetailsModalVisible(false);
            
            Alert.alert(
              'Achat Initie', 
              'Une facture de paiement a été générée dans votre espace Profil. Veuillez la régler pour finaliser la livraison.'
            );
          } 
        }
      ]
    );
  };

  const handleOpenSellModal = (animal: Animal) => {
    setSelectedAnimalToSell(animal);
    setSellModalVisible(true);
  };

  const handlePublishItem = () => {
    if (!sellPrice || !sellDesc || !selectedAnimalToSell) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    const price = parseFloat(sellPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un prix valide.');
      return;
    }

    const newItem: MarketItem = {
      id: `m_${Date.now()}`,
      animalId: selectedAnimalToSell.id,
      title: `${selectedAnimalToSell.nombre > 1 ? `Lot de ${selectedAnimalToSell.nombre}` : '1'} ${selectedAnimalToSell.espece}(s) ${selectedAnimalToSell.race}`,
      breed: selectedAnimalToSell.race,
      espece: selectedAnimalToSell.espece,
      qty: selectedAnimalToSell.nombre,
      price: price,
      location: farms.find(f => f.id === selectedAnimalToSell.ferme_id)?.adresse || 'Localisation inconnue',
      seller: 'Jean Éleveur (Vous)',
      desc: sellDesc,
      icon: selectedAnimalToSell.nombre > 1 ? '🐔' : '🐂',
    };

    setMarketItems([newItem, ...marketItems]);
    setSellPrice('');
    setSellDesc('');
    setSellModalVisible(false);
    setSelectedAnimalToSell(null);
    Alert.alert('Succès', 'Votre annonce a été publiée avec succès !');
  };

  const openAdDetails = (item: MarketItem) => {
    setSelectedAd(item);
    setDetailsModalVisible(true);
  };

  // Filter logic
  const filteredItems = useMemo(() => {
    return marketItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'Tous' || item.espece.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [marketItems, searchQuery, selectedCategory]);

  const displayedItems = filteredItems.slice(0, visibleItemsCount);
  const hasMore = visibleItemsCount < filteredItems.length;

  const loadMore = () => {
    setVisibleItemsCount(prev => prev + 5);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header with Bottom Border */}
        <View style={styles.header}>
          <Text style={styles.title}>Marché Agricole</Text>
          {userRole === 'breeder' && (
            <View style={styles.marketTabs}>
              <TouchableOpacity
                style={[styles.mktTab, activeTab === 'buy' && styles.mktTabActive]}
                onPress={() => setActiveTab('buy')}
              >
                <Text style={[styles.mktTabText, activeTab === 'buy' && styles.mktTabTextActive]}>Acheter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mktTab, activeTab === 'sell' && styles.mktTabActive]}
                onPress={() => setActiveTab('sell')}
              >
                <Text style={[styles.mktTabText, activeTab === 'sell' && styles.mktTabTextActive]}>Vendre</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {activeTab === 'buy' ? (
            /* ================= BUY TAB (LISTINGS) ================= */
            <View style={styles.buyView}>
              
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher une race, une localisation..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Filter Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setVisibleItemsCount(5); // reset pagination on filter change
                    }}
                  >
                    <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.itemsGrid}>
                {displayedItems.length > 0 ? (
                  displayedItems.map(item => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.compactCard}
                      onPress={() => openAdDetails(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.compactIconBox}>
                        <Text style={styles.iconText}>{item.icon}</Text>
                      </View>
                      <View style={styles.compactInfo}>
                        <Text style={styles.compactTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.compactSub}>{item.qty} sujet(s) - {item.espece}</Text>
                        <Text style={styles.compactPrice}>{(item.price).toLocaleString()} F</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Aucune annonce ne correspond à vos critères.</Text>
                  </View>
                )}

                {hasMore && (
                  <TouchableOpacity style={styles.btnLoadMore} onPress={loadMore}>
                    <Text style={styles.btnLoadMoreText}>Afficher plus d'annonces</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            /* ================= SELL TAB (BREEDER READY ANIMALS) ================= */
            <View style={styles.sellView}>
              <Text style={styles.sectionTitle}>Vos Bêtes à Maturation</Text>
              <Text style={styles.sectionSubtitle}>Sélectionnez un lot ou animal mature pour le mettre en vente sur le réseau.</Text>
              
              <View style={styles.matureList}>
                {matureAnimals.length > 0 ? (
                  matureAnimals.map(animal => {
                    const farmName = farms.find(f => f.id === animal.ferme_id)?.nomferme || 'Ferme';
                    const isLot = animal.nombre > 1;

                    return (
                      <View key={animal.id} style={styles.matureCard}>
                        <View style={styles.matureCardLeft}>
                          <Text style={styles.matureIcon}>{isLot ? '🐔' : '🐂'}</Text>
                          <View>
                            <Text style={styles.matureBreed}>{animal.race}</Text>
                            <Text style={styles.matureMeta}>
                              {animal.nombre} sujet(s) - Âge : {animal.age} mois - {farmName}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity 
                          style={styles.btnPublish}
                          onPress={() => handleOpenSellModal(animal)}
                        >
                          <Text style={styles.btnPublishText}>Vendre</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="gift-outline" size={44} color="#475569" />
                    <Text style={styles.emptyText}>
                      Aucune bête n'a encore atteint son cycle de maturation complète. Continuez vos soins ! 💪
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* ================= SELL DIALOG MODAL ================= */}
      <Modal visible={sellModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mettre en vente</Text>
              <TouchableOpacity onPress={() => setSellModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {selectedAnimalToSell && (
              <ScrollView contentContainerStyle={styles.modalForm}>
                <View style={styles.previewBox}>
                  <Text style={styles.previewText}>
                    📦 En cours de vente : Lot de {selectedAnimalToSell.nombre} {selectedAnimalToSell.espece}(s) ({selectedAnimalToSell.race})
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Prix de vente total (FCFA)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ex: 150000"
                    placeholderTextColor="#64748B"
                    value={sellPrice}
                    onChangeText={setSellPrice}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Description de l'annonce</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextarea]}
                    placeholder="Précisez l'état de santé, le poids moyen, les conditions d'enlèvement..."
                    placeholderTextColor="#64748B"
                    multiline={true}
                    numberOfLines={4}
                    value={sellDesc}
                    onChangeText={setSellDesc}
                  />
                </View>

                <TouchableOpacity style={styles.btnSubmit} onPress={handlePublishItem}>
                  <Text style={styles.btnSubmitText}>Publier sur le Marché</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ================= AD DETAILS MODAL ================= */}
      <Modal visible={detailsModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentDetails}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails de l'annonce</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            
            {selectedAd && (
              <ScrollView contentContainerStyle={styles.adDetailsScroll}>
                <View style={styles.adHeaderBox}>
                  <Text style={styles.adBigIcon}>{selectedAd.icon}</Text>
                  <Text style={styles.adTitle}>{selectedAd.title}</Text>
                  <Text style={styles.adPrice}>{(selectedAd.price).toLocaleString()} F</Text>
                </View>

                <View style={styles.adInfoBox}>
                  <Text style={styles.adDesc}>{selectedAd.desc}</Text>
                  
                  <View style={styles.adMetaRow}>
                    <Ionicons name="pricetag-outline" size={18} color="#64748B" />
                    <Text style={styles.adMetaText}>Espèce : {selectedAd.espece}</Text>
                  </View>
                  <View style={styles.adMetaRow}>
                    <Ionicons name="location-outline" size={18} color="#64748B" />
                    <Text style={styles.adMetaText}>{selectedAd.location}</Text>
                  </View>
                  <View style={styles.adMetaRow}>
                    <Ionicons name="person-outline" size={18} color="#64748B" />
                    <Text style={styles.adMetaText}>Vendeur : {selectedAd.seller}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.btnSubmit}
                  onPress={() => handleBuyItem(selectedAd)}
                >
                  <Ionicons name="cart" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.btnSubmitText}>Acheter</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  marketTabs: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mktTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mktTabActive: {
    backgroundColor: '#10B981',
  },
  mktTabText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  mktTabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    paddingTop: 16,
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#0F172A',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxHeight: 40,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  filterChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  buyView: {
    gap: 4,
  },
  sellView: {
    gap: 16,
  },
  itemsGrid: {
    gap: 12,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compactIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  compactSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  compactPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
  },
  btnLoadMore: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnLoadMoreText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  matureList: {
    gap: 12,
  },
  matureCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  matureCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  matureIcon: {
    fontSize: 32,
  },
  matureBreed: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  matureMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  btnPublish: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnPublishText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalContentDetails: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
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
    color: '#0F172A',
  },
  modalForm: {
    gap: 16,
    paddingBottom: 40,
  },
  adDetailsScroll: {
    paddingBottom: 40,
  },
  adHeaderBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  adBigIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  adTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  adPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#10B981',
  },
  adInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    gap: 12,
  },
  adDesc: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 8,
  },
  adMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adMetaText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  previewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
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
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    color: '#0F172A',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formTextarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  btnSubmit: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    marginTop: 20,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});