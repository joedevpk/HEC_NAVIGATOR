import {
  Building2,
  Info,
  MapPinned,
  Users,
  BookOpen,
  Landmark,
  Mail,
} from 'lucide-react';
import { useCampus } from '@/context/CampusContext';
import { EmptyState } from '@/components/ui';

export function AboutPage() {
  const { campus, buildings, locations } = useCampus();

  const stats = [
    { label: 'Bâtiments', value: buildings.length, icon: Building2 },
    { label: 'Lieux référencés', value: locations.length, icon: MapPinned },
    {
      label: 'Services',
      value: locations.filter((l) => l.kind === 'service').length,
      icon: BookOpen,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 lg:px-8 lg:py-10">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-hec-50 text-hec-600">
          <Landmark className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-hec-950">
            À propos de {campus?.name ?? 'HEC Localisation'}
          </h1>
          {campus?.city && (
            <p className="text-sm text-slate-500">{campus.city}</p>
          )}
        </div>
      </div>

      {campus?.tagline && (
        <p className="mt-6 text-lg leading-relaxed text-slate-700">
          {campus.tagline}
        </p>
      )}

      <div className="mt-8 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-100 bg-white p-4 text-center"
          >
            <s.icon className="mx-auto h-5 w-5 text-hec-500" />
            <p className="mt-2 font-display text-xl font-extrabold text-hec-950">
              {s.value}
            </p>
            <p className="text-[11px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* PHASE 9 : contenu administrable — tant que l'administration n'a
         pas encore renseigné ces sections depuis le backend, on affiche
         un vrai état vide plutôt que d'inventer un historique ou des
         coordonnées officielles. */}
      <div className="mt-8 space-y-4">
        <section className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-hec-500" />
            <h2 className="font-display text-lg font-bold text-hec-950">
              Historique
            </h2>
          </div>
          <div className="mt-3">
            <EmptyState
              icon={<Info className="h-5 w-5" />}
              title="Contenu à venir"
              description="L'historique du campus sera ajouté ici par l'administration."
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-hec-500" />
            <h2 className="font-display text-lg font-bold text-hec-950">
              Services
            </h2>
          </div>
          {locations.filter((l) => l.kind === 'service').length === 0 ? (
            <div className="mt-3">
              <EmptyState
                icon={<Info className="h-5 w-5" />}
                title="Aucun service référencé"
                description="Les services du campus apparaîtront ici une fois ajoutés."
              />
            </div>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {locations
                .filter((l) => l.kind === 'service')
                .slice(0, 8)
                .map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-hec-950"
                  >
                    <MapPinned className="h-3.5 w-3.5 text-hec-500" />
                    {l.name}
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-hec-500" />
            <h2 className="font-display text-lg font-bold text-hec-950">
              Contacts officiels
            </h2>
          </div>
          <div className="mt-3">
            <EmptyState
              icon={<Info className="h-5 w-5" />}
              title="Contacts à venir"
              description="Les coordonnées officielles du campus seront ajoutées ici par l'administration."
            />
          </div>
        </section>
      </div>
    </div>
  );
}
