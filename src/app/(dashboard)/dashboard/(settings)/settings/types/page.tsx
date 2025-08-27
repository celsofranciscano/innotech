"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Plus, Edit, FolderOpen, Layers, Eye, Clock, User, Calendar } from "lucide-react"
import { formatDate } from "@/utils/date/formatDate"

interface ActionHistoryItem {
  userId: number
  userRole: string
  userName: string
  timestamp: string
  changes?: {
    [key: string]: {
      old: string
      new: string
    }
  }
}

interface ProjectType {
  PK_type: number
  type: string
  description: string
  createdAt: string
  updatedAt: string
  actionHistory?: {
    create: ActionHistoryItem
    updates: ActionHistoryItem[]
  }
}

const StatsCardsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-12" />
        </CardContent>
      </Card>
    ))}
  </div>
)

const ProjectTypeTableSkeleton = () => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="hidden sm:table-cell">Descripción</TableHead>
          <TableHead className="hidden md:table-cell">Creado</TableHead>
          <TableHead className="hidden md:table-cell">Actualizado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-8" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-24 rounded-full" />
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)

export default function ProjectTypesAdministration() {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType | null>(null)
  const [detailProjectType, setDetailProjectType] = useState<ProjectType | null>(null)
  const [formData, setFormData] = useState({
    type: "",
    description: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchProjectTypes = async () => {
    try {
      setLoading(true)
      setStatsLoading(true)
      const response = await axios.get("/api/settings/calls/types")
      setProjectTypes(response.data)
      setStatsLoading(false)
    } catch (error) {
      toast.error("Error al cargar los tipos de proyecto")
      console.error("Error fetching project types:", error)
      setStatsLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjectTypeDetail = async (id: number) => {
    try {
      const response = await axios.get(`/api/settings/calls/types/${id}`)
      setDetailProjectType(response.data.type)
      setIsDetailModalOpen(true)
    } catch (error) {
      toast.error("Error al cargar los detalles del tipo de proyecto")
      console.error("Error fetching project type detail:", error)
    }
  }

  const createProjectType = async () => {
    if (!formData.type.trim()) {
      toast.error("El tipo es obligatorio")
      return
    }

    try {
      setSubmitting(true)
      await axios.post("/api/settings/calls/types", formData)
      toast.success("Tipo de proyecto creado exitosamente")
      setIsCreateModalOpen(false)
      setFormData({ type: "", description: "" })
      fetchProjectTypes()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al crear el tipo de proyecto")
    } finally {
      setSubmitting(false)
    }
  }

  const updateProjectType = async () => {
    if (!selectedProjectType || !formData.type.trim()) {
      toast.error("El tipo es obligatorio")
      return
    }

    try {
      setSubmitting(true)
      await axios.patch(`/api/settings/calls/types/${selectedProjectType.PK_type}`, formData)
      toast.success("Tipo de proyecto actualizado exitosamente")
      setIsEditModalOpen(false)
      setSelectedProjectType(null)
      setFormData({ type: "", description: "" })
      fetchProjectTypes()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al actualizar el tipo de proyecto")
    } finally {
      setSubmitting(false)
    }
  }

  // Open edit modal
  const openEditModal = (projectType: ProjectType) => {
    setSelectedProjectType(projectType)
    setFormData({
      type: projectType.type,
      description: projectType.description || "",
    })
    setIsEditModalOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({ type: "", description: "" })
    setSelectedProjectType(null)
  }

  const getProjectTypeBadgeColor = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes("web") || lowerType.includes("aplicación web")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    } else if (lowerType.includes("móvil") || lowerType.includes("mobile") || lowerType.includes("app")) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    } else if (lowerType.includes("desktop") || lowerType.includes("escritorio")) {
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    } else if (lowerType.includes("api") || lowerType.includes("backend")) {
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    } else if (lowerType.includes("iot") || lowerType.includes("hardware")) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    } else {
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  useEffect(() => {
    fetchProjectTypes()
  }, [])

  return (
    <div className="">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shadow-md">
              <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Administración de Tipos de Proyecto</h1>
              <p className="text-muted-foreground">Gestiona los tipos de proyecto del sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Tipo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Tipo de Proyecto</DialogTitle>
                  <DialogDescription>Agrega un nuevo tipo de proyecto al sistema</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Tipo *</Label>
                    <Input
                      id="type"
                      placeholder="Ej: Aplicación Web, Aplicación Móvil..."
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value,
                        })
                      }
                      className="mt-1 shadow-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      placeholder="Descripción del tipo de proyecto..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 shadow-sm"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateModalOpen(false)
                      resetForm()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={createProjectType}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Crear
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <StatsCardsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tipos</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{projectTypes.length}</div>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aplicaciones Web</CardTitle>
                <FolderOpen className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {projectTypes.filter((p) => p.type.toLowerCase().includes("web")).length}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aplicaciones Móviles</CardTitle>
                <Layers className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {
                    projectTypes.filter(
                      (p) =>
                        p.type.toLowerCase().includes("móvil") ||
                        p.type.toLowerCase().includes("mobile") ||
                        p.type.toLowerCase().includes("app"),
                    ).length
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Project Types Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Lista de Tipos de Proyecto</CardTitle>
            <CardDescription>Administra todos los tipos de proyecto del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ProjectTypeTableSkeleton />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="hidden sm:table-cell">Descripción</TableHead>
                      <TableHead className="hidden md:table-cell">Creado</TableHead>
                      <TableHead className="hidden md:table-cell">Actualizado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectTypes.map((projectType) => (
                      <TableRow key={projectType.PK_type}>
                        <TableCell className="font-medium">{projectType.PK_type}</TableCell>
                        <TableCell>
                          <Badge className={getProjectTypeBadgeColor(projectType.type)}>{projectType.type}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell max-w-xs truncate">
                          {projectType.description || "Sin descripción"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {formatDate(projectType.createdAt)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {formatDate(projectType.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchProjectTypeDetail(projectType.PK_type)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(projectType)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {projectTypes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No hay tipos de proyecto registrados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Tipo de Proyecto</DialogTitle>
              <DialogDescription>Modifica los datos del tipo de proyecto seleccionado</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-type">Tipo *</Label>
                <Input
                  id="edit-type"
                  placeholder="Ej: Aplicación Web, Aplicación Móvil..."
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 shadow-sm"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Descripción del tipo de proyecto..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 shadow-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={updateProjectType}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Actualizar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-blue-600" />
                Detalles del Tipo de Proyecto
              </DialogTitle>
              <DialogDescription>Información completa y historial de cambios</DialogDescription>
            </DialogHeader>

            {detailProjectType && (
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Información Básica
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">ID</Label>
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded shadow-sm">
                          {detailProjectType.PK_type}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                        <Badge className={getProjectTypeBadgeColor(detailProjectType.type)}>
                          {detailProjectType.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
                      <p className="text-sm bg-muted px-3 py-2 rounded shadow-sm">
                        {detailProjectType.description || "Sin descripción"}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Fecha de Creación</Label>
                        <p className="text-sm bg-muted px-2 py-1 rounded shadow-sm">
                          {formatDate(detailProjectType.createdAt)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Última Actualización</Label>
                        <p className="text-sm bg-muted px-2 py-1 rounded shadow-sm">
                          {formatDate(detailProjectType.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Action History */}
                  {detailProjectType.actionHistory && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Historial de Acciones
                      </h3>

                      {/* Creation */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                          <Calendar className="h-4 w-4" />
                          Creación
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Usuario:</span>{" "}
                              {detailProjectType.actionHistory.create.userName}
                            </div>
                            <div>
                              <span className="font-medium">Rol:</span>{" "}
                              {detailProjectType.actionHistory.create.userRole}
                            </div>
                            <div className="md:col-span-2">
                              <span className="font-medium">Fecha:</span>{" "}
                              {formatDate(detailProjectType.actionHistory.create.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Updates */}
                      {detailProjectType.actionHistory.updates &&
                        detailProjectType.actionHistory.updates.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                              <Edit className="h-4 w-4" />
                              Actualizaciones ({detailProjectType.actionHistory.updates.length})
                            </div>
                            <div className="space-y-3">
                              {detailProjectType.actionHistory.updates.map((update, index) => (
                                <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg shadow-sm">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                                    <div>
                                      <span className="font-medium">Usuario:</span> {update.userName}
                                    </div>
                                    <div>
                                      <span className="font-medium">Rol:</span> {update.userRole}
                                    </div>
                                    <div className="md:col-span-2">
                                      <span className="font-medium">Fecha:</span> {formatDate(update.timestamp)}
                                    </div>
                                  </div>
                                  {update.changes && (
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium text-muted-foreground">
                                        Cambios realizados:
                                      </div>
                                      {Object.entries(update.changes).map(([field, change]) => (
                                        <div key={field} className="bg-background p-2 rounded shadow-sm">
                                          <div className="text-xs font-medium text-muted-foreground mb-1">
                                            Campo: {field}
                                          </div>
                                          <div className="grid grid-cols-1 gap-1 text-xs">
                                            <div className="text-red-600">
                                              <span className="font-medium">Anterior:</span> {change.old || "Vacío"}
                                            </div>
                                            <div className="text-green-600">
                                              <span className="font-medium">Nuevo:</span> {change.new}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
