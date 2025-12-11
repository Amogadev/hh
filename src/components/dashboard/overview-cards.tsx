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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Room } from '@/lib/data';
import { List, Bed, DoorOpen, BedDouble, CalendarCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

function getDateFromTimestampOrDate(date: Date | Timestamp): Date {
  return date instanceof Timestamp ? date.toDate() : date;
}

const statusVariants: { [key in Room['status']]: string } = {
  Available: "bg-green-900/50 text-green-300",
  Booked: "bg-orange-900/50 text-orange-300",
  Occupied: "bg-red-900/50 text-red-300",
};


export function OverviewCards({ rooms }: { rooms: Room[] }) {
  const totalRooms = rooms;
  const availableRooms = rooms.filter((r) => r.status === 'Available');
  const occupiedRooms = rooms.filter((r) => r.status === 'Occupied');
  const bookedRooms = rooms.filter((r) => r.status === 'Booked');

  const sections = [
    { title: 'Total Rooms', icon: Bed, count: totalRooms.length, data: totalRooms, defaultOpen: false },
    { title: 'Rooms Available', icon: DoorOpen, count: availableRooms.length, data: availableRooms, defaultOpen: true },
    { title: 'Rooms Occupied', icon: BedDouble, count: occupiedRooms.length, data: occupiedRooms, defaultOpen: true },
    { title: 'Rooms Booked', icon: CalendarCheck, count: bookedRooms.length, data: bookedRooms, defaultOpen: true },
  ];

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Room Overview</DialogTitle>
          <DialogDescription>
            A detailed look at the current status of all rooms.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
           <Accordion type="multiple" defaultValue={sections.filter(s => s.defaultOpen).map(s => s.title)} className="w-full">
            {sections.map(section => (
               <AccordionItem value={section.title} key={section.title}>
                <AccordionTrigger>
                    <div className="flex items-center gap-3">
                        <section.icon className="h-5 w-5" />
                        <span className="font-semibold">{section.title}</span>
                        <Badge variant="secondary">{section.count}</Badge>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    {section.data.length > 0 ? (
                        <ul className="space-y-3 pl-4">
                            {section.data.map(room => (
                                <li key={room.id} className="text-sm border-l-2 pl-4 border-dashed border-border">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold">{room.name}</p>
                                        {room.status !== 'Available' && room.booking && (
                                            <Badge variant="outline" className={statusVariants[room.status]}>{room.status}</Badge>
                                        )}
                                    </div>
                                    {room.booking ? (
                                        <div className="mt-1 space-y-2 text-xs text-muted-foreground">
                                             <p><strong>Guest:</strong> {room.booking.guestName}</p>
                                             <p>
                                                <strong>Dates:</strong> {format(getDateFromTimestampOrDate(room.booking.checkIn), 'MMM d')} - {format(getDateFromTimestampOrDate(room.booking.checkOut), 'MMM d')}
                                             </p>
                                             {room.payment && (
                                                <div>
                                                    <p><strong>Payment:</strong> ₹{room.payment.amount.toFixed(2)} ({room.payment.method})</p>
                                                    <p className={room.payment.pending > 0 ? 'text-orange-400' : 'text-green-400'}>
                                                        {room.payment.pending > 0 ? `Pending: ₹${room.payment.pending.toFixed(2)}` : 'Fully Paid'}
                                                    </p>
                                                </div>
                                             )}
                                        </div>
                                    ) : (
                                         section.title !== 'Total Rooms' && <Badge variant="outline" className={statusVariants.Available}>Available</Badge>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ): (
                        <p className="text-sm text-muted-foreground text-center">No rooms in this category.</p>
                    )}
                </AccordionContent>
               </AccordionItem>
            ))}
           </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
