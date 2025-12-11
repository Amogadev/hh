import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { roomsData, type Room } from "@/lib/data";
import { Bed, User, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const statusConfig = {
  Available: {
    badge: "bg-green-900/50 text-green-300",
    icon: Bed,
    iconClass: "text-green-400",
  },
  Booked: {
    badge: "bg-orange-900/50 text-orange-300",
    icon: User,
    iconClass: "text-orange-400",
  },
  Occupied: {
    badge: "bg-red-900/50 text-red-300",
    icon: Bed,
    iconClass: "text-red-400",
  },
} as const;

export function RoomStatusGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {roomsData.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}

function RoomCard({ room }: { room: Room }) {
  const config = statusConfig[room.status];
  const Icon = config.icon;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">{room.name}</CardTitle>
            <Badge variant="outline" className={cn("border-transparent text-xs", config.badge)}>
                {room.status}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center text-center gap-2">
        <Icon className={cn("w-12 h-12 text-muted-foreground", config.iconClass)} />
        {room.status === 'Available' ? (
          <p className="text-muted-foreground">Ready for booking</p>
        ) : (
          <div className="text-sm">
            <p className="font-semibold flex items-center gap-2"><User className="w-4 h-4" /> AD</p>
            <p className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Next: Dec 18 - Dec 22</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full">Book Now</Button>
      </CardFooter>
    </Card>
  );
}
