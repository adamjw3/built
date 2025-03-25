"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useCreateClient } from "@/lib/hooks/use-clients"
import { DEFAULT_METRICS } from "@/constants"
import { createClient } from "@/lib/supabase/client" // Import from the correct path

// Create form schema with validation
const formSchema = z.object({
  clientType: z.enum(["online", "inPerson", "hybrid"], {
    required_error: "Please select a client type",
  }),
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  assignedTo: z.string(),
  sendInvitation: z.boolean().default(false),
})

type ClientFormValues = z.infer<typeof formSchema>

interface ClientFormProps {
  onSuccess?: () => void
}

export function ClientForm({ onSuccess }: ClientFormProps) {
  const [metricDefinitions, setMetricDefinitions] = useState<any[]>([])
  const createClientMutation = useCreateClient()
  
  // Fetch metric definitions on component mount
  useEffect(() => {
    const fetchMetricDefinitions = async () => {
      try {
        const supabase = createClient(); // Remove the await as it's not an async function
        const { data, error } = await supabase
          .from('metric_definitions')
          .select('*')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setMetricDefinitions(data);
        }
      } catch (error) {
        console.error("Error fetching metric definitions:", error);
      }
    };
    
    fetchMetricDefinitions();
  }, []);
  
  // Initialize form with react-hook-form
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientType: "online",
      firstName: "",
      lastName: "",
      email: "",
      assignedTo: "",
      sendInvitation: false
    },
  })

  // Get ordered metric IDs based on priority
  const getOrderedMetricIds = () => {
    // Clone the array to avoid modifying the original
    const metrics = [...metricDefinitions];
    const orderedIds = [];
    
    // First add priority metrics in specified order
    DEFAULT_METRICS.forEach(priorityName => {
      const priorityMetric = metrics.find(m => m.name === priorityName);
      if (priorityMetric) {
        orderedIds.push(priorityMetric.id);
      }
    });
    
    return orderedIds;
  };

  const onSubmit = (data: ClientFormValues) => {
    // Create client data
    const clientData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      clientType: data.clientType,
      assignedTo: data.assignedTo,
      sendInvitation: data.sendInvitation,
      metricDefinitions,
      orderedMetricIds: getOrderedMetricIds()
    }
    
    // Use React Query mutation
    createClientMutation.mutate(clientData, {
      onSuccess: () => {
        // Reset form
        form.reset()
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess()
        }
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="clientType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-row space-x-6"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="online" />
                      </FormControl>
                      <FormLabel className="font-normal">Online</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="inPerson" />
                      </FormControl>
                      <FormLabel className="font-normal">In-Person</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="hybrid" />
                      </FormControl>
                      <FormLabel className="font-normal">Hybrid</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">FIRST NAME</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">LAST NAME</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">EMAIL</FormLabel>
                <FormControl>
                  <Input placeholder="client@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">ASSIGN TO</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="adam">Adam Wright</SelectItem>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="michael">Michael Brown</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sendInvitation"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Send email invitation</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Client will receive an invitation to create a client account
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-24"
            disabled={createClientMutation.isPending}
          >
            {createClientMutation.isPending ? "Creating..." : "Invite"}
          </Button>
        </div>
      </form>
    </Form>
  )
}