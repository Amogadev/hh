'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RoomStatusGrid } from './room-status-grid';
import type { Room } from '@/lib/data';

type RoomStatusProps = {
  selectedDate: Date;
  rooms: Room[];
};

export function RoomStatus({ selectedDate, rooms }: RoomStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Status</CardTitle>
        <CardDescription>
          View and manage room bookings for the selected date.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RoomStatusGrid selectedDate={selectedDate} rooms={rooms} />
      </CardContent>
    </Card>
  );
}
