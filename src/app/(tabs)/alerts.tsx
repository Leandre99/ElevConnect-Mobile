import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Image, Dimensions, Platform } from 'react-native';
import { useApp, Alert as AlertType, Diagnostic } from '@/context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const COMMON_DISEASES = [
  { nom: 'Coccidiose', symptomes: 'Diarrhée liquide, plumes ébouriffées, léthargie' },
  { nom: 'Piétin', symptomes: 'Boitement, inflammation du sabot, odeur forte' },
  { nom: 'Pseudo-peste aviaire (Newcastle)', symptomes: 'Difficultés respiratoires, torsion du cou, ponte nulle' },
  { nom: 'Mastite', symptomes: 'Mamelle chaude, gonflée, lait grumeleux' },
  { nom: 'Fièvre aphteuse', symptomes: 'Aphtes sur la langue et les sabots, forte salivation' }
];

export default function AlertsScreen() {
  const { userRole, alerts, addAlert, treatAlert, scheduleMeeting, farms, animals } = useApp();

  // Navigation / Modal States
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailAlert, setDetailAlert] = useState<AlertType | null>(null);
  const [diagModalVisible, setDiagModalVisible] = useState(false);
  const [meetingModalVisible, setMeetingModalVisible] = useState(false);
  
  // Video Call Simulator State
  const [activeCallAlert, setActiveCallAlert] = useState<AlertType | null>(null);
  const [canvasDrawing, setCanvasDrawing] = useState<{ x: number; y: number }[]>([]);

  // Breeder Form State
  const [selectedFarmId, setSelectedFarmId] = useState(farms[0]?.id || '');
  const [selectedAnimalId, setSelectedAnimalId] = useState(animals[0]?.id || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [description, setDescription] = useState('');
  const [photoMocked, setPhotoMocked] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Vet Form States
  const [selectedDisease, setSelectedDisease] = useState(COMMON_DISEASES[0].nom);
  const [treatment, setTreatment] = useState('');
  const [meetingDate, setMeetingDate] = useState('2026-06-10 à 16:30');

  // Simulator for Photo Capture & AI Disease analysis
  const handleSimulatePhoto = () => {
    setPhotoMocked(true);
    // Simulate AI computing
    Alert.alert("Analyse IA en cours", "Recherche de correspondances symptomatologiques...");
    setTimeout(() => {
      // Suggest diseases based on animal type
      const animal = animals.find(a => a.id === selectedAnimalId);
      if (animal?.espece === 'Volaille') {
        setAiSuggestions(['Coccidiose aviaire (85%)', 'Pseudo-peste (42%)']);
      } else if (animal?.espece === 'Bovin' || animal?.espece === 'Ovin') {
        setAiSuggestions(['Piétin infectieux (78%)', 'Gale sarcoptique (30%)']);
      } else {
        setAiSuggestions(['Coryza du lapin (90%)', 'Teigne (55%)']);
      }
    }, 1500);
  };

  const handleCreateAlert = () => {
    if (!description) {
      Alert.alert('Erreur', 'Veuillez décrire les symptômes.');
      return;
    }
    const farm = farms.find(f => f.id === selectedFarmId);
    const animal = animals.find(a => a.id === selectedAnimalId);

    addAlert({
      description,
      priority,
      espece: animal?.espece || 'Inconnue',
      race: animal?.race || 'Inconnue',
      ferme_id: selectedFarmId,
      media: photoMocked ? 'mocked_symptom_photo.jpg' : undefined,
    });

    // Reset Form
    setDescription('');
    setPhotoMocked(false);
    setAiSuggestions([]);
    setCreateModalVisible(false);
    Alert.alert('Succès', 'Alerte transmise aux vétérinaires partenaires !');
  };

  const handleSaveDiagnostic = () => {
    if (!detailAlert) return;
    if (!treatment) {
      Alert.alert('Erreur', 'Veuillez prescrire un traitement.');
      return;
    }

    const newDiagnostic: Diagnostic = {
      maladie: selectedDisease,
      traitement: treatment,
      veterinaire: 'Dr. Diallo',
      date: new Date().toISOString().split('T')[0],
    };

    treatAlert(detailAlert.id, newDiagnostic);
    setTreatment('');
    setDiagModalVisible(false);
    setDetailAlert(null);
    Alert.alert('Diagnostic Enregistré', 'Facture et traitement envoyés à l\'éleveur.');
  };

  const handleScheduleMeeting = () => {
    if (!detailAlert) return;
    scheduleMeeting(
      detailAlert.id,
      meetingDate,
      `https://meet.jit.si/elevconnect-consult-${detailAlert.id}`
    );
    setMeetingModalVisible(false);
    Alert.alert('Consultation Programmée', 'Un lien visio a été ajouté à cette alerte.');
  };

  const simulateDraw = (x: number, y: number) => {
    // Add point to draw mockup overlay
    setCanvasDrawing([...canvasDrawing, { x, y }]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Santé & Téléconsultation</Text>
          {userRole === 'breeder' && (
            <TouchableOpacity 
              style={styles.btnNewAlert}
              onPress={() => setCreateModalVisible(true)}
            >
              <Ionicons name="warning-outline" size={18} color="#FFFFFF" />
              <Text style={styles.btnNewAlertText}>Signaler Cas</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Active alerts List */}
          <Text style={styles.sectionTitle}>Historique des alertes sanitaires</Text>
          <View style={styles.alertsContainer}>
            {alerts.map(alert => {
              const farmName = farms.find(f => f.id === alert.ferme_id)?.nomferme || 'Ferme';
              const isTreated = alert.status === 'Traitée';

              return (
                <TouchableOpacity
                  key={alert.id}
                  style={styles.alertCard}
                  onPress={() => setDetailAlert(alert)}
                >
                  <View style={styles.alertCardTop}>
                    <View style={styles.alertCardInfo}>
                      <Text style={styles.alertCardBreed}>{alert.espece} ({alert.race})</Text>
                      <Text style={styles.alertCardFarm}>🏢 {farmName} • {alert.date}</Text>
                    </View>
                    
                    <View style={[
                      styles.statusPill, 
                      isTreated ? styles.statusTreated : styles.statusUntreated
                    ]}>
                      <Text style={[styles.statusText, isTreated ? { color: '#10B981' } : { color: '#EF4444' }]}>
                        {alert.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.alertCardDesc} numberOfLines={2}>
                    {alert.description}
                  </Text>

                  {alert.meeting_date && (
                    <View style={styles.meetingPill}>
                      <Ionicons name="videocam" size={14} color="#8B5CF6" />
                      <Text style={styles.meetingPillText}>Visio : {alert.meeting_date}</Text>
                    </View>
                  )}

                  <View style={styles.alertCardBottom}>
                    <View style={[
                      styles.priorityTag,
                      alert.priority === 'high' && { backgroundColor: 'rgba(239, 68, 68, 0.12)' },
                      alert.priority === 'medium' && { backgroundColor: 'rgba(245, 158, 11, 0.12)' },
                      alert.priority === 'low' && { backgroundColor: 'rgba(59, 130, 246, 0.12)' },
                    ]}>
                      <Text style={[
                        styles.priorityTagText,
                        alert.priority === 'high' && { color: '#EF4444' },
                        alert.priority === 'medium' && { color: '#F59E0B' },
                        alert.priority === 'low' && { color: '#3B82F6' },
                      ]}>
                        PRIORITÉ : {alert.priority.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.alertDetailsLink}>Détails →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* ================= DETAIL MODAL & VET ACTION ================= */}
      <Modal visible={detailAlert !== null} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          {detailAlert && (
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Détails de l'Alerte</Text>
                <TouchableOpacity onPress={() => setDetailAlert(null)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.detailScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Animal / Groupe :</Text>
                  <Text style={styles.detailValue}>{detailAlert.espece} ({detailAlert.race})</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ferme concernée :</Text>
                  <Text style={styles.detailValue}>
                    {farms.find(f => f.id === detailAlert.ferme_id)?.nomferme || 'Inconnue'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Priorité :</Text>
                  <Text style={[
                    styles.detailValue,
                    detailAlert.priority === 'high' && { color: '#EF4444', fontWeight: 'bold' }
                  ]}>
                    {detailAlert.priority.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Symptômes signalés :</Text>
                  <Text style={styles.detailDesc}>{detailAlert.description}</Text>
                </View>

                {/* Media symptom mockup */}
                {detailAlert.media && (
                  <View style={styles.photoContainer}>
                    <Text style={styles.detailLabel}>Photo jointe :</Text>
                    <View style={styles.mockPhoto}>
                      <Ionicons name="image" size={32} color="#475569" />
                      <Text style={styles.mockPhotoText}>[Image : Lésions cutanées de l'animal]</Text>
                    </View>
                  </View>
                )}

                {/* Scheduled Call Banner */}
                {detailAlert.meeting_date && (
                  <View style={styles.scheduledCallBanner}>
                    <View style={styles.scheduledCallHeader}>
                      <Ionicons name="videocam" size={20} color="#8B5CF6" />
                      <Text style={styles.scheduledCallTitle}>Téléconsultation Planifiée</Text>
                    </View>
                    <Text style={styles.scheduledCallDate}>{detailAlert.meeting_date}</Text>
                    <TouchableOpacity 
                      style={styles.btnJoinCall}
                      onPress={() => {
                        setActiveCallAlert(detailAlert);
                        setDetailAlert(null);
                      }}
                    >
                      <Text style={styles.btnJoinCallText}>Rejoindre l'appel vidéo</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* IF ALERTE TRAITEE: Show Diagnostic & Prescription */}
                {detailAlert.status === 'Traitée' && detailAlert.diagnostic && (
                  <View style={styles.diagnosticResultCard}>
                    <View style={styles.diagnosticHeader}>
                      <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                      <Text style={styles.diagnosticTitle}>Diagnostic Vétérinaire</Text>
                    </View>
                    <View style={styles.diagInfoRow}>
                      <Text style={styles.diagLabel}>Maladie diagnostiquée :</Text>
                      <Text style={styles.diagValue}>{detailAlert.diagnostic.maladie}</Text>
                    </View>
                    <View style={styles.diagInfoRow}>
                      <Text style={styles.diagLabel}>Vétérinaire traitant :</Text>
                      <Text style={styles.diagValue}>{detailAlert.diagnostic.veterinaire}</Text>
                    </View>
                    <View style={styles.diagInfoRow}>
                      <Text style={styles.diagLabel}>Date :</Text>
                      <Text style={styles.diagValue}>{detailAlert.diagnostic.date}</Text>
                    </View>
                    <View style={[styles.diagInfoRow, { flexDirection: 'column', alignItems: 'flex-start', gap: 6 }]}>
                      <Text style={styles.diagLabel}>Prescription / Traitement :</Text>
                      <Text style={styles.prescriptionText}>{detailAlert.diagnostic.traitement}</Text>
                    </View>
                  </View>
                )}

                {/* IF ALERTE NON TRAITEE & USER IS VET: Show Actions */}
                {detailAlert.status === 'Non traitée' && userRole === 'vet' && (
                  <View style={styles.vetActions}>
                    <TouchableOpacity 
                      style={styles.btnVetCall}
                      onPress={() => setMeetingModalVisible(true)}
                    >
                      <Ionicons name="videocam-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.btnVetText}>Planifier Appel Visio</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.btnVetTreat}
                      onPress={() => setDiagModalVisible(true)}
                    >
                      <Ionicons name="checkbox-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.btnVetText}>Établir Diagnostic</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>

      {/* ================= MODAL CREATE ALERT (BREEDER) ================= */}
      <Modal visible={createModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Signaler Anomalie Santé</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Sélectionnez l'exploitation</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {farms.map(f => (
                    <TouchableOpacity
                      key={f.id}
                      style={[styles.selectChip, selectedFarmId === f.id && styles.selectChipActive]}
                      onPress={() => setSelectedFarmId(f.id)}
                    >
                      <Text style={[styles.selectChipText, selectedFarmId === f.id && styles.selectChipTextActive]}>
                        {f.nomferme}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Sélectionnez le lot ou animal</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {animals.filter(a => a.ferme_id === selectedFarmId).map(a => (
                    <TouchableOpacity
                      key={a.id}
                      style={[styles.selectChip, selectedAnimalId === a.id && styles.selectChipActive]}
                      onPress={() => setSelectedAnimalId(a.id)}
                    >
                      <Text style={[styles.selectChipText, selectedAnimalId === a.id && styles.selectChipTextActive]}>
                        {a.nombre > 1 ? `Lot: ${a.nombre} ${a.espece}s` : `1 ${a.espece}`} ({a.race})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Niveau d'Urgence (Priorité)</Text>
                <View style={styles.prioritySelector}>
                  <TouchableOpacity
                    style={[styles.prioBtn, priority === 'low' && styles.prioBtnLowActive]}
                    onPress={() => setPriority('low')}
                  >
                    <Text style={[styles.prioBtnText, priority === 'low' && { color: '#FFFFFF' }]}>FAIBLE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.prioBtn, priority === 'medium' && styles.prioBtnMedActive]}
                    onPress={() => setPriority('medium')}
                  >
                    <Text style={[styles.prioBtnText, priority === 'medium' && { color: '#FFFFFF' }]}>MOYENNE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.prioBtn, priority === 'high' && styles.prioBtnHighActive]}
                    onPress={() => setPriority('high')}
                  >
                    <Text style={[styles.prioBtnText, priority === 'high' && { color: '#FFFFFF' }]}>URGENT</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description des symptômes</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextarea]}
                  placeholder="Expliquez en détail ce que vous observez (fièvre, baisse de ponte, blessure, toux...)"
                  placeholderTextColor="#64748B"
                  multiline={true}
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Innovative Camera & Scanner AI Mockup */}
              <View style={styles.cameraScannerSection}>
                <Text style={styles.formLabel}>Photo des symptômes</Text>
                <TouchableOpacity style={styles.btnCameraSim} onPress={handleSimulatePhoto}>
                  <Ionicons name="camera" size={24} color="#10B981" />
                  <Text style={styles.btnCameraSimText}>
                    {photoMocked ? "Photo enregistrée" : "Prendre / Envoyer une photo"}
                  </Text>
                </TouchableOpacity>

                {photoMocked && (
                  <View style={styles.aiResultBox}>
                    <Text style={styles.aiResultTitle}>🔍 Analyse IA des Symptômes :</Text>
                    {aiSuggestions.length > 0 ? (
                      aiSuggestions.map((sug, i) => (
                        <Text key={i} style={styles.aiResultText}>• {sug}</Text>
                      ))
                    ) : (
                      <Text style={styles.aiResultText}>Analyse...</Text>
                    )}
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.btnSubmit} onPress={handleCreateAlert}>
                <Text style={styles.btnSubmitText}>Transmettre Alerte</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL SCHEDULER (VET) ================= */}
      <Modal visible={meetingModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Programmer Téléconsultation</Text>
              <TouchableOpacity onPress={() => setMeetingModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date & Heure proposées</Text>
                <TextInput
                  style={styles.formInput}
                  value={meetingDate}
                  onChangeText={setMeetingDate}
                />
              </View>
              
              <Text style={styles.infoText}>
                L'éleveur recevra une notification push et pourra rejoindre la réunion en un clic depuis sa fiche d'alerte.
              </Text>

              <TouchableOpacity style={styles.btnSubmit} onPress={handleScheduleMeeting}>
                <Text style={styles.btnSubmitText}>Confirmer le rendez-vous</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL ESTABLISH DIAGNOSTIC (VET) ================= */}
      <Modal visible={diagModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Diagnostiquer l'Animal</Text>
              <TouchableOpacity onPress={() => setDiagModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Sélectionnez la maladie</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {COMMON_DISEASES.map(dis => (
                    <TouchableOpacity
                      key={dis.nom}
                      style={[styles.selectChip, selectedDisease === dis.nom && styles.selectChipActive]}
                      onPress={() => setSelectedDisease(dis.nom)}
                    >
                      <Text style={[styles.selectChipText, selectedDisease === dis.nom && styles.selectChipTextActive]}>
                        {dis.nom}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Traitement et ordonnance</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextarea]}
                  placeholder="Posologie, durée du traitement, médicaments nécessaires..."
                  placeholderTextColor="#64748B"
                  multiline={true}
                  numberOfLines={4}
                  value={treatment}
                  onChangeText={setTreatment}
                />
              </View>

              <Text style={styles.infoText}>
                La validation du diagnostic clôturera l'alerte et générera automatiquement la facture correspondante.
              </Text>

              <TouchableOpacity style={styles.btnSubmit} onPress={handleSaveDiagnostic}>
                <Text style={styles.btnSubmitText}>Enregistrer & Clôturer</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= FULLSCREEN VIDEO CALL SIMULATOR (WEBRTC) ================= */}
      <Modal visible={activeCallAlert !== null} animationType="fade" transparent={false}>
        <View style={styles.callContainer}>
          {/* Main video area: Breeder feeds camera, Vet sees it */}
          <View style={styles.mainVideoFrame}>
            {/* Background represents Breeder's live feed of the animal */}
            <View style={styles.videoPlaceholderBg}>
              <Ionicons name="paw" size={80} color="rgba(255, 255, 255, 0.15)" />
              <Text style={styles.videoText}>Caméra de l'éleveur (Vidéo en direct)</Text>
              <Text style={styles.videoTextSub}>Sujet : {activeCallAlert?.espece} ({activeCallAlert?.race})</Text>
            </View>

            {/* Drawing overlay simulator */}
            <TouchableOpacity 
              activeOpacity={1}
              style={StyleSheet.absoluteFill} 
              onPress={(e) => {
                if (userRole === 'vet') {
                  simulateDraw(e.nativeEvent.locationX, e.nativeEvent.locationY);
                }
              }}
            >
              {canvasDrawing.map((pt, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.drawPoint, 
                    { left: pt.x - 8, top: pt.y - 8 }
                  ]} 
                />
              ))}
            </TouchableOpacity>
          </View>

          {/* Picture-in-Picture window: Vet camera */}
          <View style={styles.pipFrame}>
            <View style={styles.pipContent}>
              <Text style={styles.pipText}>Dr. Diallo 🩺</Text>
            </View>
          </View>

          {/* Drawing Tool banner (Visible to Vet) */}
          {userRole === 'vet' && (
            <View style={styles.drawControls}>
              <Text style={styles.drawTitle}>🎨 Mode Annotation Vétérinaire Actif</Text>
              <Text style={styles.drawSubtitle}>Tapez sur l'écran pour indiquer une zone critique.</Text>
              <TouchableOpacity 
                style={styles.btnClearDraw}
                onPress={() => setCanvasDrawing([])}
              >
                <Text style={styles.btnClearDrawText}>Effacer les marques</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Drawing Tool banner (Visible to Breeder) */}
          {userRole === 'breeder' && canvasDrawing.length > 0 && (
            <View style={[styles.drawControls, { backgroundColor: 'rgba(239, 68, 68, 0.85)' }]}>
              <Text style={styles.drawTitle}>⚠️ Indication du Vétérinaire en Direct</Text>
              <Text style={styles.drawSubtitle}>Veuillez inspecter la zone encerclée en rouge.</Text>
            </View>
          )}

          {/* Call actions overlay at the bottom */}
          <View style={styles.callActionBar}>
            <TouchableOpacity style={styles.callActionBtn}>
              <Ionicons name="mic" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.callActionBtn, styles.callActionBtnEnd]}
              onPress={() => {
                setCanvasDrawing([]);
                setActiveCallAlert(null);
              }}
            >
              <Ionicons name="call" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.callActionBtn}>
              <Ionicons name="videocam" size={24} color="#FFFFFF" />
            </TouchableOpacity>
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
  btnNewAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981', // Emerald for new alert instead of red to make it positive
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnNewAlertText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
  alertsContainer: {
    gap: 16,
  },
  alertCard: {
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
  alertCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertCardInfo: {
    flex: 1,
    marginRight: 10,
    gap: 2,
  },
  alertCardBreed: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  alertCardFarm: {
    fontSize: 12,
    color: '#64748B',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTreated: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusUntreated: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  alertCardDesc: {
    fontSize: 13,
    color: '#475569',
    marginTop: 10,
    lineHeight: 18,
  },
  meetingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  meetingPillText: {
    color: '#8B5CF6',
    fontSize: 11,
    fontWeight: '700',
  },
  alertCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  alertDetailsLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
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
  selectChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  selectChipText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  selectChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  prioBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  prioBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  prioBtnLowActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  prioBtnMedActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  prioBtnHighActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  cameraScannerSection: {
    gap: 8,
  },
  btnCameraSim: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  btnCameraSimText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  aiResultBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiResultTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 6,
  },
  aiResultText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
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
  detailScroll: {
    gap: 14,
    paddingBottom: 40,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  detailBlock: {
    gap: 6,
  },
  detailDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
  },
  photoContainer: {
    gap: 8,
  },
  mockPhoto: {
    height: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mockPhotoText: {
    fontSize: 11,
    color: '#64748B',
  },
  scheduledCallBanner: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  scheduledCallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduledCallTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  scheduledCallDate: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  btnJoinCall: {
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnJoinCallText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  diagnosticResultCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginTop: 10,
  },
  diagnosticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diagnosticTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
  },
  diagInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diagLabel: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
  },
  diagValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  prescriptionText: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 18,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  btnVetCall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 14,
  },
  btnVetTreat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
  },
  btnVetText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  callContainer: {
    flex: 1,
    backgroundColor: '#0F172A', // Video call background stays dark
    justifyContent: 'space-between',
  },
  mainVideoFrame: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  videoPlaceholderBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  videoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  videoTextSub: {
    color: '#94A3B8',
    fontSize: 13,
  },
  drawPoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pipFrame: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 100,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  pipContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  drawControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 130,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  drawTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  drawSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  btnClearDraw: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  btnClearDrawText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '700',
  },
  callActionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    paddingTop: 16,
    backgroundColor: '#0F172A',
  },
  callActionBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callActionBtnEnd: {
    backgroundColor: '#EF4444',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});
