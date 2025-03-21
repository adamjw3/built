"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
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
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
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

  const onSubmit = async (data: ClientFormValues) => {
    setIsLoading(true)

    try {
      const supabase = createClient();

      // First check if the user is authenticated
      const { data: userData, error: authError } = await supabase.auth.getUser()
      if (authError || !userData?.user) {
        throw new Error('You must be logged in to create a client')
      }

      // Insert client data directly into Supabase
      const { data: client, error } = await supabase
        .from('clients')
        .insert([
          {
            name: `${data.firstName} ${data.lastName}`,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            client_type: data.clientType,
            assigned_to: data.assignedTo,
            user_id: userData.user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }


      if (data.sendInvitation) {
        // You could implement email sending here
        // For example with Supabase Edge Functions or another service
        console.log(`Email invitation would be sent to ${data.email}`)
      }

      toast({
        title: "Success",
        description: data.sendInvitation 
          ? "Client created and invitation sent" 
          : "Client created successfully",
      })

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }

      router.push('/clients')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Invite"}
          </Button>
        </div>
      </form>
    </Form>
  )
}