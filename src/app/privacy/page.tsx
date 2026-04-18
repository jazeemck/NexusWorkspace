import LegalPageLayout from "@/components/layout/LegalPageLayout";

export const metadata = { title: "Privacy Policy — Nexus" };

export default function PrivacyPage() {
  const sections = [
    {
      id: "what-we-collect",
      title: "What We Collect",
      content: (
        <>
          <p>
            When you use Nexus, we collect certain personal information to provide and improve our services. This includes account information (such as your name, email address, and authentication tokens via Google OAuth), content data (such as notes, highlighted text, and metadata of videos you summarize), and usage metrics.
          </p>
          <p>
            We do not collect sensitive personal data such as payment details directly on our servers; any billing information is handled securely by our third-party payment processors.
          </p>
        </>
      )
    },
    {
      id: "how-we-use",
      title: "How We Use Your Data",
      content: (
        <p>
          Your data is used exclusively to power the Nexus platform. We use it to authenticate your identity, generate AI summaries based on your prompts and inputs, synchronize your workspace across devices, and to provide dynamic intelligence features such as your Research Health Score and Blind Spot Analysis.
        </p>
      )
    },
    {
      id: "ai-providers",
      title: "AI & Third-Party Providers",
      content: (
        <p>
          Nexus utilizes advanced third-party AI models (including Google Gemini and Groq) to process content summaries and intelligence reports. When you request an AI summary, the relevant metadata or transcript is sent to these providers securely. We restrict our AI partners from using your private notes to train their public models.
        </p>
      )
    },
    {
      id: "security",
      title: "Data Storage & Security",
      content: (
        <p>
          We employ industry-standard encryption protocols to protect your data both in transit and at rest. Your notes, summaries, and authentication credentials are secure inside our Supabase-managed database, which adheres to strict modern compliance and isolation standards.
        </p>
      )
    },
    {
      id: "cookies",
      title: "Cookies",
      content: (
        <p>
          We use strictly necessary cookies to maintain your login session and application state. We do not use intrusive third-party advertising cookies, ensuring your workspace remains clean and private.
        </p>
      )
    },
    {
      id: "your-rights",
      title: "Your Rights",
      content: (
        <p>
          Depending on your location, you may have rights regarding your personal data, including the right to access, correct, or delete the personal information we hold about you. You can export your notes at any time from your dashboard settings.
        </p>
      )
    },
    {
      id: "deletion",
      title: "Data Deletion",
      content: (
        <p>
          You have the right to be forgotten. If you choose to delete your Nexus account, all your personal data, notes, and generated summaries will be permanently erased from our active databases within 30 days. You can initiate this process directly from your account settings.
        </p>
      )
    },
    {
      id: "contact",
      title: "Contact & Questions",
      content: (
        <p>
          If you have any questions or concerns about this Privacy Policy, please reach out to us via the Contact Us page or at privacy@nexusworkspace.com. We are committed to resolving your privacy inquiries promptly.
        </p>
      )
    }
  ];

  return <LegalPageLayout title="Privacy Policy" lastUpdated="April 2026" sections={sections} />;
}
