'use client';

import * as React from 'react';
import { DailyRevenue } from '@/components/dashboard/daily-revenue';
import { RoomDetailCard } from '@/components/dashboard/room-detail-card';
import { DashboardCalendar } from '@/components/dashboard/dashboard-calendar';
import { RoomStatus } from '@/components/dashboard/room-status';
import { Room, roomsData } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, getDocs, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { serverTimestamp } from 'firebase/firestore';

const HOTEL_ID = 'hotel-123';

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    new Date('2025-12-11')
  );
  const firestore = useFirestore();

  const roomsCollectionRef = useMemoFirebase(() => {
    return collection(firestore, 'hotels', HOTEL_ID, 'rooms');
  }, [firestore]);

  const { data: rooms, isLoading: roomsLoading } = useCollection<Room>(roomsCollectionRef);

  const seedData = async () => {
    if (!firestore) return;
    try {
      const batch = writeBatch(firestore);
      const roomsSnapshot = await getDocs(roomsCollectionRef);
      if (!roomsSnapshot.empty) {
        console.log('Data already seeded.');
        return;
      }

      roomsData.forEach((room) => {
        const roomRef = doc(firestore, 'hotels', HOTEL_ID, 'rooms', room.id);
        batch.set(roomRef, room);
      });

      await batch.commit();
      console.log('Successfully seeded initial room data.');
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };


  const handleDeleteBooking = (roomId: string) => {
    if (!firestore) return;
    const roomRef = doc(firestore, 'hotels', HOTEL_ID, 'rooms', roomId);
    // This is a "soft" delete, just clearing booking info
    updateDocumentNonBlocking(roomRef, {
      status: 'Available',
      booking: null,
      payment: null,
    });
  };
  
  const handleUpdateRoom = (updatedRoom: Room) => {
    if (!firestore) return;
    const roomRef = doc(firestore, 'hotels', HOTEL_ID, 'rooms', updatedRoom.id);
    const { id, ...roomData } = updatedRoom; // Exclude id from the data to be set
    updateDocumentNonBlocking(roomRef, roomData);
  };
  
  const displayRooms = rooms || [];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Button onClick={seedData} className="w-fit">Seed Room Data</Button>
      {roomsLoading && <p>Loading rooms...</p>}
      {!roomsLoading && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-6">
              <DashboardCalendar
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
              <RoomDetailCard rooms={displayRooms} />
            </div>
            <div className="lg:col-span-2">
              <DailyRevenue
                selectedDate={selectedDate}
                rooms={displayRooms}
                onDeleteBooking={handleDeleteBooking}
              />
            </div>
          </div>
          <RoomStatus selectedDate={selectedDate} rooms={displayRooms} onUpdateRoom={handleUpdateRoom} />
        </>
      )}
    </div>
  );
}
