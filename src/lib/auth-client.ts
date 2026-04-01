import toast from "react-hot-toast";

export async function migrateGuestData(userId: string) {
  const guestDataRaw = localStorage.getItem("guest_data");
  if (!guestDataRaw) return;

  try {
    const parsed = JSON.parse(guestDataRaw);

    // Save notes to database
    if (parsed.notes?.length > 0) {
      const res = await fetch("/api/notes/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, notes: parsed.notes }),
      });
      if (!res.ok) throw new Error("Failed to migrate notes");
    }

    // Save summaries to database
    if (parsed.summaries?.length > 0) {
      const res = await fetch("/api/summaries/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, summaries: parsed.summaries }),
      });
      if (!res.ok) throw new Error("Failed to migrate summaries");
    }

    // Clear guest data only AFTER successful migration
    localStorage.removeItem("guest_data");
    toast.success("Your guest data has been saved to your account!");
  } catch (err) {
    console.error("Migration failed:", err);
    toast.error("Could not migrate some guest data. It remains in your browser.");
  }
}
