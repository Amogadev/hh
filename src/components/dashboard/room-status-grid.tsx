import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { roomsData, type Room } from "@/lib/data";
import { BedDouble, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  Available: {
    variant: "secondary",
    icon: CheckCircle,
    className: "text-green-600",
  },
  Booked: {
    variant: "default",
    icon: Clock,
    className: "bg-amber-500 hover:bg-amber-500/80",
  },
  Occupied: {
    variant: "destructive",
    icon: BedDouble,
    className: "",
  },
} as const;

export function RoomStatusGrid() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Status</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {roomsData.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </CardContent>
    </Card>
  );
}

function RoomCard({ room }: { room: Room }) {
  const config = statusConfig[room.status];
  const Icon = config.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{room.name}</CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", config.className)} />
      </CardHeader>
      <CardContent>
        <Badge variant={config.variant} className={cn(config.className)}>
          {room.status}
        </Badge>
      </CardContent>
    </Card>
  );
}
