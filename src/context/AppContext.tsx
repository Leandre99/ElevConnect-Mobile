import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export interface Farm {
  id: string;
  nomferme: string;
  description: string;
  adresse: string;
  is_active: boolean;
}

export interface Animal {
  id: string;
  espece: string;
  race: string;
  age: number; // in months or days
  nombre: number; // >1 = Lot, 1 = Individuel
  ferme_id: string;
  date_entree: string;
  maturation_jours: number;
  tags?: string; // ear tag for individual
}

export interface Task {
  id: string;
  nomtache: string;
  espece: string;
  race: string;
  quantite: string;
  type: 'alimentation' | 'vaccin' | 'soin' | 'controle';
  status: 'pending' | 'completed';
  affichage_date: string;
  ferme_id: string;
  age_target: string;
}

export interface Diagnostic {
  maladie: string;
  traitement: string;
  veterinaire: string;
  date: string;
}

export interface Alert {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'Non traitée' | 'Traitée';
  espece: string;
  race: string;
  ferme_id: string;
  date: string;
  media?: string;
  diagnostic?: Diagnostic;
  meeting_date?: string;
  meeting_url?: string;
}

export interface Invoice {
  id: string;
  amount: number;
  status: 'paid' | 'unpaid';
  description: string;
  date: string;
  veterinaire: string;
}

