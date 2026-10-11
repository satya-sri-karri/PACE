import { PaceProvider } from "@/hooks/use-pace";
import { AppLayout } from "@/components/app-layout";
import { AppBoundary } from "@/components/app-boundary";
export default function Home() {
  return (
    <AppBoundary>
      <PaceProvider>
        <AppLayout />
      </PaceProvider>
    </AppBoundary>
  );
}
