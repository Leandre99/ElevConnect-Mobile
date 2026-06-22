import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator, Dimensions } from 'react-native';
import { useApp, Invoice } from '@/context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { userRole, setUserRole, invoices, payInvoice } = useApp();
  
  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userRole === 'breeder' ? 'Jean Éleveur' : 'Dr. Diallo');
  const [phone, setPhone] = useState('+229 97 00 00 00');
  
  // Checkout Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Credit Card Form state (Mock)
  const [cardNumber, setCardNumber] = useState('4000 1234 5678 9010');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  const handleOpenPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleProcessPayment = () => {
    setPaymentLoading(true);
    // Simulate API processing
    setTimeout(() => {
      if (selectedInvoice) {
        payInvoice(selectedInvoice.id);
        setPaymentLoading(false);
        setSelectedInvoice(null);
        Alert.alert('Paiement Réussi', 'La facture a été marquée comme payée. Merci ! 🎉');
      }
    }, 2000);
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', onPress: () => router.replace('/(auth)/welcome') }
    ]);
  };

  const toggleEditProfile = () => {
    if (isEditing) {
      // Save changes
      Alert.alert('Succès', 'Votre profil a été mis à jour.');
    }
    setIsEditing(!isEditing);
  };

  // Calculations
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const unpaidCount = invoices.filter(i => i.status === 'unpaid').length;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mon Profil</Text>
          <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* User Profile Info / Edit Form */}
          <View style={styles.profileCard}>
            <View style={styles.profileCardHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {userRole === 'breeder' ? '🚜' : '🩺'}
                </Text>
              </View>
              <TouchableOpacity style={styles.btnEdit} onPress={toggleEditProfile}>
                <Ionicons name={isEditing ? "checkmark" : "pencil"} size={18} color="#FFFFFF" />
                <Text style={styles.btnEditText}>{isEditing ? "Enregistrer" : "Modifier"}</Text>
              </TouchableOpacity>
            </View>

            {isEditing ? (
              <View style={styles.profileForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nom complet</Text>
                  <TextInput
                    style={styles.inputActive}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Numéro de contact</Text>
                  <TextInput
                    style={styles.inputActive}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Adresse Email (Non modifiable)</Text>
                  <Text style={styles.inputValueReadonly}>
                    {userRole === 'breeder' ? 'jean.eleveur@elevconnect.com' : 'dr.diallo@elevconnect.com'}
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Rôle (Non modifiable)</Text>
                  <Text style={styles.inputValueReadonly}>
                    {userRole === 'breeder' ? 'Éleveur de bétail' : 'Médecin Vétérinaire'}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.profileInfoView}>
                <Text style={styles.profileNameDisplay}>{name}</Text>
                <Text style={styles.profileRoleDisplay}>
                  {userRole === 'breeder' ? 'Éleveur de bétail' : 'Médecin Vétérinaire'}
                </Text>
                
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={18} color="#64748B" />
                  <Text style={styles.infoText}>{phone}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={18} color="#64748B" />
                  <Text style={styles.infoText}>
                    {userRole === 'breeder' ? 'jean.eleveur@elevconnect.com' : 'dr.diallo@elevconnect.com'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Réglé</Text>
              <Text style={styles.statValue}>{(totalPaid).toLocaleString()} F</Text>
            </View>
            <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: '#E2E8F0' }]}>
              <Text style={styles.statLabel}>Factures en Attente</Text>
              <Text style={[styles.statValue, unpaidCount > 0 && { color: '#EF4444' }]}>{unpaidCount}</Text>
            </View>
          </View>

          {/* Invoices List */}
          <Text style={styles.sectionTitle}>Historique des Factures</Text>
          <View style={styles.invoicesList}>
            {invoices.length > 0 ? (
              invoices.map(invoice => {
                const isPaid = invoice.status === 'paid';
                return (
                  <View key={invoice.id} style={styles.invoiceCard}>
                    <View style={styles.invoiceCardTop}>
                      <View style={styles.invoiceMeta}>
                        <Ionicons 
                          name={isPaid ? "checkmark-circle" : "alert-circle"} 
                          size={20} 
                          color={isPaid ? "#10B981" : "#EF4444"} 
                        />
                        <View>
                          <Text style={styles.invoiceRef}>Facture #{invoice.id.substring(0, 8)}</Text>
                          <Text style={styles.invoiceDate}>{invoice.date} • {invoice.veterinaire}</Text>
                        </View>
                      </View>
                      <Text style={[styles.invoiceAmount, isPaid ? { color: '#10B981' } : { color: '#EF4444' }]}>
                        {(invoice.amount).toLocaleString()} F
                      </Text>
                    </View>

                    <Text style={styles.invoiceDesc}>{invoice.description}</Text>

                    {!isPaid && userRole === 'breeder' && (
                      <TouchableOpacity 
                        style={styles.btnPay}
                        onPress={() => handleOpenPayment(invoice)}
                      >
                        <Ionicons name="wallet-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.btnPayText}>Régler la facture</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="card-outline" size={44} color="#94A3B8" />
                <Text style={styles.emptyText}>Aucune transaction enregistrée.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* ================= PAYMENT CHECKOUT MODAL ================= */}
      <Modal visible={selectedInvoice !== null} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Règlement de Facture</Text>
              <TouchableOpacity onPress={() => setSelectedInvoice(null)} disabled={paymentLoading}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {selectedInvoice && (
              <View style={styles.checkoutForm}>
                {/* Simulated credit card UI */}
                <View style={styles.creditCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardBrandName}>ElevConnect Pay</Text>
                    <Ionicons name="card" size={28} color="#FFFFFF" />
                  </View>
                  <Text style={styles.cardNumberText}>{cardNumber}</Text>
                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.cardLabel}>EXPIRY</Text>
                      <Text style={styles.cardValueText}>{cardExpiry}</Text>
                    </View>
                    <View>
                      <Text style={styles.cardLabel}>CVV</Text>
                      <Text style={styles.cardValueText}>{cardCvv}</Text>
                    </View>
                  </View>
                </View>

                {/* Billing Summary */}
                <View style={styles.billingSummary}>
                  <Text style={styles.billLabel}>Montant à débiter :</Text>
                  <Text style={styles.billAmount}>{(selectedInvoice.amount).toLocaleString()} FCFA</Text>
                  <Text style={styles.billDesc}>{selectedInvoice.description}</Text>
                </View>

                {/* Form fields */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Numéro de carte</Text>
                  <TextInput
                    style={styles.formInput}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Expiration</Text>
                    <TextInput
                      style={styles.formInput}
                      value={cardExpiry}
                      onChangeText={setCardExpiry}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>CVV</Text>
                    <TextInput
                      style={styles.formInput}
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      keyboardType="numeric"
                      secureTextEntry={true}
                    />
                  </View>
                </View>

                {paymentLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={styles.loadingText}>Traitement bancaire sécurisé en cours...</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.btnSubmit} onPress={handleProcessPayment}>
                    <Text style={styles.btnSubmitText}>Procéder au Paiement</Text>
                  </TouchableOpacity>
                )}
              </View>
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
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  btnLogout: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    paddingTop: 16,
    gap: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profileCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  avatarText: {
    fontSize: 32,
  },
  btnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  btnEditText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  profileInfoView: {
    gap: 8,
  },
  profileNameDisplay: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileRoleDisplay: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  profileForm: {
    gap: 16,
    marginTop: 10,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  inputValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputValueReadonly: {
    fontSize: 15,
    fontWeight: '500',
    color: '#94A3B8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputActive: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  invoicesList: {
    gap: 14,
  },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 10,
  },
  invoiceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  invoiceRef: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  invoiceDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '900',
  },
  invoiceDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  btnPay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 6,
  },
  btnPayText: {
    color: '#FFFFFF',
    fontSize: 14,
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
    textAlign: 'center',
    marginTop: 8,
  },
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  optionsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  optionRight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10B981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  checkoutForm: {
    gap: 16,
    paddingBottom: 40,
  },
  creditCard: {
    height: 180,
    backgroundColor: '#0F172A', // Slate 900 dark card for contrast
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrandName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardNumberText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 3,
    textAlign: 'center',
    marginVertical: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardValueText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  billingSummary: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  billLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  billAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 4,
  },
  billDesc: {
    fontSize: 13,
    color: '#475569',
    marginTop: 6,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnSubmit: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});
