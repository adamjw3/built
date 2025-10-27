"use client"

import { useCreateExercise, useUpdateExercise, useEquipment, useMuscleGroups, useBodyParts } from "@/hooks/use-exercises"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { MultipleFileUpload } from './multiple-file-upload'
import { MultiSelectField } from './multi-select-field'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useEffect, useState } from "react"
import { VideoPlayer } from '@/components/ui/video-player'
import { useVideo } from '@/hooks/use-video'

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  target_muscles: z.array(z.string()).optional(),
  body_parts: z.array(z.string()).optional(),
  equipments: z.array(z.string()).optional(),
  secondary_muscles: z.string().optional(),
  instructions: z.string().optional(),
  images: z.array(z.string()).optional(),
  video_url: z.string().optional().refine((url) => {
    if (!url || url === '') return true
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)(\d+)/
    return youtubeRegex.test(url) || vimeoRegex.test(url)
  }, { message: "Please enter a valid YouTube or Vimeo URL" }),
  is_custom: z.boolean().default(true),
})

type ExerciseFormValues = z.infer<typeof formSchema>

interface ExerciseFormProps {
  isSheetOpen: boolean
  setIsSheetOpen: (open: boolean) => void
  selectedExercise: any 
}

export function ExercisesForm({isSheetOpen, setIsSheetOpen, selectedExercise}: ExerciseFormProps) {
  const isEditMode = !!selectedExercise
  const isCustom = selectedExercise?.is_custom

  // Use the appropriate hook based on mode
  const createExercise = useCreateExercise()
  const updateExercise = useUpdateExercise(selectedExercise?.id)

  // Data hooks for multi-select options
  const { data: equipmentData } = useEquipment()
  const { data: muscleGroupData } = useMuscleGroups()
  const { data: bodyPartData } = useBodyParts()

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      target_muscles: [],
      body_parts: [],
      equipments: [],
      secondary_muscles: "",
      instructions: "",
      images: [],
      video_url: "",
      is_custom: true,
    },
  })

  // Watch video URL for preview with debounce
  const videoUrl = form.watch('video_url')
  const [debouncedVideoUrl, setDebouncedVideoUrl] = useState('')
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVideoUrl(videoUrl || '')
    }, 500)
    
    return () => clearTimeout(timer)
  }, [videoUrl])
  
  const { videoInfo, isLoading: isVideoLoading } = useVideo(debouncedVideoUrl)

  // Reset form when selectedExercise changes
  useEffect(() => {
    if (selectedExercise) {
      form.reset({
        name: selectedExercise.name || "",
        target_muscles: selectedExercise.target_muscles || [],
        body_parts: selectedExercise.body_parts || [],
        equipments: selectedExercise.equipments || [],
        secondary_muscles: selectedExercise.secondary_muscles?.join(", ") || "",
        instructions: selectedExercise.instructions?.join("\n") || "",
        images: selectedExercise.images || [],
        video_url: selectedExercise.video_url || "",
        is_custom: true,
      })
    } else {
      form.reset({
        name: "",
        target_muscles: [],
        body_parts: [],
        equipments: [],
        secondary_muscles: "",
        instructions: "",
        images: [],
        video_url: "",
        is_custom: true,
      })
    }
  }, [selectedExercise, form])

  const onSubmit = (values: ExerciseFormValues) => {
    // Arrays are already in the right format
    const exerciseData = {
      name: values.name,
      target_muscles: values.target_muscles || [],
      body_parts: values.body_parts || [],
      equipments: values.equipments || [],
      secondary_muscles: values.secondary_muscles
        ?.split(",")
        .map(s => s.trim())
        .filter(Boolean),
      instructions: values.instructions
        ?.split("\n")
        .filter(Boolean),
      images: values.images || [],
      video_url: values.video_url || null,
      is_custom: true,
    }
    
    if (isEditMode && isCustom) {
      updateExercise.mutate(exerciseData, {
        onSuccess: () => {
          setIsSheetOpen(false)
          form.reset()
        }
      })
    } else {
      createExercise.mutate(exerciseData, {
        onSuccess: () => {
          setIsSheetOpen(false)
          form.reset()
        }
      })
    }
  }

  const isLoading = createExercise.isPending || updateExercise.isPending

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent side="right" className="w-full sm:max-w-4xl flex flex-col p-0">
        <div className="sticky top-0 bg-background z-10 border-b">
          <SheetHeader className="px-6 py-4">
            <SheetTitle>
              {isEditMode ? 'Edit Exercise' : 'Create New Exercise'}
            </SheetTitle>
            <SheetDescription>
              {isEditMode 
                ? `Make changes to ${selectedExercise?.name}` 
                : 'Fill in the details to create a new exercise'
              }
            </SheetDescription>
          </SheetHeader>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Two-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {/* Name - Full width */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Barbell Bench Press" 
                          disabled={isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Target Muscles */}
                <FormField
                  control={form.control}
                  name="target_muscles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Muscles</FormLabel>
                      <FormControl>
                        <MultiSelectField
                          value={field.value || []}
                          onChange={field.onChange}
                          options={muscleGroupData || []}
                          placeholder="Select target muscles..."
                          type="muscle"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Body Parts */}
                <FormField
                  control={form.control}
                  name="body_parts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Parts</FormLabel>
                      <FormControl>
                        <MultiSelectField
                          value={field.value || []}
                          onChange={field.onChange}
                          options={bodyPartData || []}
                          placeholder="Select body parts..."
                          type="body part"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Equipment */}
                <FormField
                  control={form.control}
                  name="equipments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment</FormLabel>
                      <FormControl>
                        <MultiSelectField
                          value={field.value || []}
                          onChange={field.onChange}
                          options={equipmentData || []}
                          placeholder="Select equipment..."
                          type="equipment"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {/* Secondary Muscles */}
                <FormField
                  control={form.control}
                  name="secondary_muscles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Muscles</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., shoulders, forearms" 
                          disabled={isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Comma-separated</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
                <div className="space-y-6">
                {/* Video URL */}
                <FormField
                  control={form.control}
                  name="video_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input 
                          type="url"
                          placeholder="Vimeo or YouTube link" 
                          disabled={isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                      
                      {/* Video Preview */}
                      {field.value && (
                        <div className="mt-3">
                          {isVideoLoading ? (
                            <div className="bg-gray-100 rounded-lg p-4 text-center text-sm text-gray-500">
                              Loading video preview...
                            </div>
                          ) : videoInfo?.isValid ? (
                            <VideoPlayer 
                              url={field.value}
                              width={300}
                              height={169}
                              showTitle={true}
                              className="w-full"
                            />
                          ) : videoInfo?.error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                              {videoInfo.error}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </FormItem>
                  )}
                />
                
                {/* Images Upload */}
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Images</FormLabel>
                      <FormControl>
                        <MultipleFileUpload
                          value={field.value || []}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
              </div>
              
              {/* Instructions - Full width */}
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter each step on a new line" 
                        rows={8}
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>One step per line</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              

              {/* Form Actions - Fixed at bottom */}
              <div className="sticky bottom-0 bg-background pt-4 border-t -mx-6 px-6 pb-4">
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Exercise'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsSheetOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
