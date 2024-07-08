"use client";

import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export interface WebProps {
  result: string;
}

export function WebLoading() {
  return (
    <Card className="w-[325px] max-w-[325px] p-4 h-[350px] max-h-[350px] flex flex-col text-gray-50 bg-white">
      <div className="text-left mb-4">
        <Skeleton className="h-[16px] w-full" />
      </div>
      <div className="flex-grow flex flex-col justify-center items-center mb-8">
        <Skeleton className="h-[200px] w-[300px]" />
      </div>
      <div className="flex justify-between items-center mb-1">
        <Skeleton className="h-[16px] w-full" />
      </div>
    </Card>
  );
}

export function Web(props: WebProps) {
  return (
    <Card className="">
      <span>{props.result}</span>
    </Card>
  );
}
