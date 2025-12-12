'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';

const enquiryFormSchema = z.object({
  enquiryType: z.enum(['walk-in', 'by-phone'], { required_error: 'Please select an enquiry type.' }),
  bookingDate: z.coerce.date({ required_error: 'A date is required.' }),
  notes: z.string().min(1, 'Notes are required'),
});

type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;

export function EnquiryForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [lastSavedEnquiry, setLastSavedEnquiry] = React.useState<EnquiryFormValues | null>(null);
  const [loggedEnquiries, setLoggedEnquiries] = React.useState<EnquiryFormValues[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const form = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      bookingDate: new Date(),
      notes: '',
    },
  });

  async function onSubmit(values: EnquiryFormValues) {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Enquiry submitted:', values);
    setLastSavedEnquiry(values);
    setLoggedEnquiries(prevEnquiries => [values, ...prevEnquiries]);
    setIsDialogOpen(true);

    toast({
      title: 'Enquiry Logged!',
      description: 'The customer enquiry has been saved.',
    });

    setIsLoading(false);
    form.reset({
        bookingDate: new Date(),
        notes: '',
        enquiryType: undefined,
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Log Customer Enquiry</CardTitle>
          <CardDescription>
            Record booking interest from walk-ins or phone calls.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="enquiryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enquiry Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="walk-in">Walk-in</SelectItem>
                        <SelectItem value="by-phone">By Phone</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="bookingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prospective Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any details about the customer's request..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Enquiry'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {loggedEnquiries.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>Logged Enquiries</CardTitle>
                <CardDescription>Recently saved customer enquiries for this session.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[240px] pr-4">
                    <div className="space-y-4">
                        {loggedEnquiries.map((enquiry, index) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-lg border">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold capitalize">{enquiry.enquiryType.replace('-', ' ')}</p>
                                        <p className="text-sm text-muted-foreground">{format(enquiry.bookingDate, 'PPP')}</p>
                                    </div>
                                    <Badge variant="secondary">Logged</Badge>
                                </div>
                                <p className="text-sm mt-2">{enquiry.notes}</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Enquiry Saved Successfully</DialogTitle>
                <DialogDescription>
                    The following enquiry details have been logged.
                </DialogDescription>
            </DialogHeader>
            {lastSavedEnquiry && (
                 <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="source" className="text-right">Source</Label>
                        <p id="source" className="col-span-3 font-semibold capitalize">{lastSavedEnquiry.enquiryType.replace('-', ' ')}</p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                         <Label htmlFor="date" className="text-right">Date</Label>
                        <p id="date" className="col-span-3 font-semibold">{format(lastSavedEnquiry.bookingDate, 'PPP')}</p>
                    </div>
                     <div className="grid grid-cols-4 items-start gap-4">
                         <Label htmlFor="notes" className="text-right mt-1">Notes</Label>
                        <p id="notes" className="col-span-3 bg-muted/50 p-2 rounded-md text-sm">{lastSavedEnquiry.notes}</p>
                    </div>
                 </div>
            )}
            <DialogFooter>
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