interface AppContextProps {
  userRole: 'breeder' | 'vet';
  setUserRole: (role: 'breeder' | 'vet') => void;
  farms: Farm[];
  addFarm: (farm: Omit<Farm, 'id' | 'is_active'>) => void;
  animals: Animal[];
  addAnimal: (animal: Omit<Animal, 'id'>) => void;
  reportMortality: (animalId: string, count: number) => void;
  tasks: Task[];
  toggleTask: (taskId: string) => void;
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'status' | 'date'>) => void;
  treatAlert: (alertId: string, diagnostic: Diagnostic) => void;
  scheduleMeeting: (alertId: string, dateStr: string, url: string) => void;
  invoices: Invoice[];
  payInvoice: (invoiceId: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<'breeder' | 'vet'>('breeder');
  
  // Mock Farms
  const [farms, setFarms] = useState<Farm[]>([
    {
      id: 'f1',
      nomferme: 'Ferme GreenValley',
      description: 'Production mixte lait et aviculture durable.',
      adresse: 'Zone Agro-Industrielle, Piste 4',
      is_active: true,
    },
    {
      id: 'f2',
      nomferme: 'Ranch du Sahel',
      description: 'Élevage ovin et caprin rustique de prestige.',
      adresse: 'Route de Louga, km 12',
      is_active: true,
    }
  ]);

  // Mock Animals (Groups & Individuals)
  const [animals, setAnimals] = useState<Animal[]>([
    {
      id: 'a1',
      espece: 'Volaille',
      race: 'Pondeuse (Isa Brown)',
      age: 6, // 6 months
      nombre: 300, // Lot mode!
      ferme_id: 'f1',
      date_entree: '2026-01-10',
      maturation_jours: 540,
    },
    {
      id: 'a2',
      espece: 'Bovin',
      race: 'Goudali',
      age: 24, // 24 months
      nombre: 1, // Individual mode
      ferme_id: 'f1',
      date_entree: '2024-06-10',
      maturation_jours: 1095,
      tags: 'GD-908',
    },
    {
      id: 'a3',
      espece: 'Ovin',
      race: 'Ladoum',
      age: 10,
      nombre: 1,
      ferme_id: 'f2',
      date_entree: '2025-08-15',
      maturation_jours: 450,
      tags: 'LD-777',
    },
    {
      id: 'a4',
      espece: 'Lapin',
      race: 'Néo-zélandais',
      age: 2, // 2 months
      nombre: 45, // Lot
      ferme_id: 'f1',
      date_entree: '2026-04-10',
      maturation_jours: 90,
    }
  ]);

  // Mock Tasks based on lifecycle
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 't1',
      nomtache: 'Nourrissage - Aliment de ponte',
      espece: 'Volaille',
      race: 'Pondeuse (Isa Brown)',
      quantite: '120g / oiseau',
      type: 'alimentation',
      status: 'pending',
      affichage_date: '2026-06-10',
      ferme_id: 'f1',
      age_target: '6 mois',
    },
    {
      id: 't2',
      nomtache: 'Rappel Vaccin Pseudo-peste',
      espece: 'Volaille',
      race: 'Pondeuse (Isa Brown)',
      quantite: '1 dose/sujet',
      type: 'vaccin',
      status: 'completed',
      affichage_date: '2026-06-10',
      ferme_id: 'f1',
      age_target: '6 mois',
    },
    {
      id: 't3',
      nomtache: 'Inspection des mamelles & traite',
      espece: 'Bovin',
      race: 'Goudali',
      quantite: '2 fois / jour',
      type: 'controle',
      status: 'pending',
      affichage_date: '2026-06-10',
      ferme_id: 'f1',
      age_target: '24 mois',
    },
    {
      id: 't4',
      nomtache: 'Pesée mensuelle et vitamines',
      espece: 'Ovin',
      race: 'Ladoum',
      quantite: '10ml',
      type: 'soin',
      status: 'pending',
      affichage_date: '2026-06-10',
      ferme_id: 'f2',
      age_target: '10 mois',
    },
    {
      id: 't5',
      nomtache: 'Nettoyage des clapiers et apport luzerne',
      espece: 'Lapin',
      race: 'Néo-zélandais',
      quantite: '5kg total',
      type: 'alimentation',
      status: 'completed',
      affichage_date: '2026-06-10',
      ferme_id: 'f1',
      age_target: '2 mois',
    }
  ]);

  // Mock Alerts
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'al1',
      description: 'Léthargie générale et baisse soudaine de la ponte dans le lot.',
      priority: 'high',
      status: 'Non traitée',
      espece: 'Volaille',
      race: 'Pondeuse (Isa Brown)',
      ferme_id: 'f1',
      date: '2026-06-09',
    },
    {
      id: 'al2',
      description: 'Léger boitement patte arrière gauche.',
      priority: 'medium',
      status: 'Traitée',
      espece: 'Ovin',
      race: 'Ladoum',
      ferme_id: 'f2',
      date: '2026-06-05',
      diagnostic: {
        maladie: 'Piétin modéré',
        traitement: 'Bain de sabot au sulfate de zinc + pommade antibiotique pendant 5 jours.',
        veterinaire: 'Dr. Diallo',
        date: '2026-06-06',
      }
    }
  ]);

  // Mock Invoices
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'i1',
      amount: 15000, // CFA or unit currency
      status: 'unpaid',
      description: 'Consultation à distance et prescription Piétin - Ovin LD-777',
      date: '2026-06-06',
      veterinaire: 'Dr. Diallo',
    },
    {
      id: 'i2',
      amount: 25000,
      status: 'paid',
      description: 'Visite médicale de routine bovins de GreenValley',
      date: '2026-05-20',
      veterinaire: 'Dr. Diallo',
    }
  ]);

  // Actions
  const addFarm = (farm: Omit<Farm, 'id' | 'is_active'>) => {
    const newFarm: Farm = {
      ...farm,
      id: `f${farms.length + 1}`,
      is_active: true,
    };
    setFarms([...farms, newFarm]);
  };

  const addAnimal = (animal: Omit<Animal, 'id'>) => {
    const newAnimal: Animal = {
      ...animal,
      id: `a${animals.length + 1}`,
    };
    setAnimals([...animals, newAnimal]);

    // Automatically generate first task template for this new animal
    const newTask: Task = {
      id: `t${tasks.length + 1}`,
      nomtache: `Contrôle d'accueil & acclimatation`,
      espece: animal.espece,
      race: animal.race,
      quantite: 'N/A',
      type: 'controle',
      status: 'pending',
      affichage_date: new Date().toISOString().split('T')[0],
      ferme_id: animal.ferme_id,
      age_target: `${animal.age} mois`,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const reportMortality = (animalId: string, count: number) => {
    setAnimals(prev =>
      prev
        .map(ani => {
          if (ani.id === animalId) {
            const newNombre = Math.max(0, ani.nombre - count);
            return { ...ani, nombre: newNombre };
          }
          return ani;
        })
        .filter(ani => ani.nombre > 0) // Remove if lot drops to 0
    );
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t))
    );
  };

  const addAlert = (alert: Omit<Alert, 'id' | 'status' | 'date'>) => {
    const newAlert: Alert = {
      ...alert,
      id: `al${alerts.length + 1}`,
      status: 'Non traitée',
      date: new Date().toISOString().split('T')[0],
    };
    setAlerts([newAlert, ...alerts]);
  };

  const treatAlert = (alertId: string, diagnostic: Diagnostic) => {
    const targetAlert = alerts.find(a => a.id === alertId);
    const espece = targetAlert?.espece || 'Inconnu';
    const race = targetAlert?.race || 'Inconnu';

    setAlerts(prev =>
      prev.map(al => (al.id === alertId ? { ...al, status: 'Traitée', diagnostic } : al))
    );

    // Automatically create a new invoice for this veterinary treatment
    const newInvoice: Invoice = {
      id: `i${invoices.length + 1}`,
      amount: Math.floor(Math.random() * 20000) + 10000, // random price between 10k and 30k
      status: 'unpaid',
      description: `Traitement pour : ${diagnostic.maladie} (${espece} ${race})`,
      date: new Date().toISOString().split('T')[0],
      veterinaire: diagnostic.veterinaire,
    };
    setInvoices(prev => [newInvoice, ...prev]);
  };

  const scheduleMeeting = (alertId: string, dateStr: string, url: string) => {
    setAlerts(prev =>
      prev.map(al => (al.id === alertId ? { ...al, meeting_date: dateStr, meeting_url: url } : al))
    );
  };

  const payInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => (inv.id === invoiceId ? { ...inv, status: 'paid' } : inv)));
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        farms,
        addFarm,
        animals,
        addAnimal,
        reportMortality,
        tasks,
        toggleTask,
        alerts,
        addAlert,
        treatAlert,
        scheduleMeeting,
        invoices,
        payInvoice,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
