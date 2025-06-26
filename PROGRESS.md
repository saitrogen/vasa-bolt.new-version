# State Management Refactoring Progress

This document tracks the progress of refactoring the application to use Pinia for state management.

## Phase 1: Initial Pinia Setup & Core State Migration

*   **Pinia Installation & Setup:**
    *   Installed `pinia` package.
    *   Initialized Pinia in `src/main.ts`.
*   **UI Store (`src/stores/ui.ts`):**
    *   Created a Pinia store for global UI state.
    *   Migrated dark mode logic (state, toggle action, theme initialization) from `App.vue`.
    *   Migrated sidebar state (desktop collapse, mobile open/close, toggle action) from `App.vue`.
    *   Refactored `App.vue` to use `uiStore`.
*   **Auth Store (`src/stores/auth.ts`):**
    *   Created a Pinia store for authentication state.
    *   Migrated user state, loading state, and `isAuthenticated` computed property from `src/composables/useAuth.ts`.
    *   Migrated `signIn`, `signOut`, and `initializeAuth` actions from `src/composables/useAuth.ts`.
    *   Refactored `src/composables/useAuth.ts` to act as a proxy to `authStore`, ensuring components using it don't break.
    *   `App.vue` continues to call `initializeAuth` via the composable, which now triggers the store action.

## Phase 2: Component & View-Level State Refactoring

### 1. Appointments View (`src/views/Appointments.vue`)
*   **Status:** Refactored
*   **Stores Used:**
    *   `useAppointmentStore`: For fetching, creating, and updating appointments. Manages `appointments` list, loading states.
    *   `useBarberStore`: For populating barber selection in the appointment form.
    *   `useClientStore`: For populating client selection in the appointment form.
    *   `useServiceStore`: For populating services selection and details in the appointment form.
*   **Key Changes:**
    *   Removed local state for `appointments`, `barbers`, `clients`, `services`. Data is now sourced directly from Pinia stores.
    *   `onMounted` lifecycle hook now dispatches actions to stores to fetch initial data.
    *   `saveAppointment` method now calls actions on `appointmentStore` (`createAppointment`, `updateAppointment`) which handle the backend calls and state updates.
    *   Modal form for new/edit appointments now uses data from `clientStore`, `barberStore`, and `serviceStore` for dropdowns and service selection.
    *   Loading states from stores are used to provide feedback (e.g., disable buttons/selects).
    *   `AppointmentCalendar.vue` component now receives its props (`appointments`, `barbers`, `loading`) from the store data managed by `Appointments.vue`.

### 2. Barbers Views (`src/views/Barbers.vue` & `src/views/BarberProfile.vue`)
*   **Status:** Refactored
*   **Stores Used:**
    *   `useBarberStore`: Manages the list of barbers, selected barber details, loading/submitting states, and CRUD operations for barbers.
    *   `useAppointmentStore`: Used in `BarberProfile.vue` to fetch and display appointments related to the specific barber.
    *   `useCollectionStore`: (New store created) Used in `BarberProfile.vue` to fetch and display collection data for the specific barber.
*   **Key Changes for `Barbers.vue`:**
    *   Local state for `barbers` list and `loading` replaced by `barberStore`.
    *   `onMounted` calls `barberStore.fetchBarbers()`.
    *   `saveBarber` method calls `barberStore.createBarber()` or `barberStore.updateBarber()`.
    *   Modal form submission state tied to `barberStore.submitting`.
    *   Table displays data from `barberStore.barbers` with appropriate loading/empty states.
*   **Key Changes for `BarberProfile.vue`:**
    *   Local state for individual `barber` details, `appointments`, and `collections` replaced by data from `barberStore.selectedBarber`, `appointmentStore`, and `collectionStore`.
    *   `onMounted` and a route param watcher fetch data using actions from these three stores (`fetchBarberById`, `fetchAppointments`, `fetchCollectionsByBarberId`).
    *   Profile editing form (`form.value`) is initialized from `barberStore.selectedBarber`.
    *   `confirmSave` method calls `barberStore.updateBarber()`.
    *   Computed properties derive stats (e.g., `todayAppointmentsCount`, `todayCollectionTotal`) from store data.
    *   Loading states from stores are used for UI feedback.

