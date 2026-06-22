import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../api/client';

// Types updated to match Backend Prisma Schema
export interface Farm {
  id: string;
  nomferme: string;
  description?: string;
  adresse?: string;
  is_active: boolean;
  userId: string;
}

export interface Animal {
  id: string;
  espece: string;
  race: string;
  age: number; // in months or days
  nombre: number; // >1 = Lot, 1 = Individuel
  fermeId: string;
  dateEntree: string;
  maturationJours: number;
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
  affichageDate: string;
  fermeId: string;
  ageTarget: string;
}

export interface Diagnostic {
  id: string;
  alertId: string;
  maladie: string;
  traitement: string;
  veterinaireId: string;
  date: string;
}

export interface Alert {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'Non traitée' | 'Traitée';
  espece: string;
  race: string;
  fermeId: string;
  date: string;
  media?: string;
  diagnostics?: Diagnostic[];
  meetingDate?: string;
  meetingUrl?: string;
}

export interface Invoice {
  id: string;
  amount: number;
  status: 'paid' | 'unpaid';
  description: string;
  date: string;
  veterinaire: string;
  userId: string;
}

interface AppContextProps {
  userRole: 'breeder' | 'vet';
  setUserRole: (role: 'breeder' | 'vet') => void;
  isLoading: boolean;
  farms: Farm[];
  addFarm: (farm: Omit<Farm, 'id' | 'is_active' | 'userId'>) => Promise<void>;
  animals: Animal[];
  addAnimal: (animal: Omit<Animal, 'id'>) => Promise<void>;
  reportMortality: (animalId: string, count: number) => Promise<void>;
  tasks: Task[];
  toggleTask: (taskId: string) => Promise<void>;
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'status' | 'date'>) => Promise<void>;
  treatAlert: (alertId: string, diagnostic: Omit<Diagnostic, 'id' | 'alertId'>) => Promise<void>;
  scheduleMeeting: (alertId: string, dateStr: string, url: string) => Promise<void>;
  invoices: Invoice[];
  payInvoice: (invoiceId: string) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// For demo purposes, we'll hardcode the User IDs for Breeder and Vet since we don't have a real login session yet.
