import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'
import { useToast } from '@/composables/useToast'
import { startOfMonth, endOfMonth, format, parseISO, isSameDay } from 'date-fns'

type DailyCollection = Tables<'daily_collections'>;

export const useCollectionStore = defineStore('collection', () => {
  const { addToast } = useToast()

  const collectionsByBarber = ref<Record<string, DailyCollection[]>>({})
  const loading = ref(false)
  const error = ref<any>(null)

  const getCollectionsForBarber = computed(() => {
    return (barberId: string) => collectionsByBarber.value[barberId] || []
  })

  const getTodayCollectionsForBarber = computed(() => {
    return (barberId: string) => {
      const barberCollections = collectionsByBarber.value[barberId] || []
      const todayStr = format(new Date(), 'yyyy-MM-dd')
      return barberCollections.filter(c => c.collection_date === todayStr)
    }
  })

  const getThisMonthCollectionsForBarber = computed(() => {
    return (barberId: string) => {
      const barberCollections = collectionsByBarber.value[barberId] || [];
      const today = new Date();
      const monthStartStr = format(startOfMonth(today), 'yyyy-MM-dd');
      const monthEndStr = format(endOfMonth(today), 'yyyy-MM-dd');

      return barberCollections.filter(c =>
        c.collection_date >= monthStartStr && c.collection_date <= monthEndStr
      );
    };
  });

  const allCollectionsFlat = computed(() => {
    return Object.values(collectionsByBarber.value).flat();
  });


  const fetchCollectionsByBarberId = async (barberId: string) => {
    if (!barberId) return;
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('daily_collections')
        .select('*, barber:barbers(id, name)') // Include barber name for easier display if needed directly
        .eq('barber_id', barberId)
        .order('collection_date', { ascending: false })

      if (fetchError) throw fetchError
      collectionsByBarber.value[barberId] = data || []
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: `Error fetching collections for barber ${barberId}`, message: (e as Error).message })
    } finally {
      loading.value = false
    }
  }

  const fetchAllCollections = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: fetchError } = await supabase
        .from('daily_collections')
        .select('*, barber:barbers(id, name)') // Include barber name
        .order('collection_date', { ascending: false });

      if (fetchError) throw fetchError;

      const newCollectionsByBarber: Record<string, DailyCollection[]> = {};
      if (data) {
        for (const record of data) {
          const barberId = record.barber_id.toString(); // Ensure barber_id is string for key
          if (!newCollectionsByBarber[barberId]) {
            newCollectionsByBarber[barberId] = [];
          }
          newCollectionsByBarber[barberId].push(record as DailyCollection); // Type assertion
        }
      }
      collectionsByBarber.value = newCollectionsByBarber;

    } catch (e) {
      error.value = e;
      addToast({ type: 'error', title: 'Error fetching all collections', message: (e as Error).message });
    } finally {
      loading.value = false;
    }
  };

  // Add Collection - if manual entry is done elsewhere
  const addCollectionEntry = async (collectionData: TablesInsert<'daily_collections'>) => {
    loading.value = true;
    error.value = null;
    try {
      const { data: newEntry, error: insertError } = await supabase
        .from('daily_collections')
        .insert(collectionData)
        .select()
        .single();

      if (insertError) throw insertError;
      if (!newEntry) throw new Error('Failed to add collection entry');

      // Add to local state
      const barberId = newEntry.barber_id;
      if (barberId) {
        if (!collectionsByBarber.value[barberId]) {
          collectionsByBarber.value[barberId] = [];
        }
        collectionsByBarber.value[barberId].push(newEntry);
        // Keep it sorted if needed, e.g. by date
        collectionsByBarber.value[barberId].sort((a, b) => new Date(b.collection_date).getTime() - new Date(a.collection_date).getTime());
      }
      addToast({ type: 'success', title: 'Success', message: 'Collection entry added.' });
      return newEntry;

    } catch (e) {
      error.value = e;
      addToast({ type: 'error', title: 'Error adding collection', message: (e as Error).message });
      return null;
    } finally {
      loading.value = false;
    }
  }


  return {
    collectionsByBarber,
    loading,
    error,
    fetchCollectionsByBarberId,
    addCollectionEntry,
    getCollectionsForBarber,
    getTodayCollectionsForBarber,
    getThisMonthCollectionsForBarber,
  }
})
