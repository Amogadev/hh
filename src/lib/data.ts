import { addDays, format } from "date-fns";

export type Room = {
  id: string;
  name: string;
  status: 'Available' | 'Booked' | 'Occupied';
  booking?: {
    checkIn: Date;
    checkOut: Date;
    guestName: string;
  };
  payment?: Payment;
};

export type Payment = {
  invoiceId: string;
  guestName: string;
  date: string;
  amount: number;
  advancePaid: number;
  pending: number;
  status: 'Paid' | 'Pending' | 'Failed';
  method: 'Credit Card' | 'Cash' | 'Bank Transfer' | 'GPay' | 'PhonePe';
};

const today = new Date("2025-12-11");

export const paymentsData: Payment[] = [
  { invoiceId: 'INV001', guestName: 'John Doe', date: '2024-07-20', amount: 350.00, advancePaid: 100, pending: 250, status: 'Pending', method: 'Credit Card' },
  { invoiceId: 'INV002', guestName: 'Jane Smith', date: '2024-07-19', amount: 720.50, advancePaid: 720.50, pending: 0, status: 'Paid', method: 'Credit Card' },
  { invoiceId: 'INV003', guestName: 'Mike Johnson', date: '2024-07-19', amount: 150.00, advancePaid: 0, pending: 150, status: 'Pending', method: 'Cash' },
  { invoiceId: 'INV004', guestName: 'Emily Davis', date: '2024-07-18', amount: 480.75, advancePaid: 480.75, pending: 0, status: 'Paid', method: 'Bank Transfer' },
  { invoiceId: 'INV005', guestName: 'Robert Brown', date: '2024-07-17', amount: 200.00, advancePaid: 50, pending: 150, status: 'Failed', method: 'Credit Card' },
  { invoiceId: 'INV006', guestName: 'Linda Wilson', date: '2024-07-16', amount: 950.00, advancePaid: 950.00, pending: 0, status: 'Paid', method: 'Cash' },
];

export const roomsData: Room[] = [
  { id: '101', name: 'Room 101', status: 'Available' },
  { id: '102', name: 'Room 102', status: 'Available' },
  { id: '103', name: 'Room 103', status: 'Available' },
  { id: '104', name: 'Room 104', status: 'Available' },
  { id: '105', name: 'Room 105', status: 'Available' },
  { id: '106', name: 'Room 106', status: 'Available' },
  { id: '107', name: 'Room 107', status: 'Available' },
];

export const getDashboardStats = () => {
  const totalRooms = roomsData.length;
  const bookedRooms = roomsData.filter(r => r.status === 'Booked').length;
  const occupiedRooms = roomsData.filter(r => r.status === 'Occupied').length;
  return { totalRooms, bookedRooms, occupiedRooms };
};

export const getBookings = () => {
  return roomsData
    .filter((room): room is Room & { booking: NonNullable<Room['booking']> } => !!room.booking)
    .map(room => ({
      ...room.booking,
      roomName: room.name,
      status: room.status,
    }));
}