// In a real app, this comes from authentication (JWT).
const DEMO_BREEDER_ID = "replace-me"; // Will be fetched
const DEMO_VET_ID = "replace-me";     // Will be fetched

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<'breeder' | 'vet'>('breeder');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [farms, setFarms] = useState<Farm[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [breederId, setBreederId] = useState<string>('');
  const [vetId, setVetId] = useState<string>('');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch all base data in parallel
        const [usersData, farmsData, animalsData, tasksData, alertsData, diagnosticsData, invoicesData] = await Promise.all([
          fetchApi('/users'),
          fetchApi('/fermes'),
          fetchApi('/animals'),
          fetchApi('/tasks'),
          fetchApi('/alerts'),
          fetchApi('/diagnostics'),
          fetchApi('/invoices')
        ]);

        // Setup demo users
        const breeder = usersData.find((u: any) => u.role === 'breeder');
        const vet = usersData.find((u: any) => u.role === 'vet');
        if (breeder) setBreederId(breeder.id);
        if (vet) setVetId(vet.id);

        setFarms(farmsData);
        setAnimals(animalsData);
        setTasks(tasksData);
        setInvoices(invoicesData);

        // Map diagnostics to alerts
        const alertsWithDiag = alertsData.map((alert: Alert) => {
          return {
            ...alert,
            diagnostics: diagnosticsData.filter((d: Diagnostic) => d.alertId === alert.id)
          };
        });
        // Sort alerts by latest first
        alertsWithDiag.sort((a: Alert, b: Alert) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setAlerts(alertsWithDiag);
      } catch (error) {
        console.error('Failed to fetch data from backend:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Actions mapped to Backend
  const addFarm = async (farm: Omit<Farm, 'id' | 'is_active' | 'userId'>) => {
    try {
      const newFarm = await fetchApi('/fermes', {
        method: 'POST',
        body: JSON.stringify({ ...farm, userId: breederId }),
      });
      setFarms(prev => [...prev, newFarm]);
    } catch (e) {
      console.error(e);
    }
  };

  const addAnimal = async (animal: Omit<Animal, 'id'>) => {
    try {
      const newAnimal = await fetchApi('/animals', {
        method: 'POST',
        body: JSON.stringify(animal),
      });
      setAnimals(prev => [...prev, newAnimal]);

      // Automatically generate first task template for this new animal
      const newTask = await fetchApi('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          nomtache: `Contrôle d'accueil & acclimatation`,
          espece: animal.espece,
          race: animal.race,
          quantite: 'N/A',
          type: 'controle',
          status: 'pending',
          affichageDate: new Date().toISOString().split('T')[0],
          fermeId: animal.fermeId,
          ageTarget: `${animal.age} mois`,
        })
      });
      setTasks(prev => [newTask, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  const reportMortality = async (animalId: string, count: number) => {
    try {
      const animal = animals.find(a => a.id === animalId);
      if (!animal) return;

      const newNombre = Math.max(0, animal.nombre - count);
      
      if (newNombre === 0) {
        await fetchApi(`/animals/${animalId}`, { method: 'DELETE' });
        setAnimals(prev => prev.filter(a => a.id !== animalId));
      } else {
        const updated = await fetchApi(`/animals/${animalId}`, {
          method: 'PUT',
          body: JSON.stringify({ nombre: newNombre })
        });
        setAnimals(prev => prev.map(a => a.id === animalId ? updated : a));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      const newStatus = task.status === 'pending' ? 'completed' : 'pending';
      const updated = await fetchApi(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (e) {
      console.error(e);
    }
  };

  const addAlert = async (alert: Omit<Alert, 'id' | 'status' | 'date'>) => {
    try {
      const newAlert = await fetchApi('/alerts', {
        method: 'POST',
        body: JSON.stringify({
          ...alert,
          status: 'Non traitée',
          date: new Date().toISOString().split('T')[0],
        })
      });
      setAlerts(prev => [newAlert, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  const treatAlert = async (alertId: string, diagnosticData: Omit<Diagnostic, 'id' | 'alertId'>) => {
    try {
      const targetAlert = alerts.find(a => a.id === alertId);
      if (!targetAlert) return;

      // Create Diagnostic
      const diagnostic = await fetchApi('/diagnostics', {
        method: 'POST',
        body: JSON.stringify({
          ...diagnosticData,
          alertId: alertId,
        })
      });

      // Update Alert Status
      const updatedAlert = await fetchApi(`/alerts/${alertId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Traitée' })
      });

      setAlerts(prev => prev.map(al => al.id === alertId ? { ...updatedAlert, diagnostics: [diagnostic] } : al));

      // Create Invoice
      const newInvoice = await fetchApi('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          amount: Math.floor(Math.random() * 20000) + 10000,
          status: 'unpaid',
          description: `Traitement pour : ${diagnostic.maladie} (${targetAlert.espece} ${targetAlert.race})`,
          date: new Date().toISOString().split('T')[0],
          veterinaire: 'Dr. Diallo',
          userId: breederId,
        })
      });
      setInvoices(prev => [newInvoice, ...prev]);

    } catch (e) {
      console.error(e);
    }
  };

  const scheduleMeeting = async (alertId: string, dateStr: string, url: string) => {
    try {
      const updatedAlert = await fetchApi(`/alerts/${alertId}`, {
        method: 'PUT',
        body: JSON.stringify({ meetingDate: dateStr, meetingUrl: url })
      });
      setAlerts(prev => prev.map(al => al.id === alertId ? { ...al, meetingDate: updatedAlert.meetingDate, meetingUrl: updatedAlert.meetingUrl } : al));
    } catch (e) {
      console.error(e);
    }
  };

  const payInvoice = async (invoiceId: string) => {
    try {
      const updated = await fetchApi(`/invoices/${invoiceId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'paid' })
      });
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? updated : inv));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        isLoading,
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
