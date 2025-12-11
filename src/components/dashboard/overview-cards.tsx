"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, roomsData, Room } from "@/lib/data";
import { Bed, BedDouble, CalendarCheck, DoorOpen, CreditCard, Banknote, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Stat = {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  filter: (room: Room) => boolean;
};

const statusVariants: { [key in Room["status"]]: string } = {
  Available: "bg-green-900/50 text-green-300",
  Booked: "bg-orange-900/50 text-orange-300",
  Occupied: "bg-red-900/50 text-red-300",
};

const paymentMethodIcons = {
  "Credit Card": CreditCard,
  "Cash": Banknote,
  "Bank Transfer": Landmark,
}

function RoomListDialog({ title, rooms }: { title: string; rooms: Room[] }) {
  const showPaymentDetails = rooms.some(room => room.status === 'Booked' || room.status === 'Occupied');

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          A detailed list of all {title.toLowerCase()}.
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-[60vh] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room</TableHead>
              <TableHead>Status</TableHead>
              {showPaymentDetails && (
                <>
                  <TableHead>Guest</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => {
              const PaymentIcon = room.payment ? paymentMethodIcons[room.payment.method] : null;
              return(
              <TableRow key={room.id}>
                <TableCell className="font-medium">{room.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-transparent",
                      statusVariants[room.status]
                    )}
                  >
                    {room.status}
                  </Badge>
                </TableCell>
                {showPaymentDetails && (
                  <>
                    <TableCell>{room.payment?.guestName || 'N/A'}</TableCell>
                    <TableCell className="text-right">${room.payment?.amount.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell>
                      {PaymentIcon && room.payment && (
                        <div className="flex items-center gap-2">
                           <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                           {room.payment.method}
                        </div>
                      )}
                      {!room.payment && 'N/A'}
                    </TableCell>
                  </>
                )}
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>
    </DialogContent>
  );
}

export function OverviewCards() {
  const { totalRooms, bookedRooms, occupiedRooms } = getDashboardStats();
  const availableRooms = totalRooms - bookedRooms - occupiedRooms;

  const stats: Stat[] = [
    {
      title: "Total Rooms",
      value: totalRooms,
      icon: Bed,
      color: "text-blue-400",
      filter: () => true,
    },
    {
      title: "Rooms Available",
      value: availableRooms,
      icon: DoorOpen,
      color: "text-green-400",
      filter: (room) => room.status === "Available",
    },
    {
      title: "Rooms Occupied",
      value: occupiedRooms,
      icon: BedDouble,
      color: "text-red-400",
      filter: (room) => room.status === "Occupied",
    },
    {
      title: "Rooms Booked",
      value: bookedRooms,
      icon: CalendarCheck,
      color: "text-orange-400",
      filter: (room) => room.status === "Booked",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {stats.map((stat) => (
        <Dialog key={stat.title}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon
                  className={cn("h-5 w-5 text-muted-foreground", stat.color)}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <RoomListDialog
            title={stat.title}
            rooms={roomsData.filter(stat.filter)}
          />
        </Dialog>
      ))}
    </div>
  );
}
