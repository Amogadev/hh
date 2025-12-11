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
const baseRooms: Room[] = [
  { id: '101', name: 'Room 101', status: 'Available' },
  { id: '102', name: 'Room 102', status: 'Available' },
  { id: '103', name: 'Room 103', status: 'Available' },
  { id: '104', name: 'Room 104', status: 'Available' },
  { id: '105', name: 'Room 105', status: 'Available' },
  { id: '106', name: 'Room 106', status: 'Available' },
];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    new Date('2025-12-11')
  );
  const firestore = useFirestore();

  const roomsCollectionRef = useMemoFirebase(() => {
    return collection(firestore, 'hotels', HOTEL_ID, 'rooms');
  }, [firestore]);

  const { data: firestoreRooms, isLoading: roomsLoading } = useCollection<Room>(roomsCollectionRef);

  const seedData = async () => {
    if (!firestore) return;
    try {
      const batch = writeBatch(firestore);
      const roomsSnapshot = await getDocs(roomsCollectionRef);
      if (!roomsSnapshot.empty && roomsSnapshot.docs.length >= baseRooms.length) {
        console.log('Data already appears to be seeded.');
        return;
      }

      baseRooms.forEach((room) => {
        const roomRef = doc(firestore, 'hotels', HOTEL_ID, 'rooms', room.id);
        batch.set(roomRef, { name: room.name, id: room.id, status: 'Available' });
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
  
  const displayRooms = React.useMemo(() => {
    if (!firestoreRooms) {
      return baseRooms;
    }
    const firestoreRoomsMap = new Map(firestoreRooms.map(room => [room.id, room]));
    return baseRooms.map(baseRoom => {
      return firestoreRoomsMap.get(baseRoom.id) || baseRoom;
    });
  }, [firestoreRooms]);


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
