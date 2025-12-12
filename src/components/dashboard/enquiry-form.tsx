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
import { format, differenceInCalendarDays } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlarmClock, Pencil, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const enquiryFormSchema = z.object({
  enquiryType: z.enum(['walk-in', 'by-phone'], { required_error: 'Please select an enquiry type.' }),
  bookingDate: z.coerce.date({ required_error: 'A date is required.' }),
  notes: z.string().min(1, 'Notes are required'),
  id: z.string().optional(), // Add ID for editing
});

type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;

export function EnquiryForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [lastSavedEnquiry, setLastSavedEnquiry] = React.useState<EnquiryFormValues | null>(null);
  const [loggedEnquiries, setLoggedEnquiries] = React.useState<EnquiryFormValues[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingEnquiryId, setEditingEnquiryId] = React.useState<string | null>(null);

  const form = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      bookingDate: new Date(),
      notes: '',
    },
  });

  async function onSubmit(values: EnquiryFormValues) {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (editingEnquiryId) {
      // Update existing enquiry
      setLoggedEnquiries(prev => 
        prev.map(enquiry => 
          enquiry.id === editingEnquiryId ? { ...values, id: editingEnquiryId } : enquiry
        )
      );
      toast({ title: 'Enquiry Updated!', description: 'The enquiry details have been updated.' });
      setEditingEnquiryId(null);
    } else {
      // Add new enquiry
      const newEnquiry = { ...values, id: `enq-${Date.now()}` };
      setLastSavedEnquiry(newEnquiry);
      setLoggedEnquiries(prevEnquiries => [newEnquiry, ...prevEnquiries]);
      setIsDialogOpen(true);
      toast({ title: 'Enquiry Logged!', description: 'The customer enquiry has been saved.' });
    }

    setIsLoading(false);
    form.reset({
        bookingDate: new Date(),
        notes: '',
        enquiryType: undefined,
    });
  }
  
  const handleEdit = (enquiry: EnquiryFormValues) => {
    setEditingEnquiryId(enquiry.id!);
    form.reset(enquiry);
  };

  const handleDelete = (id: string) => {
    setLoggedEnquiries(prev => prev.filter(enquiry => enquiry.id !== id));
    toast({ title: 'Enquiry Deleted', description: 'The enquiry has been removed from the list.', variant: 'destructive' });
  };
  
  const cancelEdit = () => {
    setEditingEnquiryId(null);
    form.reset({
        bookingDate: new Date(),
        notes: '',
        enquiryType: undefined,
    });
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Customer Enquiry</CardTitle>
          <CardDescription>
            {editingEnquiryId ? 'Editing an existing enquiry.' : 'Log booking interest from walk-ins or phone calls.'}
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
            <CardFooter className="flex-col items-start gap-4">
               <div className="flex gap-2">
                 <Button type="submit" disabled={isLoading}>
                    {isLoading ? (editingEnquiryId ? 'Updating...' : 'Saving...') : (editingEnquiryId ? 'Update Enquiry' : 'Save Enquiry')}
                  </Button>
                  {editingEnquiryId && (
                    <Button type="button" variant="ghost" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  )}
               </div>
               {loggedEnquiries.length > 0 && (
                <div className="w-full space-y-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold text-muted-foreground">Logged Enquiries (Session)</h4>
                    <ScrollArea className="h-[150px] pr-4">
                        <div className="space-y-4">
                            {loggedEnquiries.map((enquiry) => {
                                const today = new Date();
                                const bookingDate = enquiry.bookingDate;
                                const daysDifference = differenceInCalendarDays(bookingDate, today);

                                const showNotification = daysDifference >= 0 && daysDifference <= 3;

                                return (
                                <div key={enquiry.id} className="p-3 bg-muted/50 rounded-lg border">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold capitalize">{enquiry.enquiryType.replace('-', ' ')}</p>
                                            <p className="text-sm text-muted-foreground">{format(enquiry.bookingDate, 'PPP')}</p>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            {showNotification && (
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <AlarmClock className="h-4 w-4 text-yellow-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Date is approaching soon!</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                            <Badge variant="secondary">Logged</Badge>
                                        </div>
                                    </div>
                                    <p className="text-sm my-2">{enquiry.notes}</p>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(enquiry)}>
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(enquiry.id!)}>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </div>
                                </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </div>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
      
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
    </TooltipProvider>
  );
}
