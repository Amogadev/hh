'use client';

import * as React from 'react';
import { DailyRevenue } from '@/components/dashboard/daily-revenue';
import { RoomDetailCard } from '@/components/dashboard/room-detail-card';
import { DashboardCalendar } from '@/components/dashboard/dashboard-calendar';
import { RoomStatus } from '@/components/dashboard/room-status';
import { roomsData, type Room } from '@/lib/data';

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    new Date('2025-12-11')
  );
  const [rooms, setRooms] = React.useState<Room[]>(roomsData);

  const handleDeleteBooking = (roomId: string) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id === roomId) {
          // Create a new object to ensure state update triggers re-render
          const updatedRoom: Room = { ...room, status: 'Available' };
          delete updatedRoom.booking;
          delete updatedRoom.payment;
          return updatedRoom;
        }
        return room;
      })
    );
  };
  
  const handleUpdateRoom = (roomId: string, newBookingData: Room) => {
    setRooms(prevRooms => prevRooms.map(r => r.id === roomId ? newBookingData : r));
  };


  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-6">
          <DashboardCalendar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <RoomDetailCard rooms={rooms} />
        </div>
        <div className="lg:col-span-2">
          <DailyRevenue
            selectedDate={selectedDate}
            rooms={rooms}
            onDeleteBooking={handleDeleteBooking}
          />
        </div>
      </div>
      <RoomStatus selectedDate={selectedDate} rooms={rooms} onUpdateRoom={handleUpdateRoom} />
    </div>
  );
}
