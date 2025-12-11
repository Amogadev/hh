'use client';

import * as React from 'react';
import { DailyRevenue } from '@/components/dashboard/daily-revenue';
import { RoomDetailCard } from '@/components/dashboard/room-detail-card';
import { DashboardCalendar } from '@/components/dashboard/dashboard-calendar';
import { RoomStatus } from '@/components/dashboard/room-status';

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    new Date('2025-12-11')
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      <RoomDetailCard />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RoomStatus selectedDate={selectedDate} />
        </div>
        <div className="flex flex-col gap-6">
          <DashboardCalendar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <DailyRevenue selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
}
