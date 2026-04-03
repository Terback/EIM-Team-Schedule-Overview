import { useState, useEffect, useCallback } from 'react';
import { ScheduleEvent } from '../types';
import { db, auth } from '../firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc, getDoc, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const INITIAL_TEAM = ['Terrence', 'Ming', 'Xavier', 'Marco', 'Lily', 'Daniel'];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: any[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
      if (!user) {
        setIsLoaded(true); // Stop loading if not logged in
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Test connection
    const testConnection = async () => {
      try {
        await getDoc(doc(db, 'settings', 'team'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    };
    testConnection();

    // Listen to events
    const unsubscribeEvents = onSnapshot(
      collection(db, 'events'),
      (snapshot) => {
        const loadedEvents: ScheduleEvent[] = [];
        snapshot.forEach((doc) => {
          loadedEvents.push({ id: doc.id, ...doc.data() } as ScheduleEvent);
        });
        setEvents(loadedEvents);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'events')
    );

    // Listen to team settings
    const unsubscribeTeam = onSnapshot(
      doc(db, 'settings', 'team'),
      (docSnap) => {
        if (docSnap.exists()) {
          setTeamMembers(docSnap.data().members || []);
        } else {
          // Initialize team if it doesn't exist
          setDoc(doc(db, 'settings', 'team'), { members: INITIAL_TEAM })
            .catch(error => handleFirestoreError(error, OperationType.WRITE, 'settings/team'));
          setTeamMembers(INITIAL_TEAM);
        }
        setIsLoaded(true);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'settings/team')
    );

    return () => {
      unsubscribeEvents();
      unsubscribeTeam();
    };
  }, [userId]);

  const addEvent = useCallback(async (event: Omit<ScheduleEvent, 'id'>) => {
    if (!userId) return;
    const newId = crypto.randomUUID();
    try {
      await setDoc(doc(db, 'events', newId), event);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `events/${newId}`);
    }
  }, [userId]);

  const addRecurringEvents = useCallback(async (event: Omit<ScheduleEvent, 'id'>, weeks: number) => {
    if (!userId) return;
    try {
      const batch = writeBatch(db);
      
      for (let i = 0; i < weeks; i++) {
        const newId = crypto.randomUUID();
        const eventDate = new Date(event.date);
        eventDate.setDate(eventDate.getDate() + (i * 7));
        
        const eventCopy = {
          ...event,
          date: eventDate.toISOString().split('T')[0]
        };
        
        const docRef = doc(db, 'events', newId);
        batch.set(docRef, eventCopy);
      }
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `events/batch`);
    }
  }, [userId]);

  const updateEvent = useCallback(async (id: string, updates: Partial<ScheduleEvent>) => {
    if (!userId) return;
    try {
      await updateDoc(doc(db, 'events', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `events/${id}`);
    }
  }, [userId]);

  const deleteEvent = useCallback(async (id: string) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `events/${id}`);
    }
  }, [userId]);

  const addTeamMember = useCallback(async (name: string) => {
    if (!userId) return;
    const trimmed = name.trim();
    if (trimmed && !teamMembers.includes(trimmed)) {
      const newMembers = [...teamMembers, trimmed];
      try {
        await setDoc(doc(db, 'settings', 'team'), { members: newMembers });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'settings/team');
      }
    }
  }, [teamMembers, userId]);

  const removeTeamMember = useCallback(async (name: string) => {
    if (!userId) return;
    const newMembers = teamMembers.filter(member => member !== name);
    try {
      await setDoc(doc(db, 'settings', 'team'), { members: newMembers });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/team');
    }
  }, [teamMembers, userId]);

  return {
    events,
    teamMembers,
    addEvent,
    addRecurringEvents,
    updateEvent,
    deleteEvent,
    addTeamMember,
    removeTeamMember,
    isLoaded,
    userId
  };
}
