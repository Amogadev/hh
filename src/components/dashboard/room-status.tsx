import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomStatusGrid } from "./room-status-grid";


export function RoomStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Status</CardTitle>
        <CardDescription>
          View and manage room bookings for the selected date.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RoomStatusGrid />
      </CardContent>
    </Card>
  );
}
