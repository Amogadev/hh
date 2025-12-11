'use client';
import * as React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Room, Payment } from '@/lib/data';
import { Bed, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format, isWithinInterval } from 'date-fns';
import { BookingForm } from './booking-form';

const statusConfig = {
  Available: {
    badge: 'bg-green-900/50 text-green-300',
    icon: Bed,
    iconClass: 'text-green-400',
  },
  Booked: {
    badge: 'bg-orange-900/50 text-orange-300',
    icon: User,
    iconClass: 'text-orange-400',
  },
  Occupied: {
    badge: 'bg-red-900/50 text-red-300',
    icon: Bed,
    iconClass: 'text-red-400',
  },
} as const;

function getRoomStatusForDate(room: Room, date: Date): Room['status'] {
  if (!room.booking) return 'Available';

  const { checkIn, checkOut } = room.booking;
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0,0,0,0);
  
  if (isWithinInterval(normalizedDate, { start: checkIn, end: checkOut })) {
    return room.status === 'Available' ? 'Booked' : room.status;
  }

  return 'Available';
}

type BookingData = {
    guestName: string;
    checkIn: Date;
    checkOut: Date;
    paymentMethod: "Credit Card" | "Cash" | "Bank Transfer" | "GPay" | "PhonePe";
    totalAmount: number;
    advancePayment: number;
};

export function RoomStatusGrid({
  selectedDate,
  rooms,
  onUpdateRoom,
}: {
  selectedDate: Date;
  rooms: Room[];
  onUpdateRoom: (roomId: string, newBookingData: Room) => void;
}) {
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);

  const handleBookingSuccess = (roomId: string, values: BookingData) => {
    const pendingAmount = values.totalAmount - values.advancePayment;
    const newPayment: Payment = {
        invoiceId: `INV-${Date.now()}`,
        guestName: values.guestName,
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: values.totalAmount,
        status: pendingAmount > 0 ? 'Pending' : 'Paid',
        method: values.paymentMethod,
    };

    const updatedRoom: Room = {
      ...rooms.find(r => r.id === roomId)!,
      status: 'Booked',
      booking: {
        guestName: values.guestName,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
      },
      payment: newPayment
    };
    onUpdateRoom(roomId, updatedRoom);
  };
  
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.map((room) => {
          const status = getRoomStatusForDate(room, selectedDate);
          return (
            <RoomCard
              key={room.id}
              room={room}
              effectiveStatus={status}
              onBookNow={() => setSelectedRoom(room)}
            />
          );
        })}
      </div>
      {selectedRoom && (
        <BookingForm
          room={selectedRoom}
          isOpen={!!selectedRoom}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedRoom(null);
            }
          }}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </>
  );
}

function RoomCard({
  room,
  effectiveStatus,
  onBookNow,
}: {
  room: Room;
  effectiveStatus: Room['status'];
  onBookNow: () => void;
}) {
  const config = statusConfig[effectiveStatus];
  const Icon = config.icon;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{room.name}</CardTitle>
          <Badge
            variant="outline"
            className={cn('border-transparent text-xs', config.badge)}
          >
            {effectiveStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center text-center gap-2">
        <Icon
          className={cn('w-12 h-12 text-muted-foreground', config.iconClass)}
        />
        {effectiveStatus === 'Available' ? (
          <p className="text-muted-foreground">Ready for booking</p>
        ) : (
          <div className="text-sm">
            {room.booking && (
              <>
                <p className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" /> {room.booking.guestName}
                </p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(room.booking.checkIn, 'MMM d')} -{' '}
                  {format(room.booking.checkOut, 'MMM d')}
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={effectiveStatus !== 'Available'}
          onClick={onBookNow}
        >
          {effectiveStatus === 'Available' ? 'Book Now' : 'Manage'}
        </Button>
      </CardFooter>
    </Card>
  );
}