### 3. Clients Views (`src/views/Clients.vue` & `src/views/ClientProfile.vue`)
*   **Status:** Refactored
*   **Stores Used:**
    *   `useClientStore`: Manages the list of clients, selected client details, loading/submitting states, and CRUD operations for clients.
    *   `useAppointmentStore`: Used in both `Clients.vue` (for stats like appointment counts, last visit) and `ClientProfile.vue` (to display appointments related to the specific client).
*   **Key Changes for `Clients.vue`:**
    *   Local state for `clients` list and `appointments` (used for stats) replaced by `clientStore` and `appointmentStore`.
    *   `onMounted` calls `clientStore.fetchClients()` and `appointmentStore.fetchAppointments()`.
    *   `saveClient` method calls `clientStore.createClient()` or `clientStore.updateClient()`.
    *   Modal form submission state tied to `clientStore.submitting`.
    *   Table displays data from `clientStore.clients` (with local search and pagination).
    *   Computed helpers for client stats (e.g., `getClientAppointmentCount`) now use data from `appointmentStore`.
*   **Key Changes for `ClientProfile.vue`:**
    *   Local state for individual `client` details and `appointments` replaced by data from `clientStore.selectedClient` and `appointmentStore`.
    *   `onMounted` and a route param watcher fetch data using `clientStore.fetchClientById()` and `appointmentStore.fetchAppointments()`.
    *   Profile editing form (`form.value`) initialized from `clientStore.selectedClient`.
    *   `confirmSave` method calls `clientStore.updateClient()`.
    *   Computed properties derive appointment stats for the client from `appointmentStore`.
    *   Loading states from stores used for UI feedback.

### 4. Services View (`src/views/Services.vue`)
*   **Status:** Refactored
*   **Stores Used:**
    *   `useServiceStore`: Manages the list of services, loading/submitting states, and CRUD operations (create, update, update status) for services.
*   **Key Changes:**
    *   Local state for `services` list, `loading`, and `submitting` replaced by `serviceStore`.
    *   `onMounted` calls `serviceStore.fetchServices()`.
    *   `saveService` method calls `serviceStore.createService()` or `serviceStore.updateService()`.
    *   `toggleServiceStatus` method calls `serviceStore.updateServiceStatus()`.
    *   Modal form submission state tied to `serviceStore.submitting`.
    *   Services grid displays data from `serviceStore.services` with appropriate loading/empty states.

### 5. Expenses View & Category Manager (`src/views/Expenses.vue` & `src/components/ExpenseCategoryManager.vue`)
*   **Status:** Refactored
*   **Stores Used:**
    *   `useExpenseStore`: Manages expenses list, filtered expenses, total amounts, loading/submitting states, CRUD operations for expenses (including bill uploads).
    *   `useExpenseCategoryStore`: Manages expense categories, used for populating category filters and forms.
*   **Key Changes for `Expenses.vue`:**
    *   Local state for `expenses` and `expenseCategories` replaced by data from `expenseStore` and `expenseCategoryStore`.
    *   `onMounted` calls actions to fetch initial expenses and categories from their stores.
    *   `saveExpense` method calls `expenseStore.createExpense()` or `expenseStore.updateExpense()`, which now also handle bill file uploads.
    *   `deleteExpense` method calls `expenseStore.deleteExpense()`.
    *   Filtering logic now interacts with `expenseStore.filters` state via a local `localFilters` reactive object and `expenseStore.setFilters()` action. Filtered results and total amount are computed properties from the store.
    *   Loading states and form submission states are tied to the respective stores.
