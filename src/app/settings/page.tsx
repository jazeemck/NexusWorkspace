import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings — Nexus Workspace" };

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    return <SettingsClient session={session} />;
}
