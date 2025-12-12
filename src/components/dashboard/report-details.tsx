'use client';

import * as React from 'react';
import { addDays, format, isAfter, isBefore, isEqual } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Room, Payment } from '@/lib/data';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { Badge } from '../ui/badge';

type EnquiryDocument = {
  id: string;
  userId: string;
  enquiryType: 'walk-in' | 'by-phone';
  bookingDate: Timestamp;
  notes: string;
  createdAt: Timestamp;
};

type ReportDetailsProps = {
  allRooms: Room[];
};

function getDateFromTimestampOrDate(date: Date | Timestamp): Date {
    return date instanceof Timestamp ? date.toDate() : date;
}

export function ReportDetails({ allRooms }: ReportDetailsProps) {
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [reportData, setReportData] = React.useState<{
    bookings: Room[];
    payments: Room[];
    enquiries: EnquiryDocument[];
  } | null>(null);

  const firestore = useFirestore();
  const auth = useAuth();
  const user = auth.currentUser;
  
  const enquiriesCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'enquiries');
  }, [firestore]);

  const userEnquiriesQuery = useMemoFirebase(() => {
    if (!enquiriesCollectionRef || !user) return null;
    return query(
      enquiriesCollectionRef, 
      where('userId', '==', user.uid)
      );
  }, [enquiriesCollectionRef, user]);

  const { data: loggedEnquiries } = useCollection<EnquiryDocument>(userEnquiriesQuery);

  const handleGenerateReport = () => {
    const { from, to } = dateRange;
    
    // Filter Bookings
    const filteredBookings = allRooms.filter(room => {
        if (!room.booking) return false;
        const checkIn = getDateFromTimestampOrDate(room.booking.checkIn);
        // Check for any overlap in date ranges
        return (isAfter(checkIn, from) || isEqual(checkIn, from)) && 
               (isBefore(checkIn, to) || isEqual(checkIn, to));
    });

    // Filter Payments
    const filteredPayments = allRooms.filter(room => {
        if (!room.payment) return false;
        const paymentDate = new Date(room.payment.date);
        return (isAfter(paymentDate, from) || isEqual(paymentDate, from)) && 
               (isBefore(paymentDate, to) || isEqual(paymentDate, to));
    });

    // Filter Enquiries
    const filteredEnquiries = loggedEnquiries?.filter(enquiry => {
        const enquiryDate = getDateFromTimestampOrDate(enquiry.createdAt);
        return (isAfter(enquiryDate, from) || isEqual(enquiryDate, from)) &&
               (isBefore(enquiryDate, to) || isEqual(enquiryDate, to));
    }) || [];

    setReportData({
        bookings: filteredBookings,
        payments: filteredPayments,
        enquiries: filteredEnquiries
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-end gap-4 p-4 border-b">
        <div className="grid gap-2">
          <Label htmlFor="from-date">From</Label>
          <Input
            id="from-date"
            type="date"
            value={format(dateRange.from, 'yyyy-MM-dd')}
            onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="to-date">To</Label>
          <Input
            id="to-date"
            type="date"
            value={format(dateRange.to, 'yyyy-MM-dd')}
            onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })}
          />
        </div>
        <Button onClick={handleGenerateReport}>Generate</Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {reportData ? (
          <Tabs defaultValue="bookings" className="h-full flex flex-col">
            <TabsList className="m-4">
              <TabsTrigger value="bookings">Bookings ({reportData.bookings.length})</TabsTrigger>
              <TabsTrigger value="payments">Payments ({reportData.payments.length})</TabsTrigger>
              <TabsTrigger value="enquiries">Enquiries ({reportData.enquiries.length})</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-1 px-4">
                <TabsContent value="bookings">
                    {reportData.bookings.length > 0 ? reportData.bookings.map(room => (
                        <div key={room.id} className="p-3 border-b grid grid-cols-4 gap-4 items-center">
                            <p className="font-semibold">{room.name}</p>
                            <p>{room.booking?.guestName}</p>
                            <p className="text-sm text-muted-foreground">
                                {room.booking ? `${format(getDateFromTimestampOrDate(room.booking.checkIn), 'PPP')} - ${format(getDateFromTimestampOrDate(room.booking.checkOut), 'PPP')}`: ''}
                            </p>
                            <Badge variant={room.booking?.checkedIn ? 'destructive' : 'outline'}>{room.booking?.checkedIn ? 'Occupied' : 'Booked'}</Badge>
                        </div>
                    )) : <p className="text-center text-muted-foreground p-8">No bookings in this date range.</p>}
                </TabsContent>
                 <TabsContent value="payments">
                     {reportData.payments.length > 0 ? reportData.payments.map(room => (
                        <div key={room.id} className="p-3 border-b grid grid-cols-5 gap-4 items-center">
                            <p className="font-semibold">{room.payment?.guestName}</p>
                            <p className="text-sm text-muted-foreground">{room.name}</p>
                            <p className="text-sm font-mono">₹{room.payment?.amount.toFixed(2)}</p>
                            <p className={`text-sm font-mono ${room.payment && room.payment.pending > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                                Pending: ₹{room.payment?.pending.toFixed(2)}
                            </p>
                            <Badge variant={room.payment?.status === 'Paid' ? 'default' : 'secondary'}>{room.payment?.status}</Badge>
                        </div>
                    )) : <p className="text-center text-muted-foreground p-8">No payments in this date range.</p>}
                </TabsContent>
                 <TabsContent value="enquiries">
                    {reportData.enquiries.length > 0 ? reportData.enquiries.map(enquiry => (
                        <div key={enquiry.id} className="p-3 border-b grid grid-cols-4 gap-4 items-center">
                            <p className="font-semibold capitalize">{enquiry.enquiryType.replace('-', ' ')}</p>
                            <p className="text-sm text-muted-foreground">{format(getDateFromTimestampOrDate(enquiry.bookingDate), 'PPP')}</p>
                            <p className="col-span-2 text-sm">{enquiry.notes}</p>
                        </div>
                    )) : <p className="text-center text-muted-foreground p-8">No enquiries in this date range.</p>}
                </TabsContent>
            </ScrollArea>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a date range and click "Generate" to see the report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
