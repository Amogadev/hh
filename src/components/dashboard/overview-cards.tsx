'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Room } from '@/lib/data';
import { List, Bed, DoorOpen, BedDouble, CalendarCheck, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


const statusVariants: { [key in Room['status']]: string } = {
  Available: "bg-green-900/50 text-green-300",
  Booked: "bg-orange-900/50 text-orange-300",
  Occupied: "bg-red-900/50 text-red-300",
};


export function OverviewCards({ rooms }: { rooms: Room[] }) {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:bg-card/80 flex flex-col flex-grow">
          <CardHeader>
            <CardTitle>Room Details</CardTitle>
            <CardDescription>
              Click to see an overview of room statistics.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <List className="h-16 w-16 text-muted-foreground" />
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Total Rooms</DialogTitle>
          <DialogDescription>
            A detailed list of all total rooms.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
           <div className="grid grid-cols-5 gap-4 px-4 py-2 font-semibold text-muted-foreground text-sm">
                <div>Room</div>
                <div>Status</div>
                <div>Guest</div>
                <div className="text-right">Amount</div>
                <div className="text-right">Method</div>
           </div>
           <div className="space-y-2">
            {rooms.map(room => (
                <div key={room.id} className="grid grid-cols-5 gap-4 items-center p-4 rounded-lg bg-card/50">
                    <div className="font-semibold">{room.name}</div>
                    <div>
                        <Badge variant="outline" className={cn("border-transparent", statusVariants[room.status])}>
                            {room.status}
                        </Badge>
                    </div>
                    <div>{room.booking?.guestName || 'N/A'}</div>
                    <div className="text-right font-mono">
                        {room.payment ? `₹${room.payment.amount.toFixed(2)}` : 'N/A'}
                    </div>
                    <div className="text-right flex items-center justify-end gap-2">
                         {room.payment ? (
                            <>
                                <CreditCard className="w-4 h-4 text-muted-foreground" />
                                <span>{room.payment.method}</span>
                            </>
                         ): 'N/A'}
                    </div>
                </div>
            ))}
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
