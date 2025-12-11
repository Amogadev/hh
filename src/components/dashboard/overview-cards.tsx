"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Room } from "@/lib/data";
import { Bed, BedDouble, CalendarCheck, DoorOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type Stat = {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
};

export function OverviewCards({ rooms }: { rooms: Room[] }) {
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'Available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const bookedRooms = rooms.filter(r => r.status === 'Booked').length;

  const stats: Stat[] = [
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
    },
    {
      title: "Rooms Occupied",
      value: occupiedRooms,
      icon: BedDouble,
      color: "text-red-400",
    },
    {
      title: "Rooms Booked",
      value: bookedRooms,
      icon: CalendarCheck,
      color: "text-orange-400",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Details</CardTitle>
        <CardDescription>
            A quick look at the current status of all rooms.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 grid-cols-2">
        {stats.map((stat) => (
            <div key={stat.title} className="flex items-center gap-4">
                <stat.icon className={cn("h-6 w-6", stat.color)} />
                <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                </div>
            </div>
        ))}
      </CardContent>
    </Card>
  );
}
