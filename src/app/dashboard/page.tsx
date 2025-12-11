import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RoomStatus } from "@/components/dashboard/room-status";
import { DailyRevenue } from "@/components/dashboard/daily-revenue";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <OverviewCards />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RoomStatus />
        </div>
        <div>
          <DailyRevenue />
        </div>
      </div>
    </div>
  );
}
