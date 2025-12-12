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
import { Bed, User, Calendar, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format, startOfDay, isAfter, isEqual } from 'date-fns';
import { BookingForm, type BookingFormValues } from './booking-form';
import { ManageBookingForm } from './manage-booking-form';
import { Timestamp } from 'firebase/firestore';

const statusConfig = {
  Available: {
    badge: 'bg-green-900/50 text-green-300',
    icon: Bed,
    iconClass: 'text-green-400',
  },
  Occupied: {
    badge: 'bg-red-900/50 text-red-300',
    icon: Bed,
    iconClass: 'text-red-400',
  },
  Booked: {
    badge: 'bg-blue-900/50 text-blue-300',
    icon: KeyRound,
    iconClass: 'text-blue-400',
  },
} as const;

function getDateFromTimestampOrDate(date: Date | Timestamp): Date {
    return date instanceof Timestamp ? date.toDate() : date;
}

export function RoomStatusGrid({
  rooms,
  onUpdateRoom,
  selectedDate,
}: {
  selectedDate: Date;
  rooms: Room[];
  onUpdateRoom: (updatedRoom: Partial<Room> & { id: string }) => void;
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

    const updatedRoom: Partial<Room> & { id: string } = {
      id: originalRoom.id,
      booking: {
        guestName: values.guestName,
        checkIn: Timestamp.fromDate(values.checkIn),
        checkOut: Timestamp.fromDate(values.checkOut),
        checkedIn: false, // Explicitly set checkedIn to false on new booking
      },
      payment: newPayment
    };
    onUpdateRoom(updatedRoom);
  };

  const handleCheckIn = (room: Room) => {
    if (!room.booking) return;
    const updatedRoom: Partial<Room> & { id: string } = {
      id: room.id,
      booking: {
        ...room.booking,
        checkedIn: true,
      },
    };
    onUpdateRoom(updatedRoom);
  };
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.map((room) => {
          const isBooked = room.status === 'Booked';
          const canCheckIn = isBooked && room.booking && 
            (isAfter(startOfDay(selectedDate), startOfDay(getDateFromTimestampOrDate(room.booking.checkIn))) || isEqual(startOfDay(selectedDate), startOfDay(getDateFromTimestampOrDate(room.booking.checkIn))));

          return (
            <RoomCard
              key={room.id}
              room={room}
              onButtonClick={() => {
                if (room.status === 'Available') {
                  setRoomForBooking(room);
                } else if (isBooked && canCheckIn) {
                  handleCheckIn(room);
                } else if (room.status === 'Occupied' || room.status === 'Booked') { 
                  setRoomForManagement(room);
                }
              }}
              isBooked={isBooked}
              canCheckIn={canCheckIn}
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
  onButtonClick,
  isBooked,
  canCheckIn,
}: {
  room: Room;
  onButtonClick: () => void;
  isBooked: boolean;
  canCheckIn: boolean;
}) {
  const config = statusConfig[room.status];
  const Icon = config.icon;

  let buttonContent = 'Book Now';
  if (isBooked) {
    buttonContent = 'Manage';
  }
  if (canCheckIn) {
    buttonContent = 'Check In';
  }
  if (room.status === 'Occupied') {
    buttonContent = 'Manage';
  }


  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{room.name}</CardTitle>
          <Badge
            variant="outline"
            className={cn('border-transparent text-xs', config.badge)}
          >
            {room.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center text-center gap-2">
        <Icon
          className={cn('w-12 h-12 text-muted-foreground', config.iconClass)}
        />
        {room.status === 'Available' ? (
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
          disabled={room.status === 'Booked' && !canCheckIn}
          onClick={onButtonClick}
          variant={canCheckIn ? 'default' : 'secondary'}
        >
          {buttonContent}
        </Button>
      </CardFooter>
    </Card>
  );
}
