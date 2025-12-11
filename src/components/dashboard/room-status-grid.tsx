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
import { BookingForm, type BookingFormValues } from './booking-form';
import { ManageBookingForm } from './manage-booking-form';
import { Timestamp } from 'firebase/firestore';

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

function getDateFromTimestampOrDate(date: Date | Timestamp): Date {
    return date instanceof Timestamp ? date.toDate() : date;
}

function getRoomStatusForDate(room: Room, date: Date): Room['status'] {
  if (!room.booking) return 'Available';

  const checkInDate = startOfDay(getDateFromTimestampOrDate(room.booking.checkIn));
  const checkOutDate = startOfDay(getDateFromTimestampOrDate(room.booking.checkOut));
  const selectedDate = startOfDay(date);

  // A room is "Occupied" if the selected date is between check-in (inclusive) and check-out (exclusive).
  if (selectedDate >= checkInDate && selectedDate < checkOutDate) {
    return 'Occupied';
  }

  // If the booking's check-in date is in the future relative to the selected date, it's "Booked".
  if (checkInDate > selectedDate) {
    return 'Booked';
  }
  
  // If the booking is in the past, it should be considered Available for the selected date.
  return 'Available';
}

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

  const handleBookingSuccess = (roomId: string, values: BookingFormValues) => {
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
      status: 'Booked', // This status is just a default, effective status is calculated
      booking: {
        guestName: values.guestName,
        checkIn: Timestamp.fromDate(values.checkIn),
        checkOut: Timestamp.fromDate(values.checkOut),
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
          const canBook = effectiveStatus === 'Available';

          return (
            <RoomCard
              key={room.id}
              room={room}
              effectiveStatus={effectiveStatus}
              onButtonClick={() => {
                if (canBook) {
                  setRoomForBooking(room);
                } else if (room.booking) { // Only allow management if there is a booking
                  setRoomForManagement(room);
                }
              }}
              canBook={canBook}
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
  canBook,
}: {
  room: Room;
  effectiveStatus: Room['status'];
  onButtonClick: () => void;
  canBook: boolean;
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
                  {format(getDateFromTimestampOrDate(room.booking.checkIn), 'MMM d')} -{' '}
                  {format(getDateFromTimestampOrDate(room.booking.checkOut), 'MMM d')}
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!canBook && !room.booking}
          onClick={onButtonClick}
        >
          {canBook ? 'Book Now' : 'Manage'}
        </Button>
      </CardFooter>
    </Card>
  );
}
