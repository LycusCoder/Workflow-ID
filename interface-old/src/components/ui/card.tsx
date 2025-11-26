import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

function StatCard({ title, value, subtitle, color }: { title: string; value: string | number; subtitle: string; color: string }) {
  return (
    <div className="p-6 rounded-2xl backdrop-blur-md border bg-white/70 border-slate-200/50 shadow-lg relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <div className="text-3xl font-bold mb-1" style={{ color }}>{value}</div>
        <p className="text-sm opacity-70">{subtitle}</p>
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: { title: string; assignee: string; deadline: string; priority: string; aiEstimate: string } }) {
  return (
    <div className="p-4 rounded-xl backdrop-blur-md border bg-white/70 border-slate-200/50 shadow-lg">
      <h3 className="font-bold text-sm">{task.title}</h3>
      <p className="text-xs opacity-70">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
      <div className="flex justify-between items-center">
        <span className="text-xs">{task.assignee}</span>
        <span className="text-xs opacity-70">{task.aiEstimate}</span>
      </div>
    </div>
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, StatCard, TaskCard }
