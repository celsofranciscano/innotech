"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/utils/date/formatDate"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  CalendarDays,
  Users,
  FileText,
  Globe,
  Code,
  Plus,
  X,
  Search,
  UserPlus,
  Save,
  Send,
  ArrowLeft,
} from "lucide-react"

interface Call {
  PK_call: number
  title: string
  problem: string
  isIndividual: boolean
  minMembers: number
  maxMembers: number
  startDate: string
  submissionOpen: string
}

interface ProjectType {
  PK_type: number
  type: string
  problem: string
}

interface ProjectCategory {
  PK_category: number
  category: string
  problem: string
}

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  avatar?: string
}

interface Member {
  FK_user: number
  user: User
  role: string
  isLeader: boolean
}

export default function CreateProjectPage() {
  const params = useParams()
  const router = useRouter()
  const PK_call = params.PK_call as string

  // Estados principales
  const [call, setCall] = useState<Call | null>(null)
  const [types, setTypes] = useState<ProjectType[]>([])
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Estados del formulario
  const [formData, setFormData] = useState({
    title: "",
    shortSummary: "",
    problem: "",
    solution: "", // New required field
    coverImage: "",
    repoUrl: "",
    demoUrl: "",
    videoUrl: "",
    technologies: [] as string[],
    tags: [] as string[],
    FK_type: "",
    FK_category: "",
  })

  // Estados para miembros
  const [members, setMembers] = useState<Member[]>([])
  const [searchUsers, setSearchUsers] = useState<User[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [searchingUsers, setSearchingUsers] = useState(false)

  // Estados para tecnologías y tags
  const [newTechnology, setNewTechnology] = useState("")
  const [newTag, setNewTag] = useState("")

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [callRes, typesRes, categoriesRes] = await Promise.all([
          axios.get(`/api/account/calls/${PK_call}`),
          axios.get("/api/account/types"),
          axios.get("/api/account/categories"),
        ])

        setCall(callRes.data)
        setTypes(typesRes.data)
        setCategories(categoriesRes.data)
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [PK_call])

  // Buscar usuarios
  const searchUsersHandler = async (query: string) => {
    if (!query.trim()) {
      setSearchUsers([])
      return
    }

    setSearchingUsers(true)
    try {
      const response = await axios.get(`/api/users/search?q=${encodeURIComponent(query)}`)
      setSearchUsers(response.data)
    } catch (error) {
      console.error("Error searching users:", error)
      toast.error("Error al buscar usuarios")
    } finally {
      setSearchingUsers(false)
    }
  }

  // Agregar miembro
  const addMember = (user: User, role = "Miembro") => {
    if (members.some((m) => m.FK_user === user.id)) {
      toast.error("Este usuario ya es miembro del proyecto")
      return
    }

    if (call && !call.isIndividual && members.length >= call.maxMembers) {
      toast.error(`No se pueden agregar más de ${call.maxMembers} miembros`)
      return
    }

    const newMember: Member = {
      FK_user: user.id,
      user,
      role,
      isLeader: false,
    }

    setMembers([...members, newMember])
    setShowUserSearch(false)
    setUserSearch("")
    setSearchUsers([])
    toast.success(`${user.firstName} ${user.lastName} agregado al equipo`)
  }

  // Remover miembro
  const removeMember = (userId: number) => {
    setMembers(members.filter((m) => m.FK_user !== userId))
    toast.success("Miembro removido del equipo")
  }

  // Agregar tecnología
  const addTechnology = () => {
    if (!newTechnology.trim()) return
    if (formData.technologies.includes(newTechnology.trim())) {
      toast.error("Esta tecnología ya está agregada")
      return
    }

    setFormData({
      ...formData,
      technologies: [...formData.technologies, newTechnology.trim()],
    })
    setNewTechnology("")
  }

  // Agregar tag
  const addTag = () => {
    if (!newTag.trim()) return
    if (formData.tags.includes(newTag.trim())) {
      toast.error("Este tag ya está agregado")
      return
    }

    setFormData({
      ...formData,
      tags: [...formData.tags, newTag.trim()],
    })
    setNewTag("")
  }

  // Validar formulario
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("El título es obligatorio")
      return false
    }
    if (!formData.shortSummary.trim()) {
      toast.error("El resumen corto es obligatorio")
      return false
    }
    if (!formData.problem.trim()) {
      toast.error("El problema es obligatorio")
      return false
    }
    if (!formData.solution.trim()) {
      toast.error("La solución es obligatoria")
      return false
    }
    if (call && !call.isIndividual && members.length < call.minMembers) {
      toast.error(`Se requieren al menos ${call.minMembers} miembros para esta convocatoria`)
      return false
    }
    return true
  }

  // Enviar formulario
  const handleSubmit = async (isDraft = false) => {
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const payload = {
        title: formData.title.trim(),
        shortSummary: formData.shortSummary.trim(),
        problem: formData.problem.trim(),
        solution: formData.solution.trim(),
        coverImage: formData.coverImage?.trim() || null,
        repoUrl: formData.repoUrl?.trim() || null,
        demoUrl: formData.demoUrl?.trim() || null,
        videoUrl: formData.videoUrl?.trim() || null,
        technologies: formData.technologies.length > 0 ? formData.technologies : null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        FK_type: formData.FK_type ? Number(formData.FK_type) : null,
        FK_category: formData.FK_category ? Number(formData.FK_category) : null,
        members: call?.isIndividual
          ? []
          : members.map((m) => ({
              FK_user: m.FK_user,
              role: m.role,
              isLeader: m.isLeader,
            })),
        isDraft,
      }

      const response = await axios.post(`/api/account/calls/${PK_call}/project`, payload)

      toast.success(isDraft ? "Proyecto guardado como borrador" : "Proyecto enviado exitosamente")
      router.push(`/account/projects/${response.data.project.PK_project}`)
    } catch (error: any) {
      console.error("Error submitting project:", error)
      toast.error(error.response?.data?.error || "Error al enviar el proyecto")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!call) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Convocatoria no encontrada</h2>
              <p className="text-muted-foreground mb-4">
                La convocatoria que buscas no existe o no tienes permisos para acceder.
              </p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Registrar Proyecto</h1>
          <p className="text-muted-foreground">
            Convocatoria: <span className="font-medium">{call.title}</span>
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {call.isIndividual ? "Individual" : `Grupal (${call.minMembers}-${call.maxMembers} miembros)`}
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays className="w-4 h-4" />
              Hasta: {formatDate(call.submissionOpen)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Información Básica
              </CardTitle>
              <CardDescription>Información general del proyecto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Proyecto *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ingresa el título de tu proyecto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortSummary">Resumen Corto *</Label>
                <Input
                  id="shortSummary"
                  value={formData.shortSummary}
                  onChange={(e) => setFormData({ ...formData, shortSummary: e.target.value })}
                  placeholder="Resumen en una línea"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem">Problema *</Label>
                <Textarea
                  id="problem"
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  placeholder="Describe el problema que resuelve tu proyecto"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution">Solución *</Label>
                <Textarea
                  id="solution"
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  placeholder="Describe la solución que propone tu proyecto"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Proyecto</Label>
                  <Select
                    value={formData.FK_type}
                    onValueChange={(value) => setFormData({ ...formData, FK_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.PK_type} value={type.PK_type.toString()}>
                          {type.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={formData.FK_category}
                    onValueChange={(value) => setFormData({ ...formData, FK_category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.PK_category} value={category.PK_category.toString()}>
                          {category.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enlaces y Recursos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Enlaces y Recursos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coverImage">Imagen de Portada (URL)</Label>
                <Input
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="repoUrl">Repositorio (GitHub)</Label>
                  <Input
                    id="repoUrl"
                    value={formData.repoUrl}
                    onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                    placeholder="https://github.com/usuario/proyecto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demoUrl">Demo en Vivo</Label>
                  <Input
                    id="demoUrl"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                    placeholder="https://mi-proyecto.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video Demostración</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

            
              </div>
            </CardContent>
          </Card>

          {/* Tecnologías y Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Tecnologías y Etiquetas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tecnologías Utilizadas</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    placeholder="Ej: React, Node.js, Python"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTechnology())}
                  />
                  <Button type="button" onClick={addTechnology} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            technologies: formData.technologies.filter((_, i) => i !== index),
                          })
                        }
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Etiquetas</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ej: innovación, sostenibilidad, educación"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            tags: formData.tags.filter((_, i) => i !== index),
                          })
                        }
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Equipo de Trabajo */}
          {!call.isIndividual && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Equipo de Trabajo
                </CardTitle>
                <CardDescription>
                  {call.minMembers}-{call.maxMembers} miembros requeridos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Miembros actuales: {members.length + 1} / {call.maxMembers}
                </div>

                {/* Usuario actual (líder) */}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>TÚ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">Tú (Líder)</p>
                    <p className="text-sm text-muted-foreground">Líder del proyecto</p>
                  </div>
                  <Badge>Líder</Badge>
                </div>

                {/* Miembros agregados */}
                {members.map((member) => (
                  <div key={member.FK_user} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {member.user.firstName[0]}
                        {member.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeMember(member.FK_user)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {/* Agregar miembro */}
                {members.length < call.maxMembers - 1 && (
                  <Dialog open={showUserSearch} onOpenChange={setShowUserSearch}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full bg-transparent">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Agregar Miembro
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Buscar Usuario</DialogTitle>
                        <DialogDescription>Busca y agrega miembros a tu equipo</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar por nombre o email..."
                            value={userSearch}
                            onChange={(e) => {
                              setUserSearch(e.target.value)
                              searchUsersHandler(e.target.value)
                            }}
                            className="pl-10"
                          />
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {searchingUsers ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                          ) : searchUsers.length > 0 ? (
                            searchUsers.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted cursor-pointer"
                                onClick={() => addMember(user)}
                              >
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {user.firstName[0]}
                                    {user.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <Button size="sm">
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            userSearch && (
                              <div className="text-center py-4 text-muted-foreground">No se encontraron usuarios</div>
                            )
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          )}

          {/* Información de la Convocatoria */}
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <span>Cierre: {formatDate(call.submissionOpen)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{call.isIndividual ? "Individual" : `${call.minMembers}-${call.maxMembers} miembros`}</span>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button onClick={() => handleSubmit(false)} className="w-full" disabled={submitting}>
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Enviar Proyecto
              </Button>

              <Button variant="outline" onClick={() => handleSubmit(true)} className="w-full" disabled={submitting}>
                <Save className="w-4 h-4 mr-2" />
                Guardar como Borrador
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
