import { PaceProvider } from "@/hooks/use-pace";
import { AppLayout } from "@/components/app-layout";
export default function Home() {
  return (
    <PaceProvider>
      <AppLayout />
    </PaceProvider>
  );
}
