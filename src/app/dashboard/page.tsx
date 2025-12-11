import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RoomStatusGrid } from "@/components/dashboard/room-status-grid";
import { PaymentDetails } from "@/components/dashboard/payment-details";
import { ApiKeyGenerator } from "@/components/dashboard/api-key-generator";

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div className="flex flex-1 flex-col gap-4 rounded-lg shadow-sm">
        <div className="space-y-4">
          <OverviewCards />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4">
              <RoomStatusGrid />
            </div>
            <div className="lg:col-span-3">
              <PaymentDetails />
            </div>
          </div>
          <ApiKeyGenerator />
        </div>
      </div>
    </main>
  );
}
