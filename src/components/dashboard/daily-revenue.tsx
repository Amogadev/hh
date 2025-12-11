'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Wallet } from 'lucide-react';
import { roomsData } from '@/lib/data';
import { isWithinInterval } from 'date-fns';

type DailyRevenueProps = {
  selectedDate: Date;
};

export function DailyRevenue({ selectedDate }: DailyRevenueProps) {
  const dailyBookedRooms = roomsData.filter(
    (room) =>
      room.booking &&
      isWithinInterval(selectedDate, {
        start: room.booking.checkIn,
        end: room.booking.checkOut,
      })
  );

  const dailyRevenue = dailyBookedRooms.reduce((acc, room) => {
    // This is a simplification. In a real app, you'd divide total by number of days.
    return acc + (room.payment?.amount || 0) / ((room.booking?.checkOut.getTime() ?? 1) - (room.booking?.checkIn.getTime() ?? 1)) * (1000 * 3600 * 24);
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
            <p className="text-2xl font-bold">${dailyRevenue.toFixed(2)}</p>
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
                    <span>{room.payment.guestName}</span>
                    <span className="font-medium">
                      ${room.payment.amount.toFixed(2)} ({room.payment.method})
                    </span>
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
