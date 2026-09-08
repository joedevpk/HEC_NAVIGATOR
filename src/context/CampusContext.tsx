import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  addFavorite,
  getAnnouncements,
  getBuildings,
  getCampus,
  getEvents,
  getFavorites,
  getLocations,
  getRouteNodes,
  getRouteSegments,
  removeFavorite,
} from '@/lib/api';
import type {
  Announcement,
  Building,
  Campus,
  CampusEvent,
  CampusLocation,
  RouteNode,
  RouteSegment,
} from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

interface CampusState {
  campus: Campus | null;
  buildings: Building[];
  locations: CampusLocation[];
  events: CampusEvent[];
  announcements: Announcement[];
  routeNodes: RouteNode[];
  routeSegments: RouteSegment[];
  favorites: Set<string>;
  /** Chargement des données CRITIQUES (campus/bâtiments/lieux) : tant que
   * c'est true, MapPage affiche un spinner. */
  loading: boolean;
  /** Erreur CRITIQUE uniquement — casse l'affichage de la carte. */
  error: string | null;
  /** Erreurs SECONDAIRES (événements, annonces, réseau de navigation) :
   * n'empêchent jamais la carte de fonctionner (ÉTAPE 9). */
  eventsError: string | null;
  announcementsError: string | null;
  routingError: string | null;
  reload: () => void;
  toggleFavorite: (locationId: string) => Promise<void>;
}

const CampusContext = createContext<CampusState | undefined>(undefined);

export function CampusProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [campus, setCampus] = useState<Campus | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [routeNodes, setRouteNodes] = useState<RouteNode[]>([]);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null);
  const [routingError, setRoutingError] = useState<string | null>(null);

  // Données SECONDAIRES : chargées séparément, une erreur ici ne casse
  // jamais la carte (ÉTAPE 9 du cahier des charges).
  const loadSecondary = useCallback(async (campusId: string) => {
    const [evRes, annRes, nodesRes, segRes] = await Promise.allSettled([
      getEvents(campusId),
      getAnnouncements(campusId),
      getRouteNodes(campusId),
      getRouteSegments(campusId),
    ]);

    if (evRes.status === 'fulfilled') {
      setEvents(evRes.value);
      setEventsError(null);
    } else {
      setEventsError("Impossible de charger les événements.");
    }

    if (annRes.status === 'fulfilled') {
      setAnnouncements(annRes.value);
      setAnnouncementsError(null);
    } else {
      setAnnouncementsError('Impossible de charger les annonces.');
    }

    if (nodesRes.status === 'fulfilled' && segRes.status === 'fulfilled') {
      setRouteNodes(nodesRes.value);
      setRouteSegments(segRes.value);
      setRoutingError(null);
    } else {
      // Pas de graphe de navigation disponible : nav.ts se replie
      // automatiquement sur l'itinéraire direct, ce n'est pas bloquant.
      setRouteNodes([]);
      setRouteSegments([]);
      setRoutingError(null);
    }
  }, []);

  // Données CRITIQUES : campus, bâtiments, lieux. Les bâtiments sont
  // chargés directement via getBuildings (et non plus reconstruits à
  // partir de locations.map(l => l.building)), donc ils restent visibles
  // même si `locations` est vide (ÉTAPE 9).
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const c = await getCampus();
      setCampus(c);
      if (c) {
        const [bld, locs] = await Promise.all([getBuildings(c.id), getLocations()]);
        setBuildings(bld);
        setLocations(locs);
        // Ne bloque jamais l'affichage critique : erreurs gérées en interne.
        loadSecondary(c.id);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les données du campus.',
      );
    } finally {
      setLoading(false);
    }
  }, [loadSecondary]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let active = true;
    if (session) {
      getFavorites(session.user.id)
        .then((ids) => {
          if (active) setFavorites(new Set(ids));
        })
        .catch(() => undefined);
    } else {
      setFavorites(new Set());
    }
    return () => {
      active = false;
    };
  }, [session]);

  const toggleFavorite = useCallback(
    async (locationId: string) => {
      if (!session) return;
      const isFav = favorites.has(locationId);
      const next = new Set(favorites);
      if (isFav) next.delete(locationId);
      else next.add(locationId);
      setFavorites(next);
      try {
        if (isFav) await removeFavorite(locationId);
        else await addFavorite(locationId);
      } catch {
        setFavorites(favorites);
      }
    },
    [favorites, session],
  );

  return (
    <CampusContext.Provider
      value={{
        campus,
        buildings,
        locations,
        events,
        announcements,
        routeNodes,
        routeSegments,
        favorites,
        loading,
        error,
        eventsError,
        announcementsError,
        routingError,
        reload: load,
        toggleFavorite,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus(): CampusState {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error('useCampus must be used within CampusProvider');
  return ctx;
}