*   **Key Changes for `ExpenseCategoryManager.vue`:**
    *   Local state for `categories`, `loading`, and `submitting` replaced by `expenseCategoryStore`.
    *   `onMounted` calls `expenseCategoryStore.fetchCategories()`.
    *   `saveCategory` method calls `expenseCategoryStore.createCategory()` or `expenseCategoryStore.updateCategory()`.
    *   `deleteCategory` method calls `expenseCategoryStore.deleteCategory()`.
    *   Modal form submission state tied to `expenseCategoryStore.submitting`.
    *   Category list displays data from `expenseCategoryStore.categories`.
    *   Added `is_active` field to the category form.

### 6. Daily Collections View (`src/views/DailyCollections.vue`)
*   **Status:** Refactored
*   **Stores Used:**
    *   `useCollectionStore`: Manages manual collection entries. Added `fetchAllCollections` action and `allCollectionsFlat` computed property.
    *   `useBarberStore`: For populating barber selection in filters and the collection entry form.
    *   `useAppointmentStore`: Used to fetch all appointments, which are then used locally to calculate the `total_amount_calculated` for each daily collection entry to show discrepancies.
*   **Key Changes:**
    *   Replaced local state for `collections`, `barbers`, and `appointments` with data from the respective Pinia stores.
    *   `onMounted` calls actions to fetch initial data from all three stores.
    *   `saveCollection` method now calls `collectionStore.addCollectionEntry()` (update functionality for existing entries is noted as a potential future addition to the store).
    *   The main table displays collections derived from `collectionStore.allCollectionsFlat`, augmented with calculated amounts and barber names.
    *   Filtering remains component-local but operates on the store-derived collection data.
    *   PDF generation logic updated to use data from stores.
    *   Loading states from stores are used for UI feedback.

### 7. Dashboard View (`src/views/Dashboard.vue`)
*   **Status:** Refactored
*   **Stores Used:**
    *   `useAppointmentStore`
    *   `useCollectionStore`
    *   `useClientStore`
    *   `useBarberStore`
    *   `useExpenseStore`
*   **Key Changes:**
    *   Removed all local data fetching and state. Data is now sourced entirely from the respective Pinia stores.
    *   `onMounted` calls `fetch` actions from all imported stores to load necessary data for dashboard widgets.
    *   Computed properties for `todayStats`, `summaryCards`, `upcomingAppointments`, and `recentActivity` were updated to derive their values from store data.
    *   A new `overallLoading` computed property was added to manage loading skeletons for sections dependent on multiple stores.
    *   Template updated to use store data and handle loading/empty states more effectively.

### 8. Reports View (`src/views/Reports.vue`)
*   **Status:** Refactored
*   **Stores Used:**
    *   `useReportStore`: (New store created) Manages fetching and storing data for various reports by calling Supabase RPC functions. Holds `currentReportData` and loading state.
    *   `useBarberStore`: Used to populate the barber filter dropdown.
*   **Key Changes:**
    *   RPC calls (`get_daily_summary`, `get_monthly_summary`, `get_barber_performance`) moved from the component into actions within `reportStore`.
    *   `onMounted` fetches barbers for the filter dropdown via `barberStore`.
    *   `generateReport` method now calls actions on `reportStore` based on the selected report type and filters.
    *   Report table displays data from `reportStore.currentReportData`.
    *   Loading states from `reportStore` and `barberStore` are used for UI feedback (e.g., disabling buttons, showing loading messages).
    *   Dynamic header generation and basic cell formatting added for the report table.

### 9. Settings View (`src/views/Settings.vue`)
*   **Status:** Reviewed (No changes needed)
*   **Stores Used:** (Indirectly via child components)
    *   `useExpenseCategoryStore` (used by `ExpenseCategoryManager.vue`)
*   **Key Changes:**
    *   The `Settings.vue` component primarily acts as a container for other components.
    *   Its main child, `ExpenseCategoryManager.vue`, was already refactored to use `useExpenseCategoryStore`.
    *   No local state or direct data fetching exists in `Settings.vue` that requires migration to Pinia.

*(This section will be updated as more components and views are refactored)*

---

*Next steps involve analyzing specific views and components to identify state that can be centralized in new or existing Pinia stores.*
