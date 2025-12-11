'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Room } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

const bookingFormSchema = z
  .object({
    guestName: z.string().min(1, 'Guest name is required'),
    checkIn: z.date({ required_error: 'Check-in date is required.' }),
    checkOut: z.date({ required_error: 'Check-out date is required.' }),
    paymentMethod: z.enum(['Credit Card', 'Cash', 'Bank Transfer']),
    totalAmount: z.coerce.number().min(0, 'Total amount must be positive'),
    advancePayment: z.coerce.number().min(0, 'Advance payment must be positive'),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: 'Check-out date must be after check-in date.',
    path: ['checkOut'],
  })
  .refine((data) => data.advancePayment <= data.totalAmount, {
    message: 'Advance payment cannot exceed total amount.',
    path: ['advancePayment'],
  });

type BookingFormValues = z.infer<typeof bookingFormSchema>;

type BookingFormProps = {
  room: Room;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onBookingSuccess: (roomId: string, values: BookingFormValues) => void;
};

export function BookingForm({
  room,
  isOpen,
  onOpenChange,
  onBookingSuccess,
}: BookingFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guestName: '',
      checkIn: new Date(),
      checkOut: addDays(new Date(), 1),
      paymentMethod: 'Credit Card',
      totalAmount: 100,
      advancePayment: 0,
    },
  });

  const totalAmount = form.watch('totalAmount');
  const advancePayment = form.watch('advancePayment');
  const pendingPayment = totalAmount - advancePayment;

  async function onSubmit(values: BookingFormValues) {
    setIsLoading(true);
    // Here you would typically call a function to save to your database
    console.log('Booking submitted', { roomId: room.id, ...values });

    // Mock delay
    setTimeout(() => {
        onBookingSuccess(room.id, values);
        toast({
            title: 'Booking Confirmed!',
            description: `${room.name} has been booked for ${values.guestName}.`,
        });
        setIsLoading(false);
        onOpenChange(false);
        form.reset();
    }, 1000);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book {room.name}</DialogTitle>
          <DialogDescription>
            Fill in the details below to complete the booking.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="checkIn"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-in Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="checkOut"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-out Date</FormLabel>
                     <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Total Amount</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="100.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="advancePayment"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Advance Payment</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div>
                <Label>Pending Payment</Label>
                <Input value={`$${pendingPayment.toFixed(2)}`} readOnly className="mt-1 font-semibold text-lg" />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
