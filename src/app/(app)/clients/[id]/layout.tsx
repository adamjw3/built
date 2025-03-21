import { SectionNavigation } from "@/components/navigation/section-navigation"

export default async function ClientLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: { id: string };
}>) {
  const { id } = await params;
  
  // Navigation items for this client
  const navItems = [
    {
      label: "Overview",
      url: `/clients/${id}`
    },
    {
      label: "Metrics",
      url: `/clients/${id}/metrics`
    },
    {
      label: "Workouts",
      url: `/clients/${id}/workouts`
    },
    {
      label: "Nutrition",
      url: `/clients/${id}/nutrition`
    },
    {
      label: "Notes",
      url: `/clients/${id}/notes`
    }
  ]

  return (
    <>
      <SectionNavigation items={navItems} />
      {children}
    </>
  )
}