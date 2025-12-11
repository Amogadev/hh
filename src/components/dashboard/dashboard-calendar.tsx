'use client';

import * as React from 'react';
import { format, isWithinInterval, isValid } from 'date-fns';
import { Bed } from 'lucide-react';
import { DayProps, DayPicker } from 'react-day-picker';

import { Calendar } from '@/components/ui/calendar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getBookings, type Room } from '@/lib/data';
import { Card, CardContent } from '../ui/card';

type DashboardCalendarProps = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

function DayWithTooltip(props: DayProps) {
  const { date, displayMonth } = props;
  const bookings = getBookings();
  
  if (!date) {
    return <div />;
  }

  const dayBookings = bookings.filter(
    (booking) =>
      isWithinInterval(date, { start: booking.checkIn, end: booking.checkOut })
  );

  if (date.getMonth() !== displayMonth.getMonth()) {
    return <div className="text-muted-foreground">{format(date, 'd')}</div>;
  }

  if (dayBookings.length > 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative flex h-full w-full items-center justify-center">
              {format(date, 'd')}
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <ul>
              {dayBookings.map((booking, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  <span>
                    {booking.roomName} ({booking.status})
                  </span>
                </li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <div>{format(date, 'd')}</div>;
}


export function DashboardCalendar({
  selectedDate,
  setSelectedDate,
}: DashboardCalendarProps) {
  const bookings = React.useMemo(() => getBookings(), []);

  const bookedDays = React.useMemo(() => {
    const days: Date[] = [];
    bookings.forEach((booking) => {
      const dayIterator = new Date(booking.checkIn);
      while (dayIterator < booking.checkOut) {
        days.push(new Date(dayIterator));
        dayIterator.setDate(dayIterator.getDate() + 1);
      }
    });
    return days;
  }, [bookings]);

  return (
    <Card>
      <CardContent className="p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => d && isValid(d) && setSelectedDate(d)}
          initialFocus
          month={selectedDate}
          modifiers={{ booked: bookedDays }}
          modifiersClassNames={{
            booked: 'bg-primary/20 text-primary-foreground',
          }}
          components={{
            Day: DayWithTooltip,
          }}
        />
      </CardContent>
    </Card>
  );
}
