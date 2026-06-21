import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Dimensions } from 'react-native';
import { useApp, Animal } from '@/context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface MarketItem {
  id: string;
  animalId?: string; // link to breeder's animal if sold by them
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

export default function MarketplaceScreen() {
  const { userRole, animals, farms, invoices } = useApp();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  
  // Modals Visibility
  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [selectedAnimalToSell, setSelectedAnimalToSell] = useState<Animal | null>(null);

  // Form State
  const [sellPrice, setSellPrice] = useState('');
  const [sellDesc, setSellDesc] = useState('');

  // Initial Mock Marketplace items
  const [marketItems, setMarketItems] = useState<MarketItem[]>([
    {
      id: 'm1',
      title: 'Lot de 100 poulets Cobb 500 matures',
      breed: 'Poulet de chair (Cobb 500)',
      espece: 'Volaille',
      qty: 100,
      price: 250000, // CFA or units
      location: 'Ferme Avicole Sud, Cotonou',
      seller: 'Amadou B.',
      desc: 'Poulets élevés en plein air, vaccinés contre la pseudo-peste. Poids moyen de 2.2 kg.',
      icon: '🐔',
    },
    {
      id: 'm2',
      title: 'Génisse Goudali de reproduction',
      breed: 'Goudali',
      espece: 'Bovin',
      qty: 1,
      price: 450000,
      location: 'Ranch du Borgou, Parakou',
      seller: 'Ferme Borgou-Lait',
      desc: 'Génisse de 18 mois, excellente lignée laitière, carnet de santé à jour.',
      icon: '🐂',
    },
    {
      id: 'm3',
      title: 'Mouton Ladoum Mâle Tabaski',
      breed: 'Ladoum',
      espece: 'Ovin',
      qty: 1,
      price: 850000,
      location: 'Dakar, Hann Bel-Air',
      seller: 'Élevage Royal Ladoum',
      desc: 'Superbe bélier Ladoum de 14 mois, hauteur au garrot 95cm, excellent pour la Tabaski.',
      icon: '🐑',
    }
  ]);

  // Filter breeder's animals that are mature (e.g. age close to or exceeding maturation days)
  // Let's assume an animal is mature if its age * 30 days is >= maturation_jours - 60 days
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
            // Generate invoice in app context (simulate purchase invoice)
            const mockInvoice = {
              id: `i_mkt_${Date.now()}`,
              amount: item.price,
              status: 'unpaid' as const,
              description: `Achat Marketplace : ${item.qty}x ${item.breed} de ${item.seller}`,
              date: new Date().toISOString().split('T')[0],
              veterinaire: item.seller, // use seller as reference
            };
            
            // Push mock invoice
            invoices.unshift(mockInvoice);
            
            // Remove from marketplace
            setMarketItems(prev => prev.filter(i => i.id !== item.id));
            
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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {activeTab === 'buy' ? (
            /* ================= BUY TAB (LISTINGS) ================= */
            <View style={styles.buyView}>
              <Text style={styles.sectionTitle}>Annonces disponibles</Text>
              <View style={styles.itemsGrid}>
                {marketItems.map(item => (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.itemCardTop}>
                      <View style={styles.iconBox}>
                        <Text style={styles.iconText}>{item.icon}</Text>
                      </View>
                      <View style={styles.itemCardInfo}>
                        <Text style={styles.itemBreed} numberOfLines={1}>{item.breed}</Text>
                        <Text style={styles.itemQty}>{item.qty} sujet(s)</Text>
                      </View>
                      <Text style={styles.itemPrice}>
                        {(item.price).toLocaleString()} F
                      </Text>
                    </View>

                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDesc} numberOfLines={2}>{item.desc}</Text>
                    
                    <View style={styles.itemMeta}>
                      <View style={styles.metaRow}>
                        <Ionicons name="location-outline" size={14} color="#64748B" />
                        <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Ionicons name="person-outline" size={14} color="#64748B" />
                        <Text style={styles.metaText} numberOfLines={1}>Vendeur : {item.seller}</Text>
                      </View>
                    </View>

                    {userRole === 'breeder' && (
                      <TouchableOpacity 
                        style={styles.btnBuy}
                        onPress={() => handleBuyItem(item)}
                      >
                        <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.btnBuyText}>Acheter</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
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
                              {animal.nombre} sujet(s) • Âge : {animal.age} mois • {farmName}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity 
                          style={styles.btnPublish}
                          onPress={() => handleOpenSellModal(animal)}
                        >
                          <Text style={styles.btnPublishText}>Mettre en vente</Text>
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
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {selectedAnimalToSell && (
              <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
                <View style={styles.previewBox}>
                  <Text style={styles.previewText}>
                    📦 En cours de mise en vente : Lot de {selectedAnimalToSell.nombre} {selectedAnimalToSell.espece}(s) ({selectedAnimalToSell.race})
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
                    placeholder="Précisez l'état de santé, le poids moyen des sujets, les conditions d'enlèvement..."
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  marketTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
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
    color: '#64748B',
    fontWeight: '700',
  },
  mktTabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    gap: 16,
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
    gap: 16,
  },
  sellView: {
    gap: 16,
  },
  itemsGrid: {
    gap: 16,
  },
  itemCard: {
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
  itemCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconText: {
    fontSize: 24,
  },
  itemCardInfo: {
    flex: 1,
    gap: 2,
  },
  itemBreed: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemQty: {
    fontSize: 12,
    color: '#64748B',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 14,
  },
  itemDesc: {
    fontSize: 13,
    color: '#475569',
    marginTop: 6,
    lineHeight: 18,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  btnBuy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
  },
  btnBuyText: {
    color: '#FFFFFF',
    fontSize: 13,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  btnPublishText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
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
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    color: '#0F172A',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formTextarea: {
    height: 80,
    textAlignVertical: 'top',
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
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
  },
});
