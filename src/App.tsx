import { useEffect } from 'react';
import { useNavigate, useRoute } from '@/lib/router';
import { useAuth } from '@/context/AuthContext';
import { isAdminRole, homeRouteForRole } from '@/lib/roles';
import { AppShell } from '@/components/AppShell';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { MapPage } from '@/pages/MapPage';
import { SearchPage } from '@/pages/SearchPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AssistantPage } from '@/pages/AssistantPage';
import { EventsPage } from '@/pages/EventsPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { BookingsPage } from '@/pages/BookingsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SchedulePage } from '@/pages/SchedulePage';
import { AdminPage } from '@/pages/AdminPage';
import { QRPage } from '@/pages/QRPage';
import { QRScanPage } from '@/pages/QRScanPage';
import { TourPage } from '@/pages/TourPage';
import { HelpPage } from '@/pages/HelpPage';
import { AboutPage } from '@/pages/AboutPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { Spinner } from '@/components/ui';

// Routes accessibles sans session. '/' , '/login' et '/register' sont en
// plus "réservées aux visiteurs" : un utilisateur déjà connecté qui y
// atterrit est renvoyé vers son espace (ÉTAPE 3/4).
const publicRoutes = ['/', '/login', '/register', '/map', '/help', '/about', '/qr-scan'];
const visitorOnlyRoutes = ['/', '/login', '/register'];
// Routes protégées par une session — utilisées uniquement pour distinguer
// une VRAIE route inconnue (404, PHASE 12) d'une route qui existe mais
// nécessite une connexion (qui doit continuer à rediriger vers /login).
const authRoutes = [
  '/dashboard',
  '/search',
  '/assistant',
  '/events',
  '/favorites',
  '/profile',
  '/settings',
  '/notifications',
  '/bookings',
  '/reports',
  '/schedule',
  '/admin',
  '/qr',
  '/tour',
];

function App() {
  const { session, profile, loading, profileLoading } = useAuth();
  const route = useRoute();
  const go = useNavigate();

  const isPublic = publicRoutes.includes(route.path);
  const isKnownRoute = isPublic || authRoutes.includes(route.path);
  const isAuthenticated = !!session;
  // Tant que la session ou le profil ne sont pas résolus, on ne sait pas
  // encore si l'utilisateur est admin ni où le rediriger : ÉTAPE 3
  // impose d'attendre le chargement réel du profil avant toute décision.
  const authResolved = !loading && (!isAuthenticated || !profileLoading);

  useEffect(() => {
    if (!authResolved) return;

    // Une route qui n'existe pas nulle part (ni publique, ni protégée) est
    // une vraie 404 — jamais une redirection silencieuse vers la connexion
    // (PHASE 12 : le système doit toujours ramener vers une page utile).
    if (!isKnownRoute) return;

    // Un utilisateur déjà connecté qui arrive sur '/', '/login' ou
    // '/register' est envoyé vers son espace habituel selon son rôle.
    if (isAuthenticated && visitorOnlyRoutes.includes(route.path)) {
      go(homeRouteForRole(profile?.role));
      return;
    }

    // Route authentifiée (ou admin) sans session : direction connexion.
    if (!isAuthenticated && !isPublic) {
      go('/login');
      return;
    }

    // ÉTAPE 4/6 : protection centralisée de /admin, vérifiée uniquement
    // une fois le profil réellement chargé.
    if (
      route.path === '/admin' &&
      isAuthenticated &&
      !isAdminRole(profile?.role)
    ) {
      go('/dashboard');
    }
  }, [authResolved, isAuthenticated, isPublic, isKnownRoute, route.path, profile?.role, go]);

  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-slate-50">
        <Spinner label="Chargement…" />
      </div>
    );
  }

  // Pendant que le profil (donc le rôle) se charge encore pour une session
  // déjà authentifiée, on affiche un état de chargement plutôt que de
  // risquer de montrer brièvement le mauvais tableau de bord.
  if (isAuthenticated && profileLoading) {
    return (
      <div className="grid h-screen place-items-center bg-slate-50">
        <Spinner label="Chargement du profil…" />
      </div>
    );
  }

  // Route totalement inconnue : vraie page 404, dans le même shell que le
  // reste de l'app (sidebar/header si connecté, shell public sinon), sans
  // jamais rediriger silencieusement vers la connexion ou le dashboard.
  if (!isKnownRoute) {
    return (
      <AppShell>
        <NotFoundPage />
      </AppShell>
    );
  }

  // Redirections en cours (voir l'effet ci-dessus) : ne pas afficher la
  // page d'origine le temps que la navigation se fasse.
  if (isAuthenticated && visitorOnlyRoutes.includes(route.path)) {
    return (
      <div className="grid h-screen place-items-center bg-slate-50">
        <Spinner label="Redirection…" />
      </div>
    );
  }
  if (!isAuthenticated && !isPublic) {
    return (
      <div className="grid h-screen place-items-center bg-slate-50">
        <Spinner label="Redirection…" />
      </div>
    );
  }
  if (route.path === '/admin' && isAuthenticated && !isAdminRole(profile?.role)) {
    return (
      <div className="grid h-screen place-items-center bg-slate-50">
        <Spinner label="Redirection…" />
      </div>
    );
  }

  if (route.path === '/') return <LandingPage />;
  if (route.path === '/login' || route.path === '/register') {
    return <AuthPage mode={route.path === '/register' ? 'register' : 'login'} />;
  }

  // Page publique de consultation d'un QR scanné (lecture seule, jamais
  // dans l'AppShell : destinée à un visiteur anonyme, connecté ou non).
  if (route.path === '/qr-scan') {
    return <QRScanPage />;
  }

  // Map is public; other routes require session
  if (route.path === '/map') {
    return (
      <AppShell>
        <MapPage />
      </AppShell>
    );
  }

  let page: React.ReactNode;
  switch (route.path) {
      case '/dashboard':
        page = <DashboardPage />;
        break;
      case '/search':
        page = <SearchPage />;
        break;
      case '/assistant':
        page = <AssistantPage />;
        break;
      case '/events':
        page = <EventsPage />;
        break;
      case '/favorites':
        page = <FavoritesPage />;
        break;
      case '/profile':
        page = <ProfilePage />;
        break;
      case '/settings':
        page = <SettingsPage />;
        break;
      case '/notifications':
        page = <NotificationsPage />;
        break;
      case '/bookings':
        page = <BookingsPage />;
        break;
      case '/reports':
        page = <ReportsPage />;
        break;
      case '/schedule':
        page = <SchedulePage />;
        break;
      case '/admin':
        page = <AdminPage />;
        break;
      case '/qr':
        page = <QRPage />;
        break;
      case '/tour':
        page = <TourPage />;
        break;
      case '/help':
        page = <HelpPage />;
        break;
      case '/about':
        page = <AboutPage />;
        break;
    default:
      page = <NotFoundPage />;
  }
  return <AppShell>{page}</AppShell>;
}

export default App;
