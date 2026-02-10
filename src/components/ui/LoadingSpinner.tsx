interface LoadingSpinnerProps {
  /** Optional label for screen readers */
  label?: string;
}

export default function LoadingSpinner({ label = "Loading" }: LoadingSpinnerProps) {
  return (
    <div
      className="flex min-h-[50vh] w-full flex-1 items-center justify-center"
      role="status"
      aria-label={label}
    >
      <div className="loading-spinner" />
    </div>
  );
}
