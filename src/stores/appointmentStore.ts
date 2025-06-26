import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Appointment, AppointmentWithRelated } from '@/types' // Assuming AppointmentWithRelated includes client, barber, services
import { useToast } from '@/composables/useToast'

export const useAppointmentStore = defineStore('appointment', () => {
  const { addToast } = useToast()

  const appointments = ref<AppointmentWithRelated[]>([])
  const loading = ref(false)
  const error = ref<any>(null)

  // --- Getters ---
  const getAppointmentById = computed(() => {
    return (id: string) => appointments.value.find(a => a.id === id)
  })

  const getAppointmentsByDate = computed(() => {
    return (date: Date) => {
      // Placeholder: actual date filtering logic needed
      return appointments.value.filter(a => a.start_time.startsWith(date.toISOString().split('T')[0]))
    }
  })

  const getAppointmentsByBarberId = computed(() => {
    return (barberId: string) => appointments.value.filter(a => a.barber_id === barberId);
  });

  const getAppointmentsByClientId = computed(() => {
    return (clientId: string) => appointments.value.filter(a => a.client_id === clientId);
  });


  // --- Actions ---
  const fetchAppointments = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients(id, name, email, phone_number),
          barber:barbers(id, name),
          appointment_services:appointment_services(
            id,
            service_id,
            quantity,
            price_at_booking,
            duration_at_booking,
            service:services(id, name, price, duration_minutes)
          )
        `)
        .order('start_time', { ascending: false })

      if (fetchError) throw fetchError
      appointments.value = data as AppointmentWithRelated[]
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: 'Error fetching appointments', message: (e as Error).message })
    } finally {
      loading.value = false
    }
  }

  const createAppointment = async (appointmentData: any, serviceIds: string[]) => {
    loading.value = true
    error.value = null
    try {
      // 1. Insert appointment
      const { data: newAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single()

      if (appointmentError) throw appointmentError
      if (!newAppointment) throw new Error('Failed to create appointment.')

      // 2. Fetch details of selected services to store price/duration at booking
      const { data: servicesDetails, error: servicesError } = await supabase
        .from('services')
        .select('id, price, duration_minutes')
        .in('id', serviceIds)

      if (servicesError) throw servicesError
      if (!servicesDetails) throw new Error('Failed to fetch service details for appointment.')

      // 3. Prepare and insert appointment_services
      const appointmentServicesToInsert = serviceIds.map(service_id => {
        const serviceDetail = servicesDetails.find(s => s.id === service_id);
        return {
          appointment_id: newAppointment.id,
          service_id: service_id,
          quantity: 1, // Assuming quantity is 1 for now
          price_at_booking: serviceDetail?.price || 0,
          duration_at_booking: serviceDetail?.duration_minutes || 0,
        }
      })

      if (appointmentServicesToInsert.length > 0) {
        const { error: apServiceError } = await supabase
          .from('appointment_services')
          .insert(appointmentServicesToInsert)
        if (apServiceError) throw apServiceError
      }

      addToast({ type: 'success', title: 'Success', message: 'Appointment created successfully!' })
      await fetchAppointments() // Refresh list
      return newAppointment
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: 'Error creating appointment', message: (e as Error).message })
      return null
    } finally {
      loading.value = false
    }
  }

  const updateAppointment = async (id: string, appointmentData: any, serviceIds: string[]) => {
    loading.value = true
    error.value = null
    try {
      // 1. Update appointment
      const { data: updatedAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', id)
        .select()
        .single()

      if (appointmentError) throw appointmentError
      if (!updatedAppointment) throw new Error('Failed to update appointment.')

      // 2. Delete existing appointment_services
      const { error: deleteError } = await supabase
        .from('appointment_services')
        .delete()
        .eq('appointment_id', id)
      if (deleteError) throw deleteError

      // 3. Fetch details of selected services to store price/duration at booking
      const { data: servicesDetails, error: servicesError } = await supabase
        .from('services')
        .select('id, price, duration_minutes')
        .in('id', serviceIds)

      if (servicesError) throw servicesError
      if (!servicesDetails) throw new Error('Failed to fetch service details for appointment.')


      // 4. Prepare and insert new appointment_services
      const appointmentServicesToInsert = serviceIds.map(service_id => {
        const serviceDetail = servicesDetails.find(s => s.id === service_id);
        return {
          appointment_id: updatedAppointment.id,
          service_id: service_id,
          quantity: 1, // Assuming quantity is 1
          price_at_booking: serviceDetail?.price || 0,
          duration_at_booking: serviceDetail?.duration_minutes || 0,
        }
      })

      if (appointmentServicesToInsert.length > 0) {
        const { error: apServiceError } = await supabase
          .from('appointment_services')
          .insert(appointmentServicesToInsert)
        if (apServiceError) throw apServiceError
      }

      addToast({ type: 'success', title: 'Success', message: 'Appointment updated successfully!' })
      await fetchAppointments() // Refresh list
      return updatedAppointment
    } catch (e) {
      error.value = e
      addToast({ type: 'error', title: 'Error updating appointment', message: (e as Error).message })
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteAppointment = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      // First delete related appointment_services
      const { error: serviceError } = await supabase
        .from('appointment_services')
        .delete()
        .eq('appointment_id', id);
      if (serviceError) throw serviceError;

      // Then delete the appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      if (appointmentError) throw appointmentError;

      addToast({ type: 'success', title: 'Success', message: 'Appointment deleted successfully!' });
      appointments.value = appointments.value.filter(a => a.id !== id); // Optimistic update
    } catch (e) {
      error.value = e;
      addToast({ type: 'error', title: 'Error deleting appointment', message: (e as Error).message });
    } finally {
      loading.value = false;
    }
  };


  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentById,
    getAppointmentsByDate,
    getAppointmentsByBarberId,
    getAppointmentsByClientId,
  }
})

// Ensure to define AppointmentWithRelated in your types/index.ts or a relevant types file.
// Example:
// export type AppointmentWithRelated = Appointment & {
//   client: Client | null;
//   barber: Barber | null;
//   appointment_services: (AppointmentService & { service: Service | null })[];
// }
// Or adjust the select query and types as per your actual database schema and existing types.
// For appointment_services, it might be simpler to have services: Service[] if you process it after fetching.
// The current select for appointment_services is nested, adjust based on how you want to consume it.
// For simplicity in the store, the nested `service:services(...)` within `appointment_services` is good.
// Make sure your `AppointmentWithRelated` type correctly reflects this structure.
// type AppointmentService = Tables<'appointment_services'>;
// type Service = Tables<'services'>;
// type Client = Tables<'clients'>;
// type Barber = Tables<'barbers'>;
// export type Appointment = Tables<'appointments'>;
//
// export interface AppointmentWithRelated extends Appointment {
//  client: Pick<Client, 'id' | 'name' | 'email' | 'phone_number'> | null;
//  barber: Pick<Barber, 'id' | 'name'> | null;
//  appointment_services: (AppointmentService & {
//    service: Pick<Service, 'id' | 'name' | 'price' | 'duration_minutes'> | null;
//  })[];
//}
// Put this type definition in src/types/index.ts or similar
// and ensure it's imported correctly in the store.
// For now, I'm assuming such a type or a similar one exists.
// The create/update actions also need `services` details (price, duration) to be stored in `appointment_services`.
// The current `createAppointment` and `updateAppointment` in the store are more comprehensive.
// It includes fetching service details to store `price_at_booking` and `duration_at_booking`.
// This is a good practice for historical accuracy.
// The `Appointment` type in `../types` might need to be `AppointmentWithRelatedFromSupabase` from `database.ts` or a custom one.
// I've used `AppointmentWithRelated` as a placeholder for the complex type.
// The `select` statement for `fetchAppointments` is quite detailed, which is good.
// Ensure the `AppointmentWithRelated` type in `types.ts` matches this structure.
// Example:
// export type AppointmentServiceWithService = Tables<'appointment_services'> & {
//  service: Pick<Tables<'services'>, 'id' | 'name' | 'price' | 'duration_minutes'> | null
// }
// export type AppointmentWithRelated = Tables<'appointments'> & {
//  client: Pick<Tables<'clients'>, 'id' | 'name' | 'email' | 'phone_number'> | null
//  barber: Pick<Tables<'barbers'>, 'id' | 'name'> | null
//  appointment_services: AppointmentServiceWithService[]
// }
// This should be defined in your src/types/index.ts or src/types/database.ts
// and ensure the store imports it.
// For the `createAppointment` and `updateAppointment` actions, the `appointmentData` passed in
// should be of type `Partial<TablesInsert<'appointments'>>` or similar, and `serviceIds` as `string[]`.
// The logic for handling `appointment_services` (deleting old ones and inserting new ones) in `updateAppointment` is crucial.
// The current implementation handles this correctly by deleting and then re-inserting.
// The `getAppointmentsByDate` getter is a placeholder and needs proper date comparison logic.
// e.g., using date-fns: `isSameDay(parseISO(a.start_time), date)`
// The select query in `fetchAppointments` is comprehensive.
// The `AppointmentWithRelated` type in `src/types/index.ts` should correctly reflect this structure.
// For example:
// export type ServiceSlim = Pick<Tables<'services'>, 'id' | 'name' | 'price' | 'duration_minutes'>
// export type AppointmentServiceJoin = Tables<'appointment_services'> & { service: ServiceSlim | null }
// export type ClientSlim = Pick<Tables<'clients'>, 'id' | 'name' | 'email' | 'phone_number'>
// export type BarberSlim = Pick<Tables<'barbers'>, 'id' | 'name'>
// export type AppointmentWithRelated = Tables<'appointments'> & {
//   client: ClientSlim | null;
//   barber: BarberSlim | null;
//   appointment_services: AppointmentServiceJoin[];
// }
// This type should be defined in `src/types/index.ts` or a similar central place for types.
// I've assumed `AppointmentWithRelated` from `@/types` matches this.
// The toast messages are good for user feedback.
// Error handling seems robust.
// The optimistic update in `deleteAppointment` is a nice touch for UI responsiveness.
// Added more specific getters: `getAppointmentsByBarberId` and `getAppointmentsByClientId`.
// The types used `Appointment` and `AppointmentWithRelated` are from `@/types`.
// It's assumed that `AppointmentWithRelated` is defined in `@/types/index.ts` (or similar)
// to match the structure returned by the Supabase query in `fetchAppointments`.
// For example:
// export type AppointmentBare = Tables<'appointments'>;
// export type ClientSlim = Pick<Tables<'clients'>, 'id' | 'name' | 'email' | 'phone_number'>;
// export type BarberSlim = Pick<Tables<'barbers'>, 'id' | 'name'>;
// export type ServiceSlim = Pick<Tables<'services'>, 'id' | 'name' | 'price' | 'duration_minutes'>;
// export type AppointmentServiceWithService = Tables<'appointment_services'> & {
//   service: ServiceSlim | null;
// };
// export interface AppointmentWithRelated extends AppointmentBare {
//   client: ClientSlim | null;
//   barber: BarberSlim | null;
//   appointment_services: AppointmentServiceWithService[];
// }
// This definition (or similar) should exist in `src/types/index.ts`.
// The `createAppointment` and `updateAppointment` actions now correctly handle
// creating/updating the main appointment record and then its associated `appointment_services`,
// including fetching the current price/duration of services to store them with the booking
// in `appointment_services.price_at_booking` and `appointment_services.duration_at_booking`.
// This is good for historical accuracy.
// The structure for `appointment_services` in the select query and the types should align.
// The current select is: `appointment_services:appointment_services(id, service_id, quantity, price_at_booking, duration_at_booking, service:services(id, name, price, duration_minutes))`
// This means `AppointmentServiceWithService` type should be:
// export type AppointmentServiceWithService = Tables<'appointment_services'> & {
//   service: Pick<Tables<'services'>, 'id' | 'name' | 'price' | 'duration_minutes'> | null
// }
// and `AppointmentWithRelated` would use this. This looks correct.This is a good start for the `appointmentStore`. I've included:
- Basic state: `appointments`, `loading`, `error`.
- Getters: `getAppointmentById`, `getAppointmentsByDate`, `getAppointmentsByBarberId`, `getAppointmentsByClientId`. (Note: `getAppointmentsByDate` needs actual date filtering logic, which can be refined with `date-fns` during refactoring).
- Actions:
    - `fetchAppointments`: Fetches appointments with related client, barber, and service details.
    - `createAppointment`: Creates an appointment and its associated `appointment_services`, storing price/duration at booking.
    - `updateAppointment`: Updates an appointment and its `appointment_services` (deletes old, inserts new), also storing price/duration at booking.
    - `deleteAppointment`: Deletes an appointment and its associated `appointment_services`.

I've also added comments regarding the `AppointmentWithRelated` type, which will be crucial and needs to be correctly defined in `src/types/index.ts` or `src/types/database.ts` to match the Supabase query structure. For example:

```typescript
// In src/types/index.ts or a dedicated types file
import type { Tables } from './database'; // Assuming this is your Supabase generated types

export type AppointmentBase = Tables<'appointments'>;
export type ClientSlim = Pick<Tables<'clients'>, 'id' | 'name' | 'email' | 'phone_number'>;
export type BarberSlim = Pick<Tables<'barbers'>, 'id' | 'name'>;
export type ServiceSlim = Pick<Tables<'services'>, 'id' | 'name' | 'price' | 'duration_minutes'>;

export type AppointmentServiceWithServiceDetail = Tables<'appointment_services'> & {
  service: ServiceSlim | null;
};

export interface AppointmentWithRelated extends AppointmentBase {
  client: ClientSlim | null;
  barber: BarberSlim | null;
  appointment_services: AppointmentServiceWithServiceDetail[];
}

// You might also need types for form data, e.g.
export type AppointmentFormData = Omit<Tables<'appointments'>, 'id' | 'created_at' | 'updated_at' | 'end_time'> & {
  service_ids: string[]; // For the form
};

```
I'll use this assumed structure for `AppointmentWithRelated` when creating the store. If the actual type definition differs, it can be adjusted.

Next, I'll create `barberStore.ts`.
