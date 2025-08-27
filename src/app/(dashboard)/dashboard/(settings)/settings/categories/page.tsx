"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Plus, Eye, Edit, Search, FolderOpen, Calendar, User } from "lucide-react"
import { formatDate } from "@/utils/date/formatDate"

// Types
interface ActionHistoryItem {
  userId: number
  userRole: string
  userName: string
  timestamp: string
  changes?: Record<string, { old: any; new: any }>
}

interface ActionHistory {
  create: ActionHistoryItem
  updates: ActionHistoryItem[]
}

interface Category {
  PK_category: number
  category: string
  description: string | null
  createdAt: string
  updatedAt: string
  actionHistory?: ActionHistory
}

interface CategoryFormData {
  category: string
  description: string
}

// Skeleton Components
const CategoryTableSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    ))}
  </div>
)

const StatCardSkeleton = () => (
  <Card className="shadow-md border-0">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
)

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    category: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/settings/calls/categories")
      setCategories(response.data)
    } catch (error) {
      toast.error("Error al cargar las categorías")
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Create category
  const handleCreate = async () => {
    if (!formData.category.trim()) {
      toast.error("El nombre de la categoría es obligatorio")
      return
    }

    try {
      setIsSubmitting(true)
      await axios.post("/api/settings/calls/categories", formData)
      toast.success("Categoría creada exitosamente")
      setIsCreateModalOpen(false)
      setFormData({ category: "", description: "" })
      fetchCategories()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al crear la categoría")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit category
  const handleEdit = async () => {
    if (!selectedCategory || !formData.category.trim()) {
      toast.error("El nombre de la categoría es obligatorio")
      return
    }

    try {
      setIsSubmitting(true)
      await axios.patch(`/api/settings/calls/categories/${selectedCategory.PK_category}`, formData)
      toast.success("Categoría actualizada exitosamente")
      setIsEditModalOpen(false)
      setSelectedCategory(null)
      setFormData({ category: "", description: "" })
      fetchCategories()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al actualizar la categoría")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open edit modal
  const openEditModal = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      category: category.category,
      description: category.description || "",
    })
    setIsEditModalOpen(true)
  }

  // Open detail modal
  const openDetailModal = async (category: Category) => {
    try {
      const response = await axios.get(`/api/settings/calls/categories/${category.PK_category}`)
      setSelectedCategory(response.data.projectCategory)
      setIsDetailModalOpen(true)
    } catch {
      toast.error("Error al cargar los detalles de la categoría")
    }
  }

  // Filter categories
  const filteredCategories = categories.filter(
    (category) =>
      category.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Statistics
  const totalCategories = categories.length
  const recentCategories = categories.filter((cat) => {
    const createdDate = new Date(cat.createdAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return createdDate >= weekAgo
  }).length

  const categoriesWithDescription = categories.filter((cat) => cat.description && cat.description.trim()).length

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Administración de Categorías</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona las categorías de proyectos del sistema</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card className="shadow-md border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Categorías</CardTitle>
                <FolderOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalCategories}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Categorías registradas</p>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Nuevas (7 días)</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{recentCategories}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Creadas esta semana</p>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Con Descripción</CardTitle>
                <User className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{categoriesWithDescription}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Categorías documentadas</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Search */}
      <Card className="shadow-md border-0">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 shadow-sm border-gray-200 dark:border-gray-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card className="shadow-md border-0">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 dark:text-white">Lista de Categorías</CardTitle>
          <CardDescription>
            {loading ? "Cargando..." : `${filteredCategories.length} categoría(s) encontrada(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <CategoryTableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-600 dark:text-gray-400">ID</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Categoría</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Descripción</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Creado</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Actualizado</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.PK_category} className="border-gray-200 dark:border-gray-700">
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        {category.PK_category}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                        >
                          {category.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {category.description || "Sin descripción"}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {formatDate(category.createdAt)}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {formatDate(category.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailModal(category)}
                            className="shadow-sm border-gray-200 dark:border-gray-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(category)}
                            className="shadow-sm border-gray-200 dark:border-gray-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredCategories.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No se encontraron categorías</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md shadow-lg border-0">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Nueva Categoría</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Crea una nueva categoría de proyecto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">
                Nombre de la Categoría *
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ej: Desarrollo Web"
                className="shadow-sm border-gray-200 dark:border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la categoría..."
                className="shadow-sm border-gray-200 dark:border-gray-700"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="shadow-sm border-gray-200 dark:border-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            >
              {isSubmitting ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md shadow-lg border-0">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Editar Categoría</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Modifica los datos de la categoría
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-category" className="text-gray-700 dark:text-gray-300">
                Nombre de la Categoría *
              </Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ej: Desarrollo Web"
                className="shadow-sm border-gray-200 dark:border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-gray-700 dark:text-gray-300">
                Descripción
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la categoría..."
                className="shadow-sm border-gray-200 dark:border-gray-700"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="shadow-sm border-gray-200 dark:border-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl shadow-lg border-0 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Detalles de la Categoría</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Información completa de la categoría
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">ID</Label>
                  <p className="text-gray-900 dark:text-white">{selectedCategory.PK_category}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">Categoría</Label>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                  >
                    {selectedCategory.category}
                  </Badge>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">Descripción</Label>
                  <p className="text-gray-900 dark:text-white">{selectedCategory.description || "Sin descripción"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">Fecha de Creación</Label>
                  <p className="text-gray-900 dark:text-white">{formatDate(selectedCategory.createdAt)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">Última Actualización</Label>
                  <p className="text-gray-900 dark:text-white">{formatDate(selectedCategory.updatedAt)}</p>
                </div>
              </div>

              {/* Action History */}
              {selectedCategory.actionHistory && (
                <div className="space-y-4">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium text-lg">Historial de Acciones</Label>

                  {/* Creation */}
                  {selectedCategory.actionHistory.create && (
                    <Card className="shadow-sm border-0 bg-green-50 dark:bg-green-900/20">
                      <CardContent className="pt-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-green-600 text-white">Creación</Badge>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(selectedCategory.actionHistory.create.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Usuario:</strong> {selectedCategory.actionHistory.create.userName} (
                          {selectedCategory.actionHistory.create.userRole})
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Updates */}
                  {selectedCategory.actionHistory.updates && selectedCategory.actionHistory.updates.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">Actualizaciones</h4>
                      {selectedCategory.actionHistory.updates.map((update, index) => (
                        <Card key={index} className="shadow-sm border-0 bg-blue-50 dark:bg-blue-900/20">
                          <CardContent className="pt-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className="bg-blue-600 text-white">Actualización</Badge>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(update.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Usuario:</strong> {update.userName} ({update.userRole})
                            </p>
                            {update.changes && (
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Cambios:</p>
                                {Object.entries(update.changes).map(([field, change]) => (
                                  <p key={field} className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                    <strong>{field}:</strong> {change.old} → {change.new}
                                  </p>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailModalOpen(false)}
              className="shadow-sm border-gray-200 dark:border-gray-700"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
