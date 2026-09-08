import { useEffect, useMemo, useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useCampus } from '@/context/CampusContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useRoute } from '@/lib/router';
import { LocationSearch } from '@/components/LocationSearch';
import { getRecentSearches } from '@/lib/api';
import type { LocationKind } from '@/lib/types';

const kindLabels: Partial<Record<LocationKind, string>> = {
  room: 'Salles',
  office: 'Bureaux',
  service: 'Services',
  poi: "Points d'intérêt",
  facility: 'Équipements',
};

export function SearchPage() {
  const { locations } = useCampus();
  const { session } = useAuth();
  const route = useRoute();
  const go = useNavigate();
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (session) {
      getRecentSearches(session.user.id)
        .then(setRecent)
        .catch(() => undefined);
    }
  }, [session]);

  const initialQuery = route.params.get('q') ?? '';
  const kind = route.params.get('kind') as LocationKind | null;

  // Une carte "Trouvez rapidement" (accueil/dashboard) peut filtrer par
  // nature de lieu (salle, bureau, service, POI) plutôt que par texte.
  const scopedLocations = useMemo(
    () => (kind ? locations.filter((loc) => loc.kind === kind) : locations),
    [locations, kind],
  );

  const activeKindLabel = kind ? kindLabels[kind] : null;
  const title = activeKindLabel ?? 'Recherche';
  const subtitle = activeKindLabel
    ? `Tous les résultats de type « ${activeKindLabel} » sur le campus.`
    : "Trouvez une salle, un bureau, un service ou un point d'intérêt.";

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 lg:px-8 lg:py-10">
      <div className="flex items-start gap-3.5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-hec-950 text-white dark:bg-white dark:text-hec-950">
          <SearchIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-bold text-hec-950 dark:text-white">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>

      {activeKindLabel && (
        <button
          onClick={() => go('/search', initialQuery ? { q: initialQuery } : {})}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-hec-100 bg-hec-50 px-3 py-1.5 text-xs font-semibold text-hec-700 transition-colors hover:bg-hec-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hec-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {activeKindLabel}
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="mt-6 h-[70vh] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <LocationSearch
          locations={scopedLocations}
          recent={recent}
          initialQuery={initialQuery}
          onSelect={(loc) => go('/map', { loc: loc.id })}
          autoFocus
        />
      </div>
    </div>
  );
}