'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Trash2 } from 'lucide-react';
import type { Room } from '@/lib/data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

type RoomAndPaymentListsProps = {
  rooms: Room[];
  onDeleteBooking: (roomId: string) => void;
};

const statusVariants: { [key in Room['status']]: string } = {
  Available: "bg-green-900/50 text-green-300",
  Booked: "bg-orange-900/50 text-orange-300",
  Occupied: "bg-red-900/50 text-red-300",
};

function getDateFromTimestampOrDate(date: Date | Timestamp): Date {
    return date instanceof Timestamp ? date.toDate() : date;
}

export function RoomAndPaymentLists({ rooms, onDeleteBooking }: RoomAndPaymentListsProps) {
  const occupiedRooms = rooms.filter((room) => room.status === 'Occupied');
  const bookedRooms = rooms.filter((room) => room.status === 'Booked');
  const availableRooms = rooms.filter((room) => room.status === 'Available');
  const paymentHistory = occupiedRooms.concat(bookedRooms).filter(r => r.payment);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Overview</CardTitle>
        <CardDescription>Room status and payments for the selected date.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['occupied', 'booked', 'available', 'payments']} className="w-full">
          {/* Occupied Rooms */}
          <AccordionItem value="occupied">
            <AccordionTrigger className='font-semibold'>Occupied ({occupiedRooms.length})</AccordionTrigger>
            <AccordionContent>
              {occupiedRooms.length > 0 ? (
                <ul className="space-y-2">
                  {occupiedRooms.map(room => (
                    <li key={room.id} className="flex justify-between items-center text-sm">
                      <span>{room.name}</span>
                      <span className='text-xs text-muted-foreground'>{room.booking?.guestName}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No occupied rooms.</p>}
            </AccordionContent>
          </AccordionItem>
          {/* Booked Rooms */}
          <AccordionItem value="booked">
            <AccordionTrigger className='font-semibold'>Booked ({bookedRooms.length})</AccordionTrigger>
            <AccordionContent>
              {bookedRooms.length > 0 ? (
                <ul className="space-y-2">
                  {bookedRooms.map(room => (
                    <li key={room.id} className="flex justify-between items-center text-sm">
                       <div>
                        <span>{room.name}</span>
                        <p className='text-xs text-muted-foreground'>{room.booking?.guestName}</p>
                       </div>
                       <p className='text-xs text-muted-foreground'>
                         {room.booking && `In: ${format(getDateFromTimestampOrDate(room.booking.checkIn), 'MMM d')}`}
                       </p>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No rooms booked for the future.</p>}
            </AccordionContent>
          </AccordionItem>
          {/* Available Rooms */}
          <AccordionItem value="available">
            <AccordionTrigger className='font-semibold'>Available ({availableRooms.length})</AccordionTrigger>
            <AccordionContent>
              {availableRooms.length > 0 ? (
                <ul className="space-y-2">
                  {availableRooms.map(room => (
                    <li key={room.id} className="flex justify-between items-center text-sm">
                      <span>{room.name}</span>
                      <Badge variant="outline" className={cn("border-transparent", statusVariants.Available)}>Available</Badge>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No available rooms.</p>}
            </AccordionContent>
          </AccordionItem>
          {/* Payment History */}
          <AccordionItem value="payments">
            <AccordionTrigger className='font-semibold'>Payment History ({paymentHistory.length})</AccordionTrigger>
            <AccordionContent>
              {paymentHistory.length > 0 ? (
                 <ul className="space-y-2">
                    {paymentHistory.map((room) =>
                        room.payment ? (
                        <li
                            key={room.id}
                            className="flex justify-between items-center text-sm"
                        >
                            <div className="flex flex-col">
                            <span>{room.payment.guestName}</span>
                            <span className="text-xs text-muted-foreground">
                                {room.name}
                            </span>
                            </div>
                            <div className="flex items-center gap-2">
                            <div className="text-right">
                                <span className="font-medium">
                                ₹{room.payment.amount.toFixed(2)}
                                </span>
                                <p className={`text-xs ${room.payment.pending > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                                {room.payment.pending > 0 ? `(Pending: ₹${room.payment.pending.toFixed(2)})` : '(Paid)'}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => onDeleteBooking(room.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete Booking</span>
                            </Button>
                            </div>
                        </li>
                        ) : null
                    )}
                 </ul>
              ) : <p className="text-sm text-muted-foreground">No payment history for this date.</p>}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
