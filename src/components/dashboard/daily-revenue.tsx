'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Trash2, Wallet } from 'lucide-react';
import type { Room } from '@/lib/data';
import { isWithinInterval } from 'date-fns';

type DailyRevenueProps = {
  selectedDate: Date;
  rooms: Room[];
  onDeleteBooking: (roomId: string) => void;
};

export function DailyRevenue({
  selectedDate,
  rooms,
  onDeleteBooking,
}: DailyRevenueProps) {
  const dailyBookedRooms = rooms.filter(
    (room) =>
      room.booking &&
      isWithinInterval(selectedDate, {
        start: room.booking.checkIn,
        end: room.booking.checkOut,
      })
  );

  const dailyRevenue = dailyBookedRooms.reduce((acc, room) => {
    if (!room.booking || !room.payment) return acc;
    // Calculate nightly rate
    const bookingDays =
      (room.booking.checkOut.getTime() - room.booking.checkIn.getTime()) /
      (1000 * 3600 * 24);
    const nightlyRate = bookingDays > 0 ? room.payment.amount / bookingDays : 0;
    return acc + nightlyRate;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Revenue</CardTitle>
        <CardDescription>
          Revenue and payment breakdown for the selected date.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <DollarSign className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-1">Total Income</p>
            <p className="text-2xl font-bold">₹{dailyRevenue.toFixed(2)}</p>
          </Card>
          <Card className="p-4 text-center">
            <Wallet className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-1">Rooms Booked</p>
            <p className="text-2xl font-bold">{dailyBookedRooms.length}</p>
          </Card>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Payment Breakdown</h3>
          {dailyBookedRooms.length > 0 ? (
            <ul className="space-y-2">
              {dailyBookedRooms.map((room) =>
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
                      <span className="font-medium">
                        ₹{room.payment.amount.toFixed(2)} ({room.payment.method})
                      </span>
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
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No payment data for this date.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
