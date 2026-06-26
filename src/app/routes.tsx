import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/app/App';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { PortfolioView } from '@/features/portfolio/PortfolioView';
import { BookingsView } from '@/features/bookings/BookingsView';
import { CleaningView } from '@/features/cleaning/CleaningView';
import { MaintenanceView } from '@/features/maintenance/MaintenanceView';
import { PropertyView } from '@/features/property/PropertyView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardView /> },
      { path: 'portfolio', element: <PortfolioView /> },
      { path: 'buchungen', element: <BookingsView /> },
      { path: 'reinigung', element: <CleaningView /> },
      { path: 'instandhaltung', element: <MaintenanceView /> },
      { path: 'immobilie', element: <PropertyView /> },
    ],
  },
]);
