import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator, Dimensions } from 'react-native';
import { useApp, Invoice } from '@/context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { userRole, setUserRole, invoices, payInvoice } = useApp();
  
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

  // Calculations
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const unpaidCount = invoices.filter(i => i.status === 'unpaid').length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Espace Facturation</Text>
          <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* User Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {userRole === 'breeder' ? '🚜' : '🩺'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userRole === 'breeder' ? 'Jean Éleveur' : 'Dr. Diallo'}
              </Text>
              <Text style={styles.profileRole}>
                Profil : {userRole === 'breeder' ? 'Éleveur de bétail' : 'Médecin Vétérinaire'}
              </Text>
              <Text style={styles.profileEmail}>
                {userRole === 'breeder' ? 'jean.eleveur@elevconnect.com' : 'dr.diallo@elevconnect.com'}
              </Text>
            </View>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Réglé</Text>
              <Text style={styles.statValue}>{(totalPaid).toLocaleString()} F</Text>
            </View>
            <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.05)' }]}>
              <Text style={styles.statLabel}>Factures en Attente</Text>
              <Text style={[styles.statValue, unpaidCount > 0 && { color: '#EF4444' }]}>{unpaidCount}</Text>
            </View>
          </View>

          {/* Invoices List */}
          <Text style={styles.sectionTitle}>Historique des Transactions</Text>
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
                <Ionicons name="card-outline" size={44} color="#475569" />
                <Text style={styles.emptyText}>Aucune transaction enregistrée.</Text>
              </View>
            )}
          </View>

          {/* Quick options */}
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Options & Test</Text>
            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => setUserRole(userRole === 'breeder' ? 'vet' : 'breeder')}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="swap-horizontal" size={20} color="#10B981" />
                <Text style={styles.optionText}>Basculer le rôle utilisateur</Text>
              </View>
              <Text style={styles.optionRight}>{userRole.toUpperCase()}</Text>
            </TouchableOpacity>
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
                <Ionicons name="close" size={24} color="#FFFFFF" />
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
  btnLogout: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    gap: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  avatarText: {
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileRole: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  invoicesList: {
    gap: 14,
  },
  invoiceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  invoiceDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  invoiceAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  invoiceDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  btnPay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 6,
  },
  btnPayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
  },
  optionsContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  optionRight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
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
    color: '#FFFFFF',
  },
  checkoutForm: {
    gap: 16,
    paddingBottom: 40,
  },
  creditCard: {
    height: 180,
    backgroundColor: '#059669', // Emerald 600 dark green card
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
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
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardNumberText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2.5,
    textAlign: 'center',
    marginVertical: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: '#A7F3D0',
    fontSize: 8,
    fontWeight: '600',
  },
  cardValueText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  billingSummary: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  billLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  billAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 4,
  },
  billDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
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
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 12,
  },
});
