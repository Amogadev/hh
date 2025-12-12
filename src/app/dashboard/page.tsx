'use client';

import * as React from 'react';
import { RoomAndPaymentLists } from '@/components/dashboard/room-and-payment-lists';
import { DashboardCalendar } from '@/components/dashboard/dashboard-calendar';
import { RoomStatus } from '@/components/dashboard/room-status';
import { Room } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
  collection,
  doc,
  writeBatch,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { startOfDay, isWithinInterval } from 'date-fns';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const HOTEL_ID = 'hotel-123';
const baseRooms: Omit<Room, 'status' | 'effectiveStatus'>[] = [
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

function getRoomStatusForDate(
  room: Room,
  date: Date
): 'Available' | 'Occupied' | 'Booked' {
  if (room.booking) {
    const checkIn = startOfDay(getDateFromTimestampOrDate(room.booking.checkIn));
    const checkOut = startOfDay(
      getDateFromTimestampOrDate(room.booking.checkOut)
    );
    const selectedDay = startOfDay(date);
    const today = startOfDay(new Date());

    const isOccupiedNow = selectedDay >= checkIn && selectedDay < checkOut;
    const isBookedForFuture = selectedDay < checkIn;

    if (isOccupiedNow) {
      return 'Occupied';
    }
    
    // The original data has future bookings relative to a hardcoded "today"
    // To decide if a room is "Booked", we check if the selected date is *before* the check-in
    // but the booking itself is for the future relative to the *actual* today.
    if (checkIn > today && selectedDay < checkIn) {
        return 'Booked';
    }
  }
  return 'Available';
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

  const { data: firestoreRooms, isLoading: roomsLoading } =
    useCollection<Room>(roomsCollectionRef);

  const seedData = async () => {
    if (!firestore) return;
    try {
      const batch = writeBatch(firestore);
      const roomsSnapshot = await getDocs(roomsCollectionRef);
      if (
        !roomsSnapshot.empty &&
        roomsSnapshot.docs.length >= baseRooms.length
      ) {
        console.log('Data already appears to be seeded.');
        return;
      }

      baseRooms.forEach((room) => {
        const roomRef = doc(firestore, 'hotels', HOTEL_ID, 'rooms', room.id);
        batch.set(roomRef, {
          name: room.name,
          id: room.id,
          status: 'Available',
        });
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
    const firestoreRoomsMap = new Map(
      firestoreRooms?.map((room) => [room.id, room])
    );

    return baseRooms.map((baseRoom) => {
      const firestoreRoomData = firestoreRoomsMap.get(baseRoom.id);
      const mergedRoom: Room = {
        ...baseRoom,
        status: 'Available', // Default status
        ...firestoreRoomData,
      };

      // Determine the status based on the selected date
      mergedRoom.status = getRoomStatusForDate(mergedRoom, selectedDate);

      return mergedRoom;
    });
  }, [firestoreRooms, selectedDate]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="text-2xl font-bold text-center tracking-tight">WELCOME</h1>
      {roomsLoading && <p>Loading rooms...</p>}
      {!roomsLoading && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <RoomStatus
                    selectedDate={selectedDate}
                    rooms={displayRooms}
                    onUpdateRoom={handleUpdateRoom}
                />
            </div>
            <div className="space-y-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:bg-card/80 flex flex-col flex-grow">
                      <CardHeader>
                        <CardTitle>Room Details</CardTitle>
                        <CardDescription>Click to see an overview of room statistics.</CardDescription>
                      </CardHeader>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Room Overview</DialogTitle>
                      <DialogDescription>
                        Click a category to view the detailed list of rooms.
                      </DialogDescription>
                    </DialogHeader>
                    <OverviewCards rooms={displayRooms} />
                  </DialogContent>
                </Dialog>
                <DashboardCalendar
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                />
                <RoomAndPaymentLists
                    rooms={displayRooms}
                    onDeleteBooking={handleDeleteBooking}
                />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
