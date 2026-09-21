"use client";

import { useEffect } from "react";

export default function ReminderNotification() {
  useEffect(() => {
    if (!("Notification" in window)) {
      console.log("Browser notifications are not supported.");
      return;
    }

    async function requestPermission() {
      try {
        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }
      } catch (error) {
        console.error("NOTIFICATION PERMISSION ERROR:", error);
      }
    }

    requestPermission();
  }, []);

  useEffect(() => {
    if (!("Notification" in window)) {
      return;
    }

    let interval;

    async function checkReminders() {
      try {
        const response = await fetch("/api/reminders", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.reminders)) {
          return;
        }

        const now = new Date();

        data.reminders.forEach((reminder) => {
          if (reminder.completed) {
            return;
          }

          const reminderTime = new Date(reminder.reminderDate);

          const difference =
            now.getTime() - reminderTime.getTime();

          // Reminder time ke 1 minute ke andar notification
          if (difference >= 0 && difference <= 60 * 1000) {
            showNotification(reminder);
          }
        });
      } catch (error) {
        console.error("CHECK REMINDERS ERROR:", error);
      }
    }

    function showNotification(reminder) {
      if (Notification.permission !== "granted") {
        return;
      }

      const notificationKey =
        `digitaldost-reminder-${reminder._id}`;

      const alreadyShown =
        sessionStorage.getItem(notificationKey);

      if (alreadyShown) {
        return;
      }

      sessionStorage.setItem(notificationKey, "true");

      const notification = new Notification(
        "DigitalDost Reminder 🔔",
        {
          body: reminder.description
            ? `${reminder.title}\n${reminder.description}`
            : reminder.title,
          icon: "/favicon.ico",
        }
      );

      notification.onclick = () => {
        window.focus();
        window.location.href = "/reminders";
      };
    }

    // Immediately check
    checkReminders();

    // Every 30 seconds check
    interval = setInterval(() => {
      checkReminders();
    }, 30 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return null;
}