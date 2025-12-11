import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { paymentsData, type Payment } from "@/lib/data";
import { cn } from "@/lib/utils";

const statusVariants: { [key in Payment["status"]]: string } = {
  Paid: "bg-green-900/50 text-green-300",
  Pending: "bg-amber-900/50 text-amber-300",
  Failed: "bg-red-900/50 text-red-300",
};


export function PaymentDetails() {
  const recentPayments = paymentsData.slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          A history of recent transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPayments.map((payment) => {
              return (
                <TableRow key={payment.invoiceId}>
                  <TableCell>
                    <div className="font-medium">{payment.guestName}</div>
                    <div className="text-sm text-muted-foreground md:hidden">
                      {payment.date}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className={cn("border-transparent", statusVariants[payment.status])}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{payment.date}</TableCell>
                  <TableCell className="text-right">
                    ${payment.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
