import { StoreProvider } from "@/lib/store";
import Shell from "@/components/Shell";

// Authenticated area. The proxy guarantees a session before any of these routes
// render; the store loads the signed-in profile for the UI.
export default function DashboardLayout({ children }) {
  return (
    <StoreProvider>
      <Shell>{children}</Shell>
    </StoreProvider>
  );
}
