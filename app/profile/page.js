"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] =
    useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");
  const [passwordError, setPasswordError] = useState("");

  // ----------------------------------
  // Load Profile
  // ----------------------------------

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          router.push("/login");
          return;
        }

        setUser(data.user);

        setName(data.user.name || "");
        setProfileImage(data.user.profileImage || "");
      } catch (error) {
        console.error("PROFILE LOAD ERROR:", error);
        setProfileError("Unable to load profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  // ----------------------------------
  // Update Profile
  // ----------------------------------

  async function handleProfileUpdate(e) {
    e.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (!name.trim()) {
      setProfileError("Name is required.");
      return;
    }

    try {
      setSavingProfile(true);

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          profileImage: profileImage.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update profile."
        );
      }

      setUser(data.user);

      setName(data.user.name || "");
      setProfileImage(data.user.profileImage || "");

      setProfileMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      setProfileError(
        error.message ||
          "Unable to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  // ----------------------------------
  // Change Password
  // ----------------------------------

  async function handlePasswordChange(e) {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Please fill all password fields."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(
        "/api/profile/password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to change password."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordMessage(
        "Password changed successfully."
      );
    } catch (error) {
      setPasswordError(
        error.message ||
          "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  // ----------------------------------
  // Logout
  // ----------------------------------

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  }

  // ----------------------------------
  // Loading
  // ----------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse">
            <div className="h-10 w-48 rounded-lg bg-white/10" />

            <div className="mt-8 h-64 rounded-2xl bg-white/5" />
          </div>
        </div>
      </main>
    );
  }

  const initials =
    user?.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">

          <button
            onClick={() => router.push("/dashboard")}
            className="mb-4 text-sm text-slate-400 transition hover:text-cyan-400"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your DigitalDost account information.
          </p>

        </div>

        {/* Profile Card */}
        <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">

          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center">

            {/* Avatar */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-400/30 bg-cyan-500/10">

              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <span className="text-2xl font-bold text-cyan-400">
                  {initials}
                </span>
              )}

            </div>

            <div>
              <h2 className="text-2xl font-semibold">
                {user?.name}
              </h2>

              <p className="mt-1 text-slate-400">
                {user?.email}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Member since{" "}
                {user?.createdAt
                  ? new Date(
                      user.createdAt
                    ).toLocaleDateString()
                  : "—"}
              </p>
            </div>

          </div>

          {/* Profile Form */}
          <form
            onSubmit={handleProfileUpdate}
            className="space-y-5"
          >

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                maxLength={100}
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email Address
              </label>

              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-slate-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Email address cannot be changed from this page.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Profile Image URL
              </label>

              <input
                type="url"
                value={profileImage}
                onChange={(e) =>
                  setProfileImage(e.target.value)
                }
                placeholder="https://example.com/profile.jpg"
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
              />

              <p className="mt-2 text-xs text-slate-500">
                Optional. Leave empty to use your initials.
              </p>
            </div>

            {profileError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                {profileError}
              </div>
            )}

            {profileMessage && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
                {profileMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingProfile
                ? "Saving..."
                : "Save Profile"}
            </button>

          </form>
        </section>

        {/* Password Card */}
        <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">

          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Change Password
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Update your account password securely.
            </p>
          </div>

          <form
            onSubmit={handlePasswordChange}
            className="space-y-5"
          >

            {/* Current Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Current Password
              </label>

              <div className="relative">

                <input
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 pr-12 text-white outline-none transition focus:border-cyan-400"
                  placeholder="Enter current password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(
                      !showCurrentPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-white"
                >
                  {showCurrentPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                New Password
              </label>

              <div className="relative">

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 pr-12 text-white outline-none transition focus:border-cyan-400"
                  placeholder="Enter new password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-white"
                >
                  {showNewPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Confirm New Password
              </label>

              <div className="relative">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 pr-12 text-white outline-none transition focus:border-cyan-400"
                  placeholder="Confirm new password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-white"
                >
                  {showConfirmPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>
            </div>

            {passwordError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                {passwordError}
              </div>
            )}

            {passwordMessage && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
                {passwordMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={changingPassword}
              className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {changingPassword
                ? "Changing Password..."
                : "Change Password"}
            </button>

          </form>
        </section>

        {/* Account Actions */}
        <section className="rounded-2xl border border-red-500/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">

          <h2 className="text-xl font-semibold">
            Account
          </h2>

          <p className="mt-1 mb-5 text-sm text-slate-400">
            Manage your current session.
          </p>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-3 font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            Logout
          </button>

        </section>

      </div>
    </main>
  );
}