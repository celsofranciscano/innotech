"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, Users, Trophy, BookOpen, GraduationCap, Eye, Plus } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { formatDate } from "@/utils/date/formatDate";


interface Call {
  PK_call: number
  FK_user: number
  title: string
  description: string | null
  note: string | null
  urlImage: string | null
  pdfGuidelines: string | null
  submissionOpen: string
  submissionClose: string
  isActive: boolean
  isIndividual: boolean
  allowedProjectTypes: string[]
  allowedCategories: string[]
  minTeamMembers: number | null
  maxTeamMembers: number | null
  minExperienceLevel: string | null
  minTechRequirements: string[]
  prizes: string[]
  materia: string
  semestre: string
  resultsAnnouncement: string
  createdAt: string
  updatedAt: string
  actionHistory: {
    create: {
      userId: number
      userRole: string
      userName: string
      timestamp: string
    }
    updates: any[]
  }
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCalls()
  }, [])

  const fetchCalls = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/dashboard/calls")
      setCalls(response.data)
    } catch (error) {
      console.error("Error fetching calls:", error)
      toast.error("Error al cargar las convocatorias")
    } finally {
      setLoading(false)
    }
  }



  const getStatusBadge = (call: Call) => {
    const now = new Date()
    const openDate = new Date(call.submissionOpen)
    const closeDate = new Date(call.submissionClose)

    if (now < openDate) {
      return <Badge variant="secondary">Próximamente</Badge>
    } else if (now >= openDate && now <= closeDate) {
      return (
        <Badge variant="default" className="bg-blue-500 text-white">
          Abierta
        </Badge>
      )
    } else {
      return <Badge variant="destructive">Cerrada</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-96">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Convocatorias</h1>
          <p className="text-muted-foreground">
            Gestiona y visualiza todas las convocatorias activas del sistema UPDS INNOVA donde usted es el coordinador
          </p>
        </div>
        <Link href="/dashboard/calls/create">
          <Button className="text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Convocatoria
          </Button>
        </Link>
      </div>

      {calls.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay convocatorias</h3>
            <p className="text-muted-foreground mb-4">Aún no se han creado convocatorias en el sistema.</p>
            <Link href="/calls/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Convocatoria
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {calls.map((call) => (
            <Card key={call.PK_call} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-2">{call.title}</CardTitle>
                  {getStatusBadge(call)}
                </div>
                <CardDescription className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {call.materia} - {call.semestre}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>Abre: {formatDate(call.submissionOpen)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>Cierra: {formatDate(call.submissionClose)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">{call.isIndividual ? "Individual" : "Grupal"}</span>
                  </div>
                  {call.minExperienceLevel && (
                    <Badge variant="outline" className="text-xs">
                      Nivel: {call.minExperienceLevel}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Tipos de Proyecto
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {call.allowedProjectTypes.slice(0, 2).map((type, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {call.allowedProjectTypes.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{call.allowedProjectTypes.length - 2} más
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Premios
                  </h4>
                  <div className="space-y-1">
                    {call.prizes.slice(0, 2).map((prize, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"} {prize}
                      </div>
                    ))}
                    {call.prizes.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{call.prizes.length - 2} premios más</div>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-4">
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href={`/dashboard/calls/${call.PK_call}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalles
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
