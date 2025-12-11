'use client';

import * as React from 'react';
import { RoomAndPaymentLists } from '@/components/dashboard/room-and-payment-lists';
import { DashboardCalendar } from '@/components/dashboard/dashboard-calendar';
import { RoomStatus } from '@/components/dashboard/room-status';
import { Room } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Timestamp } from 'firebase/firestore';
import { startOfDay } from 'date-fns';

const HOTEL_ID = 'hotel-123';
const baseRooms: Omit<Room, 'status'>[] = [
  { id: '101', name: 'Room 101' },
  { id: '102', name: 'Room 102' },
  { id: '103', name: 'Room 103' },
  { id: '104', name: 'Room 104' },
  { id: '105', name: 'Room 105' },
  { id: '106', name: 'Room 106' },
];

function getDateFromTimestampOrDate(date: Date | Timestamp): Date {
    return date instanceof Timestamp ? date.toDate() : date;
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    new Date('2025-12-11')
  );
  const firestore = useFirestore();

  const roomsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
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
    updateDocumentNonBlocking(roomRef, {
      booking: null,
      payment: null,
    });
  };
  
  const handleUpdateRoom = (updatedRoom: Partial<Room> & { id: string }) => {
    if (!firestore) return;
    const roomRef = doc(firestore, 'hotels', HOTEL_ID, 'rooms', updatedRoom.id);
    const { id, ...roomData } = updatedRoom;
    updateDocumentNonBlocking(roomRef, roomData);
  };
  
  const displayRooms = React.useMemo(() => {
    const firestoreRoomsMap = new Map(firestoreRooms?.map(room => [room.id, room]));
    const selectedDay = startOfDay(selectedDate);

    return baseRooms.map(baseRoom => {
      const firestoreRoomData = firestoreRoomsMap.get(baseRoom.id);
      const mergedRoom: Room = {
        ...baseRoom,
        status: 'Available', // Default status
        ...firestoreRoomData,
      };

      // Determine the status based on the selected date
      if (mergedRoom.booking) {
        const checkIn = startOfDay(getDateFromTimestampOrDate(mergedRoom.booking.checkIn));
        const checkOut = startOfDay(getDateFromTimestampOrDate(mergedRoom.booking.checkOut));
        
        if (selectedDay >= checkIn && selectedDay < checkOut) {
          mergedRoom.status = 'Occupied';
        } else if (checkIn > selectedDay) {
          mergedRoom.status = 'Booked';
        } else {
          mergedRoom.status = 'Available';
        }
      } else {
        mergedRoom.status = 'Available';
      }

      return mergedRoom;
    });
  }, [firestoreRooms, selectedDate]);


  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="text-3xl font-bold text-center tracking-tight">Where Every Stay is a Story.</h1>
      {roomsLoading && <p>Loading rooms...</p>}
      {!roomsLoading && (
        <>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            <div className="flex flex-col gap-6 lg:col-span-1">
              <DashboardCalendar
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
              <RoomAndPaymentLists rooms={displayRooms} onDeleteBooking={handleDeleteBooking} />
            </div>
            <div className="lg:col-span-3">
               <RoomStatus selectedDate={selectedDate} rooms={displayRooms} onUpdateRoom={handleUpdateRoom} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
