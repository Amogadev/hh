'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import type { Room, Payment } from '@/lib/data';
import { format, isAfter, isEqual, startOfDay } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

const manageBookingSchema = z.object({
  repaymentAmount: z.coerce.number().min(0.01, 'Repayment must be positive'),
});

type ManageBookingFormValues = z.infer<typeof manageBookingSchema>;

type ManageBookingFormProps = {
  room: Room;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateRoom: (updatedRoom: Partial<Room> & { id: string }) => void;
};

function getDateFromTimestampOrDate(date: Date | Timestamp): Date {
    return date instanceof Timestamp ? date.toDate() : date;
}

export function ManageBookingForm({
  room,
  isOpen,
  onOpenChange,
  onUpdateRoom,
}: ManageBookingFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<ManageBookingFormValues>({
    resolver: zodResolver(manageBookingSchema),
    defaultValues: {
      repaymentAmount: 0,
    },
  });

  const { booking, payment } = room;

  if (!booking || !payment) {
    // This should not happen if the form is opened for a booked room
    return null;
  }

  const handleRepayment = (values: ManageBookingFormValues) => {
    setIsLoading(true);

    const newAdvancePaid = payment.advancePaid + values.repaymentAmount;
    const newPending = payment.amount - newAdvancePaid;

    if (newAdvancePaid > payment.amount) {
        toast({
            variant: "destructive",
            title: "Overpayment Error",
            description: "Repayment amount cannot exceed the pending balance.",
        });
        setIsLoading(false);
        return;
    }

    const updatedPayment: Payment = {
        ...payment,
        advancePaid: newAdvancePaid,
        pending: newPending,
        status: newPending <= 0 ? 'Paid' : 'Pending',
    };

    const updatedRoom: Partial<Room> & { id: string } = {
        id: room.id,
        payment: updatedPayment,
    };
    
    onUpdateRoom(updatedRoom);
    
    toast({
        title: "Payment Successful!",
        description: `₹${values.repaymentAmount.toFixed(2)} has been paid for ${room.name}.`,
    });
    setIsLoading(false);
    onOpenChange(false);
    form.reset();
  };

  const handleCheckIn = () => {
    const updatedRoom: Partial<Room> & { id: string } = {
        id: room.id,
        booking: {
            ...booking,
            checkedIn: true,
        },
    };
    onUpdateRoom(updatedRoom);
    toast({
        title: "Checked In!",
        description: `${booking.guestName} has checked into ${room.name}.`,
    });
    onOpenChange(false);
  };
  
  const canCheckIn = room.status === 'Booked' && room.booking && !room.booking.checkedIn && 
    (isAfter(startOfDay(new Date()), startOfDay(getDateFromTimestampOrDate(room.booking.checkIn))) || isEqual(startOfDay(new Date()), startOfDay(getDateFromTimestampOrDate(room.booking.checkIn))));


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Booking for {room.name}</DialogTitle>
          <DialogDescription>
            Process repayments and manage booking details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-1">
                <Label>Guest</Label>
                <p className="font-semibold">{booking.guestName}</p>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label>Check-in</Label>
                    <p className="font-semibold">{format(getDateFromTimestampOrDate(booking.checkIn), "PPP")}</p>
                </div>
                <div className="space-y-1">
                    <Label>Check-out</Label>
                    <p className="font-semibold">{format(getDateFromTimestampOrDate(booking.checkOut), "PPP")}</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-1">
                    <Label>Total Amount</Label>
                    <p className="font-semibold">₹{payment.amount.toFixed(2)}</p>
                </div>
                 <div className="space-y-1">
                    <Label>Advance Paid</Label>
                    <p className="font-semibold">₹{payment.advancePaid.toFixed(2)}</p>
                </div>
                 <div className="space-y-1">
                    <Label>Pending</Label>
                    <p className="font-semibold text-destructive">₹{payment.pending.toFixed(2)}</p>
                </div>
            </div>
        </div>
        {payment.pending > 0 && (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleRepayment)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="repaymentAmount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Repayment Amount</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Enter amount" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <DialogFooter>
                        {canCheckIn && <Button type="button" variant="outline" onClick={handleCheckIn}>Check In</Button>}
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Make Payment'}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        )}
         {payment.pending <= 0 && (
            <DialogFooter className="flex-col gap-2 sm:flex-row">
                 {canCheckIn && <Button type="button" onClick={handleCheckIn} className='w-full'>Check In</Button>}
                 <p className="text-center font-semibold text-green-500 py-4 w-full">This booking is fully paid.</p>
            </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
