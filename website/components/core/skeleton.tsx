import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <Card className="w-full max-w-xs">
      <CardHeader>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-video w-full" />
      </CardContent>
    </Card>
  );
}
export function SkeletonFilter() {
  return (
    <>
      <div className="w-full max-w-xs mt-4">
        <Skeleton className="h-4 w-2/3 m-2" />
        <Skeleton className="h-4 w-1/2 m-2" />
        <Skeleton className="aspect-video w-full m-2" />
      </div>
      <Separator className="my-4" />
    </>
  );
}
