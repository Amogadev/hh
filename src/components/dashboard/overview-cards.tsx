'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
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
    <Dialog>
        <DialogTrigger asChild>
            <Card className="cursor-pointer hover:bg-card/80">
                <CardHeader>
                    <CardTitle>Room Details</CardTitle>
                    <CardDescription>
                        Click to see an overview of room statistics.
                    </CardDescription>
                </CardHeader>
            </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Room Overview</DialogTitle>
                <DialogDescription>
                    A quick look at the current status of all rooms.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 grid-cols-2 py-4">
                {stats.map((stat) => (
                    <div key={stat.title} className="flex items-center gap-4 p-2 rounded-lg bg-card">
                        <stat.icon className={cn("h-8 w-8", stat.color)} />
                        <div>
                            <p className="text-lg font-bold">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>
        </DialogContent>
    </Dialog>
  );
}
