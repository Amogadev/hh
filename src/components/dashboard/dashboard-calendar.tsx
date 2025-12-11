'use client';

import * as React from 'react';
import { format, isValid } from 'date-fns';
import { Bed } from 'lucide-react';
import { DayProps } from 'react-day-picker';

import { Calendar } from '@/components/ui/calendar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getBookings } from '@/lib/data';
import { Card, CardContent } from '../ui/card';

type DashboardCalendarProps = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

function DayWithTooltip({
  date,
  displayMonth,
}: DayProps & { date: Date; displayMonth: Date }) {
  const bookings = getBookings();
  const dayBookings = bookings.filter(
    (booking) =>
      isValid(date) &&
      date >= booking.checkIn &&
      date < booking.checkOut
  );

  if (!displayMonth || !date) return <></>;

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

  return <>{format(date, 'd')}</>;
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
            Day: (props) => (
              <DayWithTooltip
                {...props}
                date={props.date}
                displayMonth={props.displayMonth}
              />
            ),
          }}
        />
      </CardContent>
    </Card>
  );
}
