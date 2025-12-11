export type Room = {
  id: string;
  name: string;
  status: 'Available' | 'Booked' | 'Occupied';
};

export const roomsData: Room[] = [
  { id: '101', name: 'Room 101', status: 'Available' },
  { id: '102', name: 'Room 102', status: 'Occupied' },
  { id: '103', name: 'Room 103', status: 'Booked' },
  { id: '104', name: 'Room 104', status: 'Available' },
  { id: '105', name: 'Room 105', status: 'Occupied' },
  { id: '106', name: 'Room 106', status: 'Available' },
];

export type Payment = {
  invoiceId: string;
  guestName: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
};

export const paymentsData: Payment[] = [
  { invoiceId: 'INV001', guestName: 'John Doe', date: '2024-07-20', amount: 350.00, status: 'Paid' },
  { invoiceId: 'INV002', guestName: 'Jane Smith', date: '2024-07-19', amount: 720.50, status: 'Paid' },
  { invoiceId: 'INV003', guestName: 'Mike Johnson', date: '2024-07-19', amount: 150.00, status: 'Pending' },
  { invoiceId: 'INV004', guestName: 'Emily Davis', date: '2024-07-18', amount: 480.75, status: 'Paid' },
  { invoiceId: 'INV005', guestName: 'Robert Brown', date: '2024-07-17', amount: 200.00, status: 'Failed' },
  { invoiceId: 'INV006', guestName: 'Linda Wilson', date: '2024-07-16', amount: 950.00, status: 'Paid' },
];

export const getDashboardStats = () => {
  const totalRooms = roomsData.length;
  const bookedRooms = roomsData.filter(r => r.status === 'Booked').length;
  const occupiedRooms = roomsData.filter(r => r.status === 'Occupied').length;
  return { totalRooms, bookedRooms, occupiedRooms };
};
