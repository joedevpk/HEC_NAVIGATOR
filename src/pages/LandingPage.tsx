import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  Compass,
  Home as HomeIcon,
  LayoutDashboard,
  MapPinned,
  Menu,
  MessagesSquare,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { Button, EmptyState, Logo } from '@/components/ui';
import { useNavigate } from '@/lib/router';
import { useCampus } from '@/context/CampusContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const features = [
  {
    icon: Search,
    title: 'Recherche intelligente',
    desc: 'Trouvez rapidement un bâtiment, une salle ou un bureau, où que vous soyez sur le campus.',
  },
  {
    icon: MapPinned,
    title: 'Cartographie interactive',
    desc: 'Explorez le campus HEC sur une carte premium, bâtiment par bâtiment, étage par étage.',
  },
  {
    icon: Compass,
    title: 'Navigation intelligente',
    desc: "Trouvez votre chemin et lancez un itinéraire à pied vers votre destination en un geste.",
  },
  {
    icon: Building2,
    title: 'Identification visuelle',
    desc: 'Découvrez les photos des bâtiments et des lieux avant même d\'y être.',
  },
  {
    icon: MessagesSquare,
    title: 'Assistant intelligent',
    desc: 'Posez vos questions au campus : « Où est la bibliothèque ? » et obtenez une réponse.',
  },
  {
    icon: QrCode,
    title: 'Multilingue',
    desc: "Utilisez l'application en français, en lingala ou en anglais, selon votre préférence.",
  },
];

const howItWorks = [
  { step: '01', title: 'Recherchez', desc: 'Tapez le lieu que vous recherchez dans la barre de recherche.' },
  { step: '02', title: 'Identifiez', desc: 'Découvrez la photo, la description et les informations du lieu.' },
  { step: '03', title: 'Naviguez', desc: 'Lancez le guidage pas à pas vers votre destination.' },
  { step: '04', title: 'Arrivez', desc: 'Suivez votre itinéraire en temps réel jusqu\'au lieu recherché.' },
];

const quickFinds: Array<{
  icon: typeof Building2;
  label: string;
  go?: string;
  kind?: string;
  q?: string;
}> = [
  { icon: Building2, label: 'Bâtiments', go: '/map' },
  { icon: HomeIcon, label: 'Salles', kind: 'room' },
  { icon: Users, label: 'Bureaux', kind: 'office' },
  { icon: MessagesSquare, label: 'Bibliothèque', q: 'bibliothèque' },
  { icon: CalendarDays, label: 'Cafétéria', q: 'cafétéria' },
  { icon: ShieldCheck, label: 'Services', kind: 'service' },
  { icon: MapPinned, label: "Points d'intérêt", kind: 'poi' },
];

const footerColumns = [
  {
    title: 'Navigation',
    links: [
      { label: 'Accueil', href: '/' },
      { label: 'Carte', href: '/map' },
      { label: 'Recherche', href: '/search' },
      { label: 'À propos', href: '/about' },
      { label: 'Aide', href: '/help' },
    ],
  },
  {
    title: 'Plateforme',
    links: [
      { label: 'Connexion', href: '/login' },
      { label: 'Créer un compte', href: '/register' },
      { label: 'Tableau de bord', href: '/login' },
    ],
  },
];

