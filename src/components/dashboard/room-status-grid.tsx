'use client';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Room } from '@/lib/data';
import { Bed, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format, isWithinInterval } from 'date-fns';

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
  if (isWithinInterval(date, { start: checkIn, end: checkOut })) {
    // If a room has a booking covering the selected date, its status is determined by the data.
    // If there's a booking but the status is 'Available', it's likely a data inconsistency.
    // For this view, we'll prioritize the booking's existence.
    return room.status === 'Available' ? 'Booked' : room.status;
  }

  return 'Available';
}

export function RoomStatusGrid({
  selectedDate,
  rooms,
}: {
  selectedDate: Date;
  rooms: Room[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rooms.map((room) => {
        const status = getRoomStatusForDate(room, selectedDate);
        return <RoomCard key={room.id} room={room} effectiveStatus={status} />;
      })}
    </div>
  );
}

function RoomCard({
  room,
  effectiveStatus,
}: {
  room: Room;
  effectiveStatus: Room['status'];
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
        <Button className="w-full" disabled={effectiveStatus !== 'Available'}>
          {effectiveStatus === 'Available' ? 'Book Now' : 'Manage'}
        </Button>
      </CardFooter>
    </Card>
  );
}
