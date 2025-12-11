"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OverviewCards } from "./overview-cards";
import { ListCollapse } from "lucide-react";
import type { Room } from "@/lib/data";

export function RoomDetailCard({ rooms }: { rooms: Room[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:bg-card/80 transition-colors">
          <CardHeader>
            <CardTitle>Room Details</CardTitle>
            <CardDescription>
              Click to see an overview of room statistics.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center text-muted-foreground">
            <ListCollapse className="w-10 h-10" />
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Room Overview</DialogTitle>
          <DialogDescription>
            A quick look at the current status of all rooms.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <OverviewCards rooms={rooms} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
