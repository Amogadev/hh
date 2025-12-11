import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet } from "lucide-react";

export function DailyRevenue() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Revenue</CardTitle>
        <CardDescription>
          Revenue and payment breakdown for the selected date.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <DollarSign className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-1">Total Income</p>
            <p className="text-2xl font-bold">$0</p>
          </Card>
          <Card className="p-4 text-center">
            <Wallet className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-1">Rooms Booked</p>
            <p className="text-2xl font-bold">0</p>
          </Card>
        </div>
        <div className="space-y-2">
            <h3 className="font-semibold">Payment Breakdown</h3>
            <div className="text-center text-muted-foreground py-8">
                <p>No payment data for this date.</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
