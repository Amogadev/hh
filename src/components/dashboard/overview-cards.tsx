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
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Room } from '@/lib/data';
import { List, Bed, DoorOpen, BedDouble, CalendarCheck, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';


const statusVariants: { [key in Room['status']]: string } = {
  Available: "bg-green-900/50 text-green-300",
  Booked: "bg-orange-900/50 text-orange-300",
  Occupied: "bg-red-900/50 text-red-300",
};

function getDateFromTimestampOrDate(date: Date | Timestamp): Date {
    return date instanceof Timestamp ? date.toDate() : date;
}


const DetailRow = ({ room }: { room: Room }) => (
    <div className="grid grid-cols-5 gap-4 items-center p-2 rounded-lg bg-card/50 text-sm">
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
        <div className="text-right flex items-center justify-end gap-2 text-xs">
             {room.payment ? (
                <>
                    <CreditCard className="w-3 h-3 text-muted-foreground" />
                    <span>{room.payment.method}</span>
                </>
             ): 'N/A'}
        </div>
    </div>
);


export function OverviewCards({ rooms }: { rooms: Room[] }) {
  const totalRooms = rooms;
  const availableRooms = rooms.filter(room => room.status === 'Available');
  const occupiedRooms = rooms.filter(room => room.status === 'Occupied');
  const bookedRooms = rooms.filter(room => room.status === 'Booked');

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
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Room Overview</DialogTitle>
          <DialogDescription>
            Click each section to see a detailed list of rooms.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Accordion type="multiple" defaultValue={['total']} className="w-full">
            
            {/* Total Rooms */}
            <AccordionItem value="total">
              <AccordionTrigger className='font-semibold'>Total Rooms ({totalRooms.length})</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-4 px-2 py-2 font-semibold text-muted-foreground text-xs">
                        <div>Room</div>
                        <div>Status</div>
                        <div>Guest</div>
                        <div className="text-right">Amount</div>
                        <div className="text-right">Method</div>
                    </div>
                    {totalRooms.map(room => <DetailRow key={room.id} room={room} />)}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Rooms Available */}
            <AccordionItem value="available">
              <AccordionTrigger className='font-semibold'>Rooms Available ({availableRooms.length})</AccordionTrigger>
              <AccordionContent>
                 <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-4 px-2 py-2 font-semibold text-muted-foreground text-xs">
                        <div>Room</div>
                        <div>Status</div>
                        <div>Guest</div>
                        <div className="text-right">Amount</div>
                        <div className="text-right">Method</div>
                    </div>
                    {availableRooms.length > 0 ? (
                        availableRooms.map(room => <DetailRow key={room.id} room={room} />)
                    ) : <p className="p-2 text-sm text-muted-foreground">No available rooms.</p>}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Rooms Occupied */}
            <AccordionItem value="occupied">
              <AccordionTrigger className='font-semibold'>Rooms Occupied ({occupiedRooms.length})</AccordionTrigger>
              <AccordionContent>
                 <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-4 px-2 py-2 font-semibold text-muted-foreground text-xs">
                        <div>Room</div>
                        <div>Status</div>
                        <div>Guest</div>
                        <div className="text-right">Amount</div>
                        <div className="text-right">Method</div>
                    </div>
                    {occupiedRooms.length > 0 ? (
                        occupiedRooms.map(room => <DetailRow key={room.id} room={room} />)
                    ) : <p className="p-2 text-sm text-muted-foreground">No occupied rooms.</p>}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Rooms Booked */}
            <AccordionItem value="booked">
              <AccordionTrigger className='font-semibold'>Rooms Booked ({bookedRooms.length})</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-4 px-2 py-2 font-semibold text-muted-foreground text-xs">
                        <div>Room</div>
                        <div>Status</div>
                        <div>Guest</div>
                        <div className="text-right">Amount</div>
                        <div className="text-right">Method</div>
                    </div>
                    {bookedRooms.length > 0 ? (
                        bookedRooms.map(room => <DetailRow key={room.id} room={room} />)
                    ) : <p className="p-2 text-sm text-muted-foreground">No booked rooms.</p>}
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
