// Pixel loading bar (Doc 08 §26): [████░░░░░░] — tanpa spinner dekoratif.
export function PixelLoading({ label = 'LOADING' }: { label?: string }) {
  return (
    <p
      className="font-pixel text-pixel-sm text-gray-300 label-pixel"
      role="status"
      aria-live="polite"
    >
      {label}…
      <span className="ml-2 inline-block" aria-hidden>
        ████░░░░░░
      </span>
    </p>
  );
}
