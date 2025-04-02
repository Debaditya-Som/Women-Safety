import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

