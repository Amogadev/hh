import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/data";
import { Bed, BedDouble, CalendarCheck, DoorOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function OverviewCards() {
  const { totalRooms, bookedRooms, occupiedRooms } = getDashboardStats();
  const availableRooms = totalRooms - bookedRooms - occupiedRooms;

  const stats = [
    {
      title: "Total Rooms",
      value: totalRooms,
      icon: Bed,
      color: "text-blue-400",
    },
    {
      title: "Rooms Available",
      value: availableRooms,
      icon: DoorOpen,
      color: "text-green-400",
      cardColor: "border-green-500/50",
    },
    {
      title: "Rooms Occupied",
      value: occupiedRooms,
      icon: BedDouble,
      color: "text-red-400",
      cardColor: "border-red-500/50",
    },
    {
      title: "Rooms Booked",
      value: bookedRooms,
      icon: CalendarCheck,
      color: "text-orange-400",
      cardColor: "border-orange-500/50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className={cn("border-l-4", stat.cardColor)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={cn("h-5 w-5 text-muted-foreground", stat.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
