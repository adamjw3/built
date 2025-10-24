
import { ExercisesTable } from '@/components/exercises/exercises-table'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { exercisesQueries } from '@/lib/queries/exercises'

export default async function ExercisesPage() {
  const queryClient = new QueryClient()
  
  // Prefetch clients data on the server
  await queryClient.prefetchQuery({
    queryKey: ['exercises', {}],
    queryFn: () => exercisesQueries.getAllExercises(),
  })

  return(
   <div className="container mx-auto p-4">
         <div className="flex items-center justify-between mb-6">
           <h1 className="text-2xl font-bold">All Exercises</h1>
         </div>
   
         <div className="bg-white rounded-md border">
          <HydrationBoundary state={dehydrate(queryClient)}>
              <ExercisesTable />
            </HydrationBoundary>
         </div>
       </div>
  )
}