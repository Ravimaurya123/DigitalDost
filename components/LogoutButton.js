"use client";

export default function LogoutButton() {
  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
    >
      <span>🚪</span>
      <span>Logout</span>
    </button>
  );
}