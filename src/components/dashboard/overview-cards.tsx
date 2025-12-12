'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Room } from '@/lib/data';
import { List, DoorOpen, Bed } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

const statusVariants: { [key in Room['status']]: string } = {
  Available: "bg-green-900/50 text-green-300",
  Occupied: "bg-red-900/50 text-red-300",
};

function getDateFromTimestampOrDate(date: Date | Timestamp): Date {
  return date instanceof Timestamp ? date.toDate() : date;
}

const DetailRow = ({ room }: { room: Room }) => (
    <div className="grid grid-cols-5 gap-4 items-center p-2 rounded-lg bg-card/50 text-sm">
        <div className="font-semibold">{room.name}</div>
        <div>
            <Badge variant="outline" className={cn("border-transparent", room.status === 'Available' ? statusVariants.Available : statusVariants.Occupied)}>
                {room.status}
            </Badge>
        </div>
        <div>{room.booking?.guestName || 'N/A'}</div>
        <div className="text-right font-mono text-xs">
            {room.payment ? (
                <div>
                    <p>Paid: ₹{room.payment.advancePaid.toFixed(2)}</p>
                    <p className="text-orange-400">Pending: ₹{room.payment.pending.toFixed(2)}</p>
                </div>
            ) : 'N/A'}
        </div>
        <div className="text-right flex items-center justify-end gap-2 text-xs">
             {room.payment ? (
                <>
                    <span>{room.payment.method}</span>
                </>
             ): 'N/A'}
        </div>
    </div>
);

const RoomListDialog = ({ title, rooms, trigger }: { title: string, rooms: Room[], trigger: React.ReactNode }) => (
    <Dialog>
        <DialogTrigger asChild>
            {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>A detailed list of all {title.toLowerCase()} rooms.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-5 gap-4 px-2 py-2 font-semibold text-muted-foreground text-xs sticky top-0 bg-background z-10">
                    <div>Room</div>
                    <div>Status</div>
                    <div>Guest</div>
                    <div className="text-right">Payment</div>
                    <div className="text-right">Method</div>
                </div>
                {rooms.length > 0 ? (
                    rooms.map(room => <DetailRow key={room.id} room={room} />)
                ) : <p className="p-2 text-sm text-muted-foreground text-center">No rooms in this category.</p>}
            </div>
            <DialogFooter>
                <DialogTrigger asChild>
                    <Button variant="outline">Close</Button>
                </DialogTrigger>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);


export function OverviewCards({ rooms }: { rooms: Room[] }) {
  const totalRooms = rooms;
  const availableRooms = rooms.filter(room => room.status === 'Available');
  const occupiedRooms = rooms.filter(room => room.status === 'Occupied');
  const bookedForFuture = rooms.filter(room => room.booking && new Date() < getDateFromTimestampOrDate(room.booking.checkIn) && room.status === 'Available');

  const cardData = [
    { title: 'Total Rooms', data: totalRooms, icon: List },
    { title: 'Rooms Available', data: availableRooms, icon: DoorOpen },
    { title: 'Rooms Occupied', data: occupiedRooms, icon: Bed },
    { title: 'Rooms Booked', data: bookedForFuture, icon: Bed },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
        {cardData.map(({ title, data, icon: Icon }) => (
            <RoomListDialog
                key={title}
                title={title}
                rooms={data}
                trigger={
                    <Card className="cursor-pointer hover:bg-card/80 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{title}</CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.length}</div>
                        </CardContent>
                    </Card>
                }
            />
        ))}
    </div>
  );
}
