import toast from "react-hot-toast";

export async function migrateGuestData(userId: string) {
  const guestDataRaw = localStorage.getItem("guest_data");
  if (!guestDataRaw) return;

  let parsed: any;
  try {
    parsed = JSON.parse(guestDataRaw);
  } catch {
    console.warn("Invalid guest data, clearing.");
    localStorage.removeItem("guest_data");
    return;
  }

  try {
    // Save notes to database
    if (parsed.notes?.length > 0) {
      const res = await fetch("/api/notes/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, notes: parsed.notes }),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        const message = errorBody?.error || errorBody?.message || `HTTP ${res.status}`;
        throw new Error(`Failed to migrate notes: ${message}`);
      }
    }

    // Save summaries to database
    if (parsed.summaries?.length > 0) {
      const res = await fetch("/api/summaries/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, summaries: parsed.summaries }),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        const message = errorBody?.error || errorBody?.message || `HTTP ${res.status}`;
        throw new Error(`Failed to migrate summaries: ${message}`);
      }
    }

    // Clear guest data only AFTER successful migration
    localStorage.removeItem("guest_data");
    toast.success("Your guest data has been saved to your account!");
  } catch (err) {
    console.error("Migration error (guest data preserved):", err);
    toast.error("Could not migrate some guest data. It remains in your browser.");
  }
}
