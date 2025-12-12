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
import { format, startOfDay } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

type RoomAndPaymentListsProps = {
  rooms: Room[];
  allRooms: Room[];
  onDeleteBooking: (roomId: string) => void;
};

const statusVariants: { [key in Room['status']]: string } = {
  Available: "bg-green-900/50 text-green-300",
  Occupied: "bg-red-900/50 text-red-300",
  Booked: "bg-blue-900/50 text-blue-300",
};

function getDateFromTimestampOrDate(date: Date | Timestamp): Date {
    return date instanceof Timestamp ? date.toDate() : date;
}

export function RoomAndPaymentLists({ rooms, allRooms, onDeleteBooking }: RoomAndPaymentListsProps) {
  const occupiedRooms = rooms.filter((room) => room.status === 'Occupied' && room.booking);
  const availableRooms = rooms.filter((room) => room.status === 'Available' && !room.booking);
  
  // Filter payments for rooms that are currently occupied or booked on the selected date
  const paymentHistory = rooms
    .filter(r => r.payment && (r.status === 'Occupied' || r.status === 'Booked'))
    .sort((a, b) => {
        if (!a.payment || !b.payment) return 0;
        return new Date(b.payment.date).getTime() - new Date(a.payment.date).getTime();
    });

  const futureBookings = allRooms.filter(room => {
    if (!room.booking) return false;
    const checkInDate = startOfDay(getDateFromTimestampOrDate(room.booking.checkIn));
    const today = startOfDay(new Date());
    return checkInDate >= today;
  });


  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Overview</CardTitle>
        <CardDescription>Room status and payments for the selected date.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['payments', 'occupied', 'booked', 'available']} className="w-full">
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
                                <span className="font-medium">{room.payment.guestName}</span>
                                <span className="text-xs text-muted-foreground">
                                    {room.name} ({room.status}) - {format(new Date(room.payment.date), 'MMM d, yyyy')}
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
                            {room.status !== 'Occupied' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => onDeleteBooking(room.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete Booking</span>
                                </Button>
                            )}
                            </div>
                        </li>
                        ) : null
                    )}
                 </ul>
              ) : <p className="text-sm text-muted-foreground">No payment history for this date.</p>}
            </AccordionContent>
          </AccordionItem>
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
            <AccordionTrigger className='font-semibold'>Future Bookings ({futureBookings.length})</AccordionTrigger>
            <AccordionContent>
              {futureBookings.length > 0 ? (
                <ul className="space-y-2">
                  {futureBookings.map(room => (
                     <li key={room.id} className="flex justify-between items-center text-sm">
                       <span>{room.name}</span>
                       <div className="text-xs text-muted-foreground text-right">
                         <p>{room.booking?.guestName}</p>
                         <p>
                           {room.booking && `In: ${format(getDateFromTimestampOrDate(room.booking.checkIn), 'MMM d')}`}
                         </p>
                       </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No upcoming bookings.</p>}
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
        </Accordion>
      </CardContent>
    </Card>
  );
}
