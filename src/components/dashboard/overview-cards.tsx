import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/data";
import { Hotel, BedDouble, Bookmark } from "lucide-react";

export function OverviewCards() {
  const { totalRooms, bookedRooms, occupiedRooms } = getDashboardStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
          <Hotel className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRooms}</div>
          <p className="text-xs text-muted-foreground">Total rooms in the hotel</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Booked Rooms</CardTitle>
          <Bookmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{bookedRooms}</div>
          <p className="text-xs text-muted-foreground">Reservations for future dates</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
          <BedDouble className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{occupiedRooms}</div>
          <p className="text-xs text-muted-foreground">Rooms currently with guests</p>
        </CardContent>
      </Card>
    </div>
  );
}
