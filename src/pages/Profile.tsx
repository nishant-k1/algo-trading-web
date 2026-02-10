import { useState } from "react";
import { apiPost } from "../api/client";

export default function Profile() {
  const storedEmail = typeof window !== "undefined" ? localStorage.getItem("user_email") : null;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPassword || newPassword !== confirmPassword) {
      setError("New password and confirmation must match.");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/api/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-terminal-bg flex items-start justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-terminal-border bg-terminal-surface p-6 shadow-xl mt-10">
        <h1 className="text-xl font-semibold text-terminal-fg mt-0 mb-4">Profile</h1>
        <p className="text-terminal-muted text-sm mb-4">
          Signed in as{" "}
          <span className="text-terminal-fg font-mono">
            {storedEmail || "unknown (email not stored locally)"}
          </span>
        </p>

        <h2 className="text-sm font-semibold text-terminal-fg mb-2">Change password</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="current-password" className="block text-terminal-muted text-sm mb-1">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded border border-terminal-border bg-terminal-panel text-terminal-fg placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-groww/50 focus:border-groww"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-terminal-muted text-sm mb-1">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded border border-terminal-border bg-terminal-panel text-terminal-fg placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-groww/50 focus:border-groww"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-terminal-muted text-sm mb-1">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded border border-terminal-border bg-terminal-panel text-terminal-fg placeholder-terminal-muted focus:outline-none focus:ring-2 focus:ring-groww/50 focus:border-groww"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-loss text-sm" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-profit text-sm" role="status">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-2.5 px-4 rounded font-medium bg-groww text-terminal-bg hover:bg-groww-hover focus:outline-none focus:ring-2 focus:ring-groww focus:ring-offset-2 focus:ring-offset-terminal-bg disabled:opacity-60 transition-colors"
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

