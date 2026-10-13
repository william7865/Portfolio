import { notFound } from 'next/navigation';

/**
 * Any unknown path under a locale. Without this catch-all Next falls back to
 * the root not-found page, which is French-only and has no header or footer;
 * throwing here renders the localized `[lang]/not-found.tsx` inside the layout.
 */
export default function UnknownPath() {
  notFound();
}
