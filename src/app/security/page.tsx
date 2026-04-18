import LegalPageLayout from "@/components/layout/LegalPageLayout";

export const metadata = { title: "Security — Nexus" };

export default function SecurityPage() {
  const sections = [
    {
      id: "encryption",
      title: "Encryption",
      content: (
        <p>
          At Nexus, securing your cognitive workspace is our top priority. All data transmitted between your browser and our servers is encrypted in transit using industry-standard TLS 1.3. Furthermore, your notes, summaries, and sensitive profile information are encrypted at rest using AES-256 encryption within our database.
        </p>
      )
    },
    {
      id: "authentication",
      title: "Authentication",
      content: (
        <p>
          We rely on robust OAuth 2.0 protocols to handle authentication securely. By integrating directly with trusted providers like Google, we ensure that password hashes are never stored on our servers. Your active session tokens are mathematically signed and verifiable to prevent session hijacking.
        </p>
      )
    },
    {
      id: "handling",
      title: "File & Document Handling",
      content: (
        <p>
          Files uploaded to Nexus for local summarization (such as PDFs or DOCX files) are processed entirely within your local browser environment. We extract text using client-side parsers and send only the resulting text payload to our AI gateway. The files themselves are never saved on our servers, ensuring your raw local documents remain strictly confidential.
        </p>
      )
    },
    {
      id: "infrastructure",
      title: "Infrastructure",
      content: (
        <p>
          Nexus is hosted on Vercel's global edge network, providing DDOS protection, rate-limiting, and highly isolated edge runtimes. Our underlying Postgres database is managed by Supabase, adhering to SOC2 Types II compliance standards and utilizing row-level security (RLS) policies to ensure that users can only access their own private records.
        </p>
      )
    },
    {
      id: "response",
      title: "Incident Response",
      content: (
        <p>
          In the event of a security anomaly, our infrastructure automatically flags suspicious behavioral patterns. We maintain a strict incident response protocol designed to identify, contain, and resolve potential vulnerabilities within 24 hours while remaining transparent with affected users.
        </p>
      )
    },
    {
      id: "bugs",
      title: "Bug Reporting",
      content: (
        <p>
          We welcome contributions from the security community. If you discover a vulnerability or a bug in the Nexus Workspace platform, please report it immediately via the Contact page or directly to security@nexusworkspace.com. We review all reports and aim to issue patches swiftly.
        </p>
      )
    }
  ];

  return <LegalPageLayout title="Security Overview" lastUpdated="April 2026" sections={sections} />;
}
