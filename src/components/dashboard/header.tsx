

"use client";

import * as React from "react";
import Link from "next/link";
import { format, isValid, isSameDay } from "date-fns";
import {
  BookText,
  Calendar as CalendarIcon,
  CircleUser,
  Bed,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "@/components/icons";
import { cn } from "@/lib/utils";
import { getBookings } from "@/lib/data";
import { DayProps, useDayPicker } from "react-day-picker";

function DayWithTooltip({ date, displayMonth }: DayProps) {
  const { classNames, styles } = useDayPicker();
  const bookings = getBookings();

  const dayBookings = bookings.filter(
    (booking) => date >= booking.checkIn && date < booking.checkOut
  );

  if (dayBookings.length > 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative flex h-full w-full items-center justify-center">
              {format(date, "d")}
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

  return <>{format(date, "d")}</>;
}

export function Header() {
  const [date, setDate] = React.useState<Date>(new Date("2025-12-11"));
  const bookings = React.useMemo(() => getBookings(), []);

  const bookedDays = React.useMemo(() => {
    const days: Date[] = [];
    bookings.forEach(booking => {
      const dayIterator = new Date(booking.checkIn);
      while(dayIterator < booking.checkOut) {
        days.push(new Date(dayIterator));
        dayIterator.setDate(dayIterator.getDate() + 1);
      }
    });
    return days;
  }, [bookings]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <Link href="#" className="flex items-center gap-2 font-semibold">
        <Logo className="h-6 w-6" />
        <span className="text-xl">HotelZenith</span>
      </Link>
      <div className="flex flex-1 items-center gap-4">
        <p className="text-sm text-muted-foreground hidden md:block">
          Where Every Stay is a Story.
        </p>
        <BookText className="w-5 h-5 text-muted-foreground hidden md:block" />
      </div>

      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
              month={date}
              modifiers={{ booked: bookedDays }}
              modifiersClassNames={{
                booked: "bg-primary/20 text-primary-foreground",
              }}
              components={{
                Day: DayWithTooltip,
              }}
            />
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full"
            >
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
