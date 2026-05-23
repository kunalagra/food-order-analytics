import { InsightsDashboard } from "@/components/insights-dashboard";
import { CredentialsProvider } from "@/lib/credentials-context";

export default function HomePage() {
  return (
    <CredentialsProvider>
      <InsightsDashboard />
    </CredentialsProvider>
  );
}
