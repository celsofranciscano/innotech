"use client"

import { useState, useEffect,useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { formatDate } from "@/utils/date/formatDate"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  UsersIcon,
  Trophy,
  Calendar,
  Tag,
  Code,
  Star,
  Eye,
  Filter,
  ArrowRight,
  Award,
  CheckCircle,
  User,
} from "lucide-react"

// Types
interface ProjectMember {
  role: string
  isLeader: boolean
  tbusers: {
    PK_user: number
    firstName: string
    lastName: string
    email: string
  }
}

interface Project {
  PK_project: number
  FK_call: number
  FK_type: number
  FK_category: number
  FK_status: number
  title: string
  shortSummary: string
  problem: string
  solution: string | null
  coverImage: string | null
  repoUrl: string | null
  demoUrl: string | null
  videoUrl: string | null
  technologies: string[]
  tags: string[]
  isFeatured: boolean
  isPublished: boolean
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
  tbprojectmembers: ProjectMember[]
  tbprojecttypes: { type: string }
  tbprojectcategories: { category: string }
  tbprojectstatus: { status: string }
  totalScore: number | null
  isQualified: boolean
}

interface Call {
  PK_call: number
  FK_user: number
  title: string
  description: string | null
  tbjurors: { FK_user: number }[]
}

interface ApiResponse {
  call: Call
  projects: Project[]
}

export default function CallProjectsPage() {
  const params = useParams()
  const router = useRouter()
  const callId = params.PK_call as string

  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [qualifiedFilter, setQualifiedFilter] = useState<string>("all")

const fetchProjects = useCallback(async () => {
  try {
    setLoading(true)
    const response = await axios.get(`/api/dashboard/calls/${callId}/projects`)
    setData(response.data)
  } catch (error: any) {
    console.error("Error fetching projects:", error)
    toast.error(error.response?.data?.error || "Error al cargar los proyectos")
  } finally {
    setLoading(false)
  }
}, [callId])

useEffect(() => {
  fetchProjects()
}, [fetchProjects])

  const filteredProjects =
    data?.projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.shortSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tbprojectmembers.some((member) =>
          `${member.tbusers.firstName} ${member.tbusers.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()),
        )

      const matchesStatus = statusFilter === "all" || project.tbprojectstatus.status === statusFilter
      const matchesType = typeFilter === "all" || project.tbprojecttypes.type === typeFilter
      const matchesCategory = categoryFilter === "all" || project.tbprojectcategories.category === categoryFilter
      const matchesQualified =
        qualifiedFilter === "all" ||
        (qualifiedFilter === "qualified" && project.isQualified) ||
        (qualifiedFilter === "not-qualified" && !project.isQualified)

      return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesQualified
    }) || []

  const getStatusColor = (status: string) => {
    const colors = {
      Borrador: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      Pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      "En Revisión": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Aprobado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Rechazado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getTypeColor = (type: string) => {
    const colors = {
      Web: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "Web app": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Mobile: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Desktop: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const handleProjectClick = (projectId: number) => {
    router.push(`/dashboard/calls/${callId}/projects/${projectId}`)
  }

  // Statistics
  const stats = data
    ? {
        total: data.projects.length,
        qualified: data.projects.filter((p) => p.isQualified).length,
        featured: data.projects.filter((p) => p.isFeatured).length,
        published: data.projects.filter((p) => p.isPublished).length,
      }
    : null

  // Skeleton Components
  const ProjectCardSkeleton = () => (
    <Card className="shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex gap-2 ml-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <UsersIcon className="h-4 w-4" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-5 w-16" />
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  )

  const StatCardSkeleton = () => (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-96" />
            <Skeleton className="h-5 w-64" />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">{data?.call.title}</h1>
            <p className="text-muted-foreground">
              Proyectos registrados en esta convocatoria • {filteredProjects.length} de {data?.projects.length || 0}{" "}
              proyectos
            </p>
          </>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <UsersIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.total}</p>
                    <p className="text-xs text-muted-foreground">Total Proyectos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.qualified}</p>
                    <p className="text-xs text-muted-foreground">Calificados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats?.featured}</p>
                    <p className="text-xs text-muted-foreground">Destacados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.published}</p>
                    <p className="text-xs text-muted-foreground">Publicados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Borrador">Borrador</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="En Revisión">En Revisión</SelectItem>
                <SelectItem value="Aprobado">Aprobado</SelectItem>
                <SelectItem value="Rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="Web">Web</SelectItem>
                <SelectItem value="Web app">Web App</SelectItem>
                <SelectItem value="Mobile">Mobile</SelectItem>
                <SelectItem value="Desktop">Desktop</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="Borrador">Borrador</SelectItem>
                <SelectItem value="Educacion">Educación</SelectItem>
                <SelectItem value="Salud">Salud</SelectItem>
                <SelectItem value="Finanzas">Finanzas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={qualifiedFilter} onValueChange={setQualifiedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Calificación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="qualified">Calificados</SelectItem>
                <SelectItem value="not-qualified">Sin calificar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <UsersIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No se encontraron proyectos</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ||
              statusFilter !== "all" ||
              typeFilter !== "all" ||
              categoryFilter !== "all" ||
              qualifiedFilter !== "all"
                ? "Intenta ajustar los filtros para ver más resultados."
                : "Aún no hay proyectos registrados en esta convocatoria."}
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Card
              key={project.PK_project}
              className="shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleProjectClick(project.PK_project)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {project.title}
                      {project.isFeatured && <Star className="inline h-4 w-4 text-yellow-500 ml-2" />}
                    </CardTitle>
                    <CardDescription className="text-sm">{project.shortSummary}</CardDescription>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Badge className={getStatusColor(project.tbprojectstatus.status)}>
                      {project.tbprojectstatus.status}
                    </Badge>
                    <Badge className={getTypeColor(project.tbprojecttypes.type)}>{project.tbprojecttypes.type}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  <strong>Problema:</strong> {project.problem}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <UsersIcon className="h-4 w-4" />
                    <span>{project.tbprojectmembers.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>{project.isQualified ? `${project.totalScore} pts` : "Sin calificar"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                </div>

                {/* Technologies */}
                {project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 3).map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Code className="h-3 w-3 mr-1" />
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.technologies.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {project.tbprojectmembers.find((m) => m.isLeader)?.tbusers.firstName}{" "}
                      {project.tbprojectmembers.find((m) => m.isLeader)?.tbusers.lastName}
                    </span>
                  </div>
                  <Button size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver detalles
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
