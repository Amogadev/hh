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
import { format, isWithinInterval, isEqual, startOfDay } from 'date-fns';
import { BookingForm } from './booking-form';
import { ManageBookingForm } from './manage-booking-form';

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
  const checkInDate = startOfDay(new Date(checkIn));
  const checkOutDate = startOfDay(new Date(checkOut));
  const selectedDate = startOfDay(date);

  // A room is "Occupied" if the selected date is between check-in (inclusive) and check-out (exclusive).
  if (selectedDate >= checkInDate && selectedDate < checkOutDate) {
    return 'Occupied';
  }

  // If it's not occupied on the selected date, but has a booking, it is considered "Booked".
  // This covers past and future bookings relative to the selected date.
  return 'Booked';
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
  onUpdateRoom: (updatedRoom: Room) => void;
}) {
  const [roomForBooking, setRoomForBooking] = React.useState<Room | null>(null);
  const [roomForManagement, setRoomForManagement] = React.useState<Room | null>(null);


  const handleBookingSuccess = (roomId: string, values: BookingData) => {
    const pendingAmount = values.totalAmount - values.advancePayment;
    const newPayment: Payment = {
        invoiceId: `INV-${Date.now()}`,
        guestName: values.guestName,
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: values.totalAmount,
        advancePaid: values.advancePayment,
        pending: pendingAmount,
        status: pendingAmount > 0 ? 'Pending' : 'Paid',
        method: values.paymentMethod,
    };

    const originalRoom = rooms.find(r => r.id === roomId);
    if (!originalRoom) return;

    const updatedRoom: Room = {
      ...originalRoom,
      status: 'Booked', // Set initial status, getRoomStatusForDate will determine effective status
      booking: {
        guestName: values.guestName,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
      },
      payment: newPayment
    };
    onUpdateRoom(updatedRoom);
  };
  
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.map((room) => {
          const effectiveStatus = getRoomStatusForDate(room, selectedDate);
          return (
            <RoomCard
              key={room.id}
              room={room}
              effectiveStatus={effectiveStatus}
              onButtonClick={() => {
                if (effectiveStatus === 'Available') {
                  setRoomForBooking(room);
                } else {
                  setRoomForManagement(room);
                }
              }}
            />
          );
        })}
      </div>
      {roomForBooking && (
        <BookingForm
          room={roomForBooking}
          isOpen={!!roomForBooking}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setRoomForBooking(null);
            }
          }}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
      {roomForManagement && (
         <ManageBookingForm
          room={roomForManagement}
          isOpen={!!roomForManagement}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setRoomForManagement(null);
            }
          }}
          onUpdateRoom={onUpdateRoom}
        />
      )}
    </>
  );
}

function RoomCard({
  room,
  effectiveStatus,
  onButtonClick,
}: {
  room: Room;
  effectiveStatus: Room['status'];
  onButtonClick: () => void;
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
                  {format(new Date(room.booking.checkIn), 'MMM d')} -{' '}
                  {format(new Date(room.booking.checkOut), 'MMM d')}
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={effectiveStatus !== 'Available' && !room.booking}
          onClick={onButtonClick}
        >
          {effectiveStatus === 'Available' ? 'Book Now' : 'Manage'}
        </Button>
      </CardFooter>
    </Card>
  );
}
