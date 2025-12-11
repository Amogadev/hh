'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

type DashboardCalendarProps = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

export function DashboardCalendar({
  selectedDate,
  setSelectedDate,
}: DashboardCalendarProps) {
  
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;
    // The input type="date" returns a string in 'YYYY-MM-DD' format.
    // The Date constructor can parse this, but it will be in UTC.
    // To avoid timezone issues, we can append 'T00:00:00' to treat it as local time.
    const newDate = new Date(`${dateValue}T00:00:00`);
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
    }
  };

  return (
    <Card>
       <CardHeader>
        <CardTitle>Select Date</CardTitle>
        <CardDescription>
          Pick a date to view room status and revenue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
            <Label htmlFor="date-picker">Date</Label>
            <Input
                id="date-picker"
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
            />
        </div>
      </CardContent>
    </Card>
  );
}
