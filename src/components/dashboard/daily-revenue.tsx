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
  // Rooms are already filtered with the correct status from the parent
  const dailyBookedRooms = rooms.filter(
    (room) => room.status === 'Occupied'
  );

  const dailyRevenue = dailyBookedRooms.reduce((acc, room) => {
    if (!room.payment) return acc;
    // This is the total collected amount for this booking
    return acc + room.payment.advancePaid;
  }, 0);
  
  const totalBookedAmount = dailyBookedRooms.reduce((acc, room) => {
     if (!room.payment) return acc;
     // This is the total value of the booking
     return acc + room.payment.amount;
  }, 0);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Revenue and payment breakdown for the selected date.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <DollarSign className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-1">Total Collected</p>
            <p className="text-2xl font-bold">₹{dailyRevenue.toFixed(2)}</p>
          </Card>
          <Card className="p-4 text-center">
            <Wallet className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-1">Total Booked Value</p>
            <p className="text-2xl font-bold">₹{totalBookedAmount.toFixed(2)}</p>
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
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground py-8">
              <p>No payment data for this date.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
