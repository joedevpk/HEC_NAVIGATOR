import type { Map as MLMap } from 'maplibre-gl';
import {
  POI_CATEGORIES,
  poiCategoryColors,
  poiCategoryLabels,
  poiCategorySvgPaths,
  type POICategory,
} from '@/lib/poi-categories';

// ---------------------------------------------------------------------
// Architecture (ÉTAPE 9) :
//
//   POICategory --poiIconId()--> icône MapLibre (image bitmap enregistrée
//   sous un id stable) --loadPoiIcons()--> disponible pour un layer
//   `symbol` via `icon-image`.
//
// Une seule catégorie fourre-tout sert de secours ('other', déjà définie
// dans poi-categories.ts) : aucune icône supplémentaire n'est nécessaire,
// et aucune catégorie inconnue ne peut faire planter MapLibre — voir
// `resolveKnownCategory`.
// ---------------------------------------------------------------------

/** Catégorie affichée quand la valeur reçue n'est pas (ou plus) une
 * `POICategory` reconnue par le projet (ex. donnée externe/legacy). */
const FALLBACK_CATEGORY: POICategory = 'other';

const KNOWN_CATEGORIES = new Set<string>(POI_CATEGORIES);

/** Ramène toute valeur vers une catégorie réellement supportée. Ne
 * retourne jamais `undefined` : un id d'icône est toujours exigible
 * (point 11 du brief). */
function resolveKnownCategory(category: POICategory): POICategory {
  return KNOWN_CATEGORIES.has(category) ? category : FALLBACK_CATEGORY;
}

/** Nom de l'image MapLibre pour une catégorie donnée (utilisé comme
 * `icon-image` dans le layer symbol des POI non groupés). ID stable et
 * inchangé par rapport à la version précédente : `poi-icon-<category>`. */
export function poiIconId(category: POICategory): string {
  return `poi-icon-${resolveKnownCategory(category)}`;
}

/** Libellé français de la catégorie, pour que le composant carte puisse
 * fournir un `alt`/`aria-label` cohérent sur le marqueur (point 8). */
export function poiIconAccessibleLabel(category: POICategory): string {
  return poiCategoryLabels[resolveKnownCategory(category)];
}

// ---------------------------------------------------------------------
// Rendu SVG -> bitmap
// ---------------------------------------------------------------------

/** Taille d'affichage voulue, en pixels CSS. */
const ICON_DISPLAY_SIZE = 32;

/** Résolution du bitmap généré : adaptée au `devicePixelRatio` de
 * l'appareil (Retina/mobile haute densité) sans exploser la mémoire —
 * bornée entre 2x et 3x (point 5 du brief). */
const ICON_PIXEL_RATIO = (() => {
  const dpr = typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 2;
  return Math.min(3, Math.max(2, Math.round(dpr)));
})();
const ICON_BITMAP_SIZE = ICON_DISPLAY_SIZE * ICON_PIXEL_RATIO;

/**
 * Génère un SVG minimal : un cercle de couleur, un liseré blanc, et le
 * pictogramme de la catégorie centré et mis à l'échelle. Pas de balisage
 * superflu, viewBox cohérent avec la taille de rendu.
 */
function buildIconSvg(category: POICategory): string {
  const color = poiCategoryColors[category];
  const path = poiCategorySvgPaths[category];
  const size = ICON_BITMAP_SIZE;
  const scale = (size / 24) * 0.55; // le picto (viewBox 24) occupe ~55% du cercle
  const offset = (size - 24 * scale) / 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - size / 16}" fill="${color}" stroke="#ffffff" stroke-width="${size / 16}"/>` +
    `<g transform="translate(${offset},${offset}) scale(${scale})">` +
    `<path d="${path}" fill="#ffffff"/>` +
    `</g>` +
    `</svg>`
  );
}

/**
 * Cache mémoire des data URLs générées : chaque catégorie ne génère son
 * SVG et son encodage qu'une seule fois par session, même si
 * `loadPoiIcons` est rappelé après un `setStyle` (point 9 : éviter la
 * génération répétée de SVG / data URLs).
 */
const iconDataUrlCache = new Map<POICategory, string>();

function getIconDataUrl(category: POICategory): string {
  const cached = iconDataUrlCache.get(category);
  if (cached) return cached;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildIconSvg(category))}`;
  iconDataUrlCache.set(category, url);
  return url;
}

// ---------------------------------------------------------------------
// Intégration MapLibre
// ---------------------------------------------------------------------

/** `addImage`/`hasImage` exigent un style chargé ; appeler `loadPoiIcons`
 * trop tôt (avant l'événement `load`, ou juste après un `setStyle`)
 * lèverait sinon une erreur MapLibre. On attend silencieusement que le
 * style soit prêt plutôt que de risquer un crash (point 4). */
function waitForStyleReady(map: MLMap): Promise<void> {
  if (map.isStyleLoaded()) return Promise.resolve();
  return new Promise((resolve) => {
    const check = () => {
      if (map.isStyleLoaded()) {
        map.off('styledata', check);
        map.off('load', check);
        resolve();
      }
    };
    map.on('styledata', check);
    map.on('load', check);
  });
}

function loadOneIcon(map: MLMap, category: POICategory): Promise<void> {
  const resolved = resolveKnownCategory(category);
  const id = poiIconId(resolved);
  // Idempotence : si l'image existe déjà, on ne régénère ni SVG, ni
  // Image, ni appel à addImage (point 2 du brief).
  if (map.hasImage(id)) return Promise.resolve();

  return new Promise((resolve) => {
    const img = new Image(ICON_BITMAP_SIZE, ICON_BITMAP_SIZE);
    img.onload = () => {
      try {
        if (!map.hasImage(id)) {
          map.addImage(id, img, { pixelRatio: ICON_PIXEL_RATIO });
        }
      } catch (err) {
        // Une icône qui échoue à s'enregistrer ne doit jamais empêcher
        // les autres de charger ni faire planter la carte (point 11) :
        // le layer symbol se contentera de ne pas afficher ce marqueur.
        console.warn(`[poi-icon-sprites] Échec d'enregistrement de l'icône "${id}" :`, err);
      }
      resolve();
    };
    img.onerror = () => {
      console.warn(`[poi-icon-sprites] Icône illisible pour la catégorie "${resolved}".`);
      resolve();
    };
    img.src = getIconDataUrl(resolved);
  });
}

/**
 * Enregistre les icônes de toutes les catégories sur cette instance de
 * carte. Idempotent (vérifie `hasImage` avant chaque ajout) — peut être
 * rappelé sans risque après un `setStyle` (qui vide les images). Attend
 * que le style soit chargé, et ne fait jamais échouer l'appel global à
 * cause d'une seule icône en erreur : chaque catégorie est traitée
 * indépendamment.
 */
export async function loadPoiIcons(map: MLMap): Promise<void> {
  await waitForStyleReady(map);
  await Promise.all(POI_CATEGORIES.map((cat) => loadOneIcon(map, cat)));
}