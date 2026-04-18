import LegalPageLayout from "@/components/layout/LegalPageLayout";

export const metadata = { title: "Terms of Service — Nexus" };

export default function TermsPage() {
  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      content: (
        <p>
          By accessing or using the Nexus Workspace platform ("Nexus", "we", "our", or "us"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. These terms apply to all visitors, users, and others who access or use the Service.
        </p>
      )
    },
    {
      id: "use-of-platform",
      title: "Use of the Platform",
      content: (
        <>
          <p>
            Nexus provides tools for summarizing video content, managing digital notes, and generating AI-assisted intelligence reports. We grant you a limited, non-exclusive, non-transferable, and revocable license to use our platform strictly in accordance with these Terms.
          </p>
          <p>
            You agree to use the platform only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the platform.
          </p>
        </>
      )
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use Policy",
      content: (
        <p>
          You agree not to use the Service in any unauthorized manner, including but not limited to, trespassing, burdening network capacity, or manipulating the system to extract data or bypass AI quotas. Generating content that is illegal, harmful, or violates third-party intellectual property rights is strictly prohibited.
        </p>
      )
    },
    {
      id: "account",
      title: "Account Responsibilities",
      content: (
        <p>
          To access certain features, you must create an account. You are entirely responsible for maintaining the confidentiality of your account information, including your password, and for any and all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account.
        </p>
      )
    },
    {
      id: "termination",
      title: "Termination",
      content: (
        <p>
          We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
        </p>
      )
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      content: (
        <p>
          In no event shall Nexus, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
        </p>
      )
    },
    {
      id: "changes",
      title: "Changes to Terms",
      content: (
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
        </p>
      )
    },
    {
      id: "governing-law",
      title: "Governing Law",
      content: (
        <p>
          These Terms shall be governed and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
        </p>
      )
    }
  ];

  return <LegalPageLayout title="Terms of Service" lastUpdated="April 2026" sections={sections} />;
}