export function LandingPage() {
  const go = useNavigate();
  const { campus, buildings, locations, events, announcements } = useCampus();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroQuery, setHeroQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '#features', label: 'Fonctionnalités' },
    { href: '#campus', label: 'Le campus' },
    { href: '#news', label: 'Actualités' },
  ];

  const submitHeroSearch = (e: FormEvent) => {
    e.preventDefault();
    if (heroQuery.trim()) go('/search', { q: heroQuery.trim() });
    else go('/search');
  };

  // Destinations populaires : les bâtiments réellement en base, avec photo.
  // Fallback propre si aucune photo n'est encore disponible (PHASE 3).
  const popularBuildings = buildings.filter((b) => b.primary_image_url).slice(0, 3);

  // Aperçu "Explorez le campus" : quelques points d'intérêt réels.
  const explorePoints = locations.filter((l) => l.kind === 'poi' || l.kind === 'entrance').slice(0, 4);

  const news = [
    ...announcements.slice(0, 2).map((a) => ({
      id: a.id,
      kind: 'announcement' as const,
      title: a.title,
      body: a.body,
      date: a.created_at,
    })),
    ...events.slice(0, 2).map((ev) => ({
      id: ev.id,
      kind: 'event' as const,
      title: ev.title,
      body: ev.description,
      date: ev.starts_at,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white text-hec-950">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass border-b border-slate-200/70 shadow-glass' : ''
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          <button onClick={() => go('/')} aria-label="Accueil HEC Localisation">
            <Logo />
          </button>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-hec-600">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <LanguageSwitcher compact menuPosition="down" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => go('/login')}
              className="hidden sm:inline-flex"
            >
              Se connecter
            </Button>
            <Button size="sm" onClick={() => go('/register')} className="hidden sm:inline-flex">
              Créer un compte
            </Button>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl text-hec-950 hover:bg-slate-100 md:hidden"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-glass md:hidden">
            <nav className="flex flex-col gap-1 text-base font-medium text-slate-700">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 hover:bg-slate-50 hover:text-hec-600"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <LanguageSwitcher compact menuPosition="down" />
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  go('/login');
                }}
                className="w-full"
              >
                Se connecter
              </Button>
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  go('/register');
                }}
                className="w-full"
              >
                Créer un compte
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br from-hec-100 via-hec-50 to-transparent blur-3xl opacity-70" />
          <div className="absolute right-[-10%] top-40 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-hec-100 bg-hec-50/70 px-3 py-1 text-xs font-semibold text-hec-600">
              <Sparkles className="h-3.5 w-3.5" />
              Smart Campus · {campus?.name ?? 'HEC Kinshasa'}
            </div>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-hec-950 sm:text-6xl lg:text-7xl">
              HEC LOCALISATION
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Découvrez, recherchez et naviguez intelligemment à travers le
              campus {campus?.name ?? 'HEC Kinshasa'}.
            </p>

            {/* Barre de recherche centrale — envoie une vraie requête à /search */}
            <form onSubmit={submitHeroSearch} className="mx-auto mt-8 max-w-xl">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-panel">
                <Search className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
                <input
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder="Où souhaitez-vous aller ? Bibliothèque, salle B204, cafétéria…"
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm text-hec-950 placeholder:text-slate-400 focus:outline-none"
                />
                <Button type="submit" size="sm" className="shrink-0">
                  Rechercher
                </Button>
              </div>
            </form>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                icon={<ArrowRight className="h-5 w-5" />}
                onClick={() => go('/map')}
                className="w-full sm:w-auto"
              >
                Explorer la carte
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => go('/register')}
                className="w-full sm:w-auto"
              >
                Me guider
              </Button>
            </div>
          </div>

          {/* Aperçu visuel premium (mini-prévisualisation, pas d'image décorative) */}
          <div className="mx-auto mt-16 max-w-5xl">
            <button
              onClick={() => go('/map')}
              className="group relative block w-full rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-2 text-left shadow-panel transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-hec-950">
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 p-4 opacity-30">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="rounded-md bg-white/10" />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur transition-transform group-hover:scale-105">
                      <MapPinned className="h-8 w-8 text-hec-300" />
                    </div>
                    <p className="mt-4 font-display text-lg font-bold text-white">
                      {campus?.name ?? 'HEC Kinshasa'}
                    </p>
                    <p className="text-sm text-hec-200">
                      {campus?.tagline ?? 'Le campus HEC, à portée de carte.'}
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl glass px-4 py-2.5 text-xs font-medium text-hec-950">
                  <span className="flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-hec-500" />
                    Bibliothèque, Bâtiment B, Salle B204…
                  </span>
                  <span className="rounded-md bg-hec-500 px-2 py-0.5 text-white">
                    Ouvrir la carte
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* TROUVEZ RAPIDEMENT */}
      <section className="border-t border-slate-100 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-hec-950 sm:text-3xl">
            Trouvez rapidement
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {quickFinds.map((item) => (
              <button
                key={item.label}
                onClick={() =>
                  item.go
                    ? go(item.go)
                    : go('/search', item.kind ? { kind: item.kind } : { q: item.q as string })
                }
                className="flex flex-col items-center gap-2.5 rounded-2xl border border-slate-100 bg-white px-3 py-5 text-center transition-all hover:-translate-y-1 hover:border-hec-100 hover:shadow-panel"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-hec-50 text-hec-600">
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold text-hec-950">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS POPULAIRES */}
      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-hec-950 sm:text-3xl">
            Destinations populaires
          </h2>
          {popularBuildings.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                icon={<Building2 className="h-6 w-6" />}
                title="Pas encore de destinations mises en avant"
                description="Les photos de bâtiments ajoutées par l'administration apparaîtront ici."
              />
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {popularBuildings.map((b) => (
                <div
                  key={b.id}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                >
                  <div
                    className="h-40 bg-slate-100 bg-cover bg-center"
                    style={{ backgroundImage: `url(${b.primary_image_url})` }}
                  />
                  <div className="p-4">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <MapPinned className="h-3.5 w-3.5" /> {campus?.name ?? 'Campus HEC'}
                    </p>
                    <p className="mt-1 font-display text-base font-bold text-hec-950">
                      {b.name}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => go('/map', { building: b.id })}
                        className="flex-1"
                      >
                        Voir
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => go('/map', { building: b.id, guide: '1' })}
                        className="flex-1"
                      >
                        Me guider
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* EXPLOREZ LE CAMPUS */}
      <section id="campus" className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-hec-500">
                Haute École de Commerce de Kinshasa
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-hec-950 sm:text-4xl">
                Explorez le campus
              </h2>
              <p className="mt-5 text-slate-600">
                Étudiants, enseignants, personnel et visiteurs trouvent
                désormais chaque salle, chaque bureau et chaque service du
                campus HEC en quelques secondes.
              </p>
              {explorePoints.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {explorePoints.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 text-sm font-medium text-hec-950"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-hec-50 text-hec-600">
                        <MapPinned className="h-4 w-4" />
                      </span>
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
              <Button
                className="mt-7"
                icon={<ArrowRight className="h-4 w-4" />}
                onClick={() => go('/map')}
              >
                Ouvrir la carte
              </Button>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-panel">
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-1 p-4">
                {Array.from({ length: 64 }).map((_, i) => {
                  const filled = [3, 4, 5, 12, 13, 20, 21, 28, 29, 36, 37, 44].includes(i);
                  return (
                    <div
                      key={i}
                      className={`rounded-md ${filled ? 'bg-hec-100' : 'bg-slate-50'}`}
                    />
                  );
                })}
              </div>
              <div className="absolute left-1/3 top-1/4 grid h-10 w-10 place-items-center rounded-full bg-hec-500 text-white shadow-lg ring-4 ring-white">
                <MapPinned className="h-5 w-5" />
              </div>
              <div className="absolute right-1/4 top-1/2 grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white shadow-lg ring-4 ring-white">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="features" className="border-t border-slate-100 bg-slate-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-hec-500">
              Une plateforme complète
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-hec-950 sm:text-4xl">
              Tout le campus, dans une seule application.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-100 bg-white p-6 transition-all hover:-translate-y-1 hover:border-hec-100 hover:shadow-panel"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-hec-50 text-hec-600 transition-colors group-hover:bg-hec-500 group-hover:text-white">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-hec-950">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold text-hec-950 sm:text-4xl">
            Comment ça marche
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((s, i) => (
              <div key={s.step} className="relative text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-hec-950 font-display text-lg font-bold text-white">
                  {s.step}
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-hec-950">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-600">{s.desc}</p>
                {i < howItWorks.length - 1 && (
                  <div className="mx-auto mt-4 hidden h-px w-full max-w-[3rem] bg-slate-200 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTUALITÉS */}
      <section id="news" className="border-t border-slate-100 bg-slate-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold text-hec-950 sm:text-4xl">
              Actualités
            </h2>
            <Button variant="ghost" size="sm" onClick={() => go('/login')}>
              Voir toutes les actualités
            </Button>
          </div>
          {news.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                icon={<CalendarDays className="h-6 w-6" />}
                title="Aucune actualité pour le moment"
                description="Les annonces et événements publiés par l'administration apparaîtront ici."
              />
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {news.map((n) => (
                <div
                  key={n.id}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-hec-50 px-2.5 py-1 text-[11px] font-semibold text-hec-600">
                    {n.kind === 'event' ? (
                      <>
                        <CalendarDays className="h-3 w-3" /> Événement
                      </>
                    ) : (
                      <>
                        <Bell className="h-3 w-3" /> Actualité
                      </>
                    )}
                  </span>
                  <p className="mt-3 font-display text-base font-bold text-hec-950">
                    {n.title}
                  </p>
                  <p className="mt-1.5 line-clamp-3 text-sm text-slate-600">{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AIDE */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-5 text-center lg:px-8">
          <h2 className="font-display text-2xl font-bold text-hec-950 sm:text-3xl">
            Besoin d'aide ?
          </h2>
          <p className="mt-3 text-slate-600">
            Consultez le centre d'aide ou posez votre question à HEC
            Assistant une fois connecté.
          </p>
          <Button
            size="lg"
            className="mt-6"
            icon={<MessagesSquare className="h-5 w-5" />}
            onClick={() => go('/help')}
          >
            Ouvrir l'aide
          </Button>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-slate-100 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <h2 className="font-display text-3xl font-bold text-hec-950 sm:text-4xl">
            Prêt à explorer le campus HEC ?
          </h2>
          <p className="mt-4 text-slate-600">
            Lancez-vous en quelques secondes. La carte est publique, créez un
            compte pour enregistrer vos favoris et votre historique.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              icon={<ArrowRight className="h-5 w-5" />}
              onClick={() => go('/map')}
              className="w-full sm:w-auto"
            >
              Explorer le campus
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => go('/register')}
              className="w-full sm:w-auto"
            >
              Créer un compte
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER PREMIUM */}
      <footer className="border-t border-slate-100 bg-white py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Logo size="sm" />
              <p className="mt-4 max-w-[220px] text-sm text-slate-500">
                La plateforme Smart Campus du {campus?.name ?? 'HEC Kinshasa'}.
              </p>
            </div>
            {footerColumns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {col.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <button
                        onClick={() => go(link.href)}
                        className="text-sm text-slate-600 hover:text-hec-600"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Informations
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Confidentialité</li>
                <li>Conditions</li>
                <li>Accessibilité</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} HEC Localisation · Données de démonstration
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5" /> Tableau de bord
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
