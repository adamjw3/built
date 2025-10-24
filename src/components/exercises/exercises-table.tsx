"use client"

import { useState, useEffect, useRef } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ExerciseImage } from './exercises-image'
import { ExercisesForm } from './exercises-form'


import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/shadcn-io/combobox';

import { 
  ChevronDown, 
  ChevronUp, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Database,
} from "lucide-react"
import { useEquipment, useExercises, useMuscleGroups, useBodyParts } from "@/hooks/use-exercises"
import { Exercise } from "@/lib/queries/exercises"

// Format date to user's local datetime format
const formatDateTime = (dateString: string) => {
  if (!dateString) return "-"
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function ExercisesTable() {
  const [sortColumn, setSortColumn] = useState("")
  const [sortDirection, setSortDirection] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedExercises, setSelectedExercises] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [equipmentValue, setEquipmentValue] = useState("");
  const [muscleGroupOpen, setMuscleGroupOpen] = useState(false);
  const [muscleGroupValue, setMuscleGroupValue] = useState("");
  const [bodyPartOpen, setBodyPartOpen] = useState(false);
  const [bodyPartValue, setBodyPartValue] = useState("");
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const checkboxRef = useRef(null)
  const itemsPerPage = 50
  
  const filters = {
    sortBy: sortColumn,
    order: sortDirection,
    search: searchQuery || undefined,
    equipments: equipmentValue || undefined,
    target_muscles: muscleGroupValue || undefined,
    body_parts: bodyPartValue || undefined,
    is_custom: customValue || undefined
  }
  
  const {
    data: exercisesData,
    isLoading: isExercisesLoading,
    isError: isExercisesError,
  } = useExercises(filters);

  const allExercises = exercisesData?.exercises || [];

  const {
    data: equipmentData,
    isLoading: isEquipmentLoading,
    isError: isEquipmentError,
  } = useEquipment();

  const {
    data: muscleGroupData,
    isLoading: isMuscleGroupLoading,
    isError: isMuscleGroupError,
  } = useMuscleGroups();

  const {
    data: bodyPartData,
    isLoading: isBodyPartLoading,
    isError: isBodyPartError,
  } = useBodyParts();
  
  // Pagination logic
  const totalItems = allExercises.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const exercises = allExercises.slice(startIndex, endIndex)

  
  // Reset selected exercises and current page when filters change
  useEffect(() => {
    setSelectedExercises([])
    setCurrentPage(1)
  }, [searchQuery])
  
  // Reset selected exercises when data changes
  useEffect(() => {
    setSelectedExercises([])
  }, [exercisesData])
  
  // Set indeterminate state on checkbox via DOM API
  useEffect(() => {
    if (checkboxRef.current) {
      const isIndeterminate = selectedExercises.length > 0 && selectedExercises.length < exercises.length
      checkboxRef.current.indeterminate = isIndeterminate
    }
  }, [selectedExercises, exercises])
  
  // Handle sort column click
  const handleSortClick = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />
    }
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4 ml-1" /> 
      : <ChevronDown className="h-4 w-4 ml-1" />
  }

  const checkHandler = (checked, exerciseId) => {
    if (checked) {
      setSelectedExercises([...selectedExercises, exerciseId])
    } else {
      setSelectedExercises(selectedExercises.filter(id => id !== exerciseId))
    }
  }

  const onCheckedAllChange = (checked: boolean) => {
    if(checked) {
      const currentPageExerciseIds = exercises.map(exercise => exercise.id)
      setSelectedExercises([...selectedExercises, ...currentPageExerciseIds])
    } else {
      const currentPageExerciseIds = exercises.map(exercise => exercise.id)
      setSelectedExercises(selectedExercises.filter(id => !currentPageExerciseIds.includes(id)))
    }
  }
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const handleEditExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setIsSheetOpen(true)
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setEquipmentValue("")
    setMuscleGroupValue("")
    setBodyPartValue("")
    setCustomValue("")
    setCurrentPage(1)
  }

  return (
    <>
    <div>
      <div className="flex items-end space-x-4 p-4 border-b">
        <div className="flex flex-col space-y-1">
          <Label htmlFor="search" className="text-sm font-medium">Search</Label>
          <Input 
            id="search"
            placeholder="Search Exercises" 
            className="w-[200px]" 
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex flex-col space-y-1">
          <Label className="text-sm font-medium">Equipment</Label>
          <Combobox
            data={equipmentData?.map((equipment: string) => ({ label: equipment, value: equipment })) || []}
            onOpenChange={setEquipmentOpen}
            onValueChange={setEquipmentValue}
            open={equipmentOpen}
            value={equipmentValue}
            type="equipment"
          >
            <ComboboxTrigger className="w-[200px]"/>
            <ComboboxContent>
              <ComboboxInput/>
              <ComboboxEmpty/>
              <ComboboxList>
                <ComboboxGroup>
                  <ComboboxItem className="w-full" value="">
                    All
                  </ComboboxItem>
                  {equipmentData?.map((equipment) => (
                    <ComboboxItem className="w-full" key={equipment} value={equipment}>
                      {equipment}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        
        <div className="flex flex-col space-y-1">
          <Label className="text-sm font-medium">Muscle Group</Label>
          <Combobox
            data={muscleGroupData?.map((muscleGroup: string) => ({ label: muscleGroup, value: muscleGroup })) || []}
            onOpenChange={setMuscleGroupOpen}
            onValueChange={setMuscleGroupValue}
            open={muscleGroupOpen}
            value={muscleGroupValue}
            type="muscle group"
          >
            <ComboboxTrigger className="w-[200px]"/>
            <ComboboxContent>
              <ComboboxInput/>
              <ComboboxEmpty/>
              <ComboboxList>
                <ComboboxGroup>
                  <ComboboxItem className="w-full" value="">
                    All
                  </ComboboxItem>
                  {muscleGroupData?.map((muscleGroup) => (
                    <ComboboxItem className="w-full" key={muscleGroup} value={muscleGroup}>
                      {muscleGroup}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        
        <div className="flex flex-col space-y-1">
          <Label className="text-sm font-medium">Body Part</Label>
          <Combobox
            data={bodyPartData?.map((bodyPart: string) => ({ label: bodyPart, value: bodyPart })) || []}
            onOpenChange={setBodyPartOpen}
            onValueChange={setBodyPartValue}
            open={bodyPartOpen}
            value={bodyPartValue}
            type="body part"
          >
            <ComboboxTrigger className="w-[200px]"/>
            <ComboboxContent>
              <ComboboxInput/>
              <ComboboxEmpty/>
              <ComboboxList>
                <ComboboxGroup>
                  <ComboboxItem className="w-full" value="">
                    All
                  </ComboboxItem>
                  {bodyPartData?.map((bodyPart) => (
                    <ComboboxItem className="w-full" key={bodyPart} value={bodyPart}>
                      {bodyPart}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        
        <div className="flex flex-col space-y-1">
          <Label className="text-sm font-medium">Type</Label>
          <Combobox
            data={[
              { label: "Custom", value: "true" },
              { label: "Default", value: "false" }
            ]}
            onOpenChange={setCustomOpen}
            onValueChange={setCustomValue}
            open={customOpen}
            value={customValue}
            type="type"
          >
            <ComboboxTrigger className="w-[200px]"/>
            <ComboboxContent>
              <ComboboxInput/>
              <ComboboxEmpty/>
              <ComboboxList>
                <ComboboxGroup>
                  <ComboboxItem className="w-full" value="">
                    All
                  </ComboboxItem>
                  <ComboboxItem className="w-full" value="true">
                    Custom
                  </ComboboxItem>
                  <ComboboxItem className="w-full" value="false">
                    Default
                  </ComboboxItem>
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleResetFilters}
          className="flex items-center space-x-2"
        >
          <X className="h-4 w-4" />
          <span>Clear</span>
        </Button>
      </div>
      <div className="w-full overflow-auto">
        {isExercisesLoading ? (
          <div className="p-8 text-center">Loading exercises...</div>
        ) : isExercisesError ? (
          <div className="p-8 text-center text-red-500">Error loading exercises</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">
                  <Checkbox 
                    ref={checkboxRef}
                    onCheckedChange={onCheckedAllChange}
                    checked={selectedExercises.length > 0 && selectedExercises.length === exercises.length}
                  />
                </th>
                <th className="p-3 text-left"></th>
                <th 
                  className="p-3 text-left font-medium cursor-pointer"
                  onClick={() => handleSortClick("name")}
                >
                  <div className="flex items-center">
                    Exercises ({totalItems}) {getSortIcon("name")}
                  </div>
                </th>
                <th 
                  className="p-3 text-left font-medium cursor-pointer"
                  onClick={() => handleSortClick("target_muscles")}
                >
                  <div className="flex items-center">
                    Muscle Group {getSortIcon("target_muscles")}
                  </div>
                </th>
                <th 
                  className="p-3 text-left font-medium cursor-pointer"
                  onClick={() => handleSortClick("body_parts")}
                >
                  <div className="flex items-center">
                    Body Part {getSortIcon("body_parts")}
                  </div>
                </th>
                <th 
                  className="p-3 text-left font-medium cursor-pointer"
                  onClick={() => handleSortClick("equipments")}
                >
                  <div className="flex items-center">
                    Equipment {getSortIcon("equipments")}
                  </div>
                </th>
                <th 
                  className="p-3 text-left font-medium cursor-pointer"
                  onClick={() => handleSortClick("updated_at")}
                >
                  <div className="flex items-center">
                    Most Recent {getSortIcon("updated_at")}
                  </div>
                </th>
                <th 
                  className="p-3 text-left font-medium cursor-pointer"
                  onClick={() => handleSortClick("is_custom")}
                >
                  <div className="flex items-center">
                    Custom {getSortIcon("is_custom")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {exercises.length > 0 ? (
                exercises.map((exercise) => {
                  return (
                    <tr key={exercise.id} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                          <Checkbox />
                      </td>
                       <td className="p-3 capitalize"> <ExerciseImage 
                                filename={exercise.images[0]} 
                                name={exercise.name}
                                width={80}
                                height={80}
                                className="rounded-md"
                                paused={true}
                              /></td>
                      <td className="p-3 capitalize" onClick={() => handleEditExercise(exercise)}>{exercise.name}</td>
                      <td className="p-3 capitalize">{exercise.target_muscles}</td>
                      <td className="p-3 capitalize">{exercise.body_parts}</td>
                      <td className="p-3 capitalize">{exercise.equipments}</td>
                      <td className="p-3">{exercise.updated_at != exercise.created_at ? formatDateTime(exercise.updated_at) : "-"}</td>
                      <td className="p-3">
                        <div title={exercise.is_custom ? "Custom exercise" : "Default exercise"}>
                          {exercise.is_custom ? (
                            <User className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Database className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">
                    No Exercises found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} exercises
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
    <ExercisesForm selectedExercise={selectedExercise} setIsSheetOpen={setIsSheetOpen} isSheetOpen={isSheetOpen}/>
    </>
  )
}