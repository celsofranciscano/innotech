"use client";

import type React from "react";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Eye,
  Edit,
  Search,
  FileText,
  Clock,
  CheckCircle,
} from "lucide-react";
import { formatDate } from "@/utils/date/formatDate";

interface StatusChange {
  old: string;
  new: string;
}

interface StatusUpdate {
  userName: string;
  userRole: string;
  timestamp: string;
  changes?: Record<string, StatusChange>;
}

interface StatusActionHistory {
  create?: {
    userName: string;
    userRole: string;
    timestamp: string;
  };
  updates?: StatusUpdate[];
}

interface ProjectStatus {
  PK_status: number;
  status: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  actionHistory?: StatusActionHistory;
}

interface FormData {
  status: string;
  description: string;
}

interface Statistics {
  total: number;
  borrador: number;
  pendiente: number;
  aprobado: number;
}

type StatusVariant = "secondary" | "outline" | "default" | "destructive";

const ALLOWED_STATUS = [
  "Borrador",
  "Pendiente",
  "En Revisión",
  "Aprobado",
  "Rechazado",
] as const;

// Skeleton Components
const StatusCardSkeleton = () => (
  <Card className="shadow-lg">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse mb-1"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
    </CardContent>
  </Card>
);

const StatusTableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
      >
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4 animate-pulse"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function StatusAdministration() {
  const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | null>(
    null
  );
  const [formData, setFormData] = useState<FormData>({
    status: "",
    description: "",
  });

  // Fetch statuses
  const fetchStatuses = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<ProjectStatus[]>(
        "/api/settings/calls/status"
      );
      setStatuses(response.data);
    } catch (error) {
      toast.error("Error al cargar los estados de proyecto");
      console.error("Error fetching statuses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  // Create status
  const handleCreate = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      await axios.post("/api/settings/calls/status", formData);
      toast.success("Estado de proyecto creado exitosamente");
      setIsCreateModalOpen(false);
      setFormData({ status: "", description: "" });
      fetchStatuses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al crear el estado");
    }
  };

  // Update status
  const handleUpdate = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!selectedStatus) return;

    try {
      await axios.patch(
        `/api/settings/calls/status/${selectedStatus.PK_status}`,
        formData
      );
      toast.success("Estado de proyecto actualizado exitosamente");
      setIsEditModalOpen(false);
      setFormData({ status: "", description: "" });
      setSelectedStatus(null);
      fetchStatuses();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Error al actualizar el estado"
      );
    }
  };

  // Open edit modal
  const openEditModal = (status: ProjectStatus): void => {
    setSelectedStatus(status);
    setFormData({
      status: status.status,
      description: status.description || "",
    });
    setIsEditModalOpen(true);
  };

  // Open detail modal
  const openDetailModal = async (status: ProjectStatus): Promise<void> => {
    try {
      const response = await axios.get<{ projectStatus: ProjectStatus }>(
        `/api/settings/calls/status/${status.PK_status}`
      );
      setSelectedStatus(response.data.projectStatus);
      setIsDetailModalOpen(true);
    } catch  {
      toast.error("Error al cargar los detalles del estado");
    }
  };

  // Filter statuses
  const filteredStatuses = statuses.filter(
    (status: ProjectStatus) =>
      status.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (status.description &&
        status.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get status badge variant
  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "Borrador":
        return "secondary";
      case "Pendiente":
        return "outline";
      case "En Revisión":
        return "default";
      case "Aprobado":
        return "default";
      case "Rechazado":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Statistics
  const stats: Statistics = {
    total: statuses.length,
    borrador: statuses.filter((s: ProjectStatus) => s.status === "Borrador")
      .length,
    pendiente: statuses.filter((s: ProjectStatus) => s.status === "Pendiente")
      .length,
    aprobado: statuses.filter((s: ProjectStatus) => s.status === "Aprobado")
      .length,
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            Administración de Estados de Proyecto
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestiona los estados del ciclo de vida de los proyectos
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Estado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-blue-900 dark:text-blue-100">
                Crear Nuevo Estado
              </DialogTitle>
              <DialogDescription>
                Agrega un nuevo estado para el ciclo de vida de los proyectos
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, status: value })
                    }
                    required
                  >
                    <SelectTrigger className="shadow-sm">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALLOWED_STATUS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe el propósito de este estado..."
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="shadow-sm"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Crear Estado
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <StatusCardSkeleton />
            <StatusCardSkeleton />
            <StatusCardSkeleton />
            <StatusCardSkeleton />
          </>
        ) : (
          <>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Estados
                </CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.total}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Estados configurados
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Borradores
                </CardTitle>
                <Edit className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {stats.borrador}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  En edición
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pendientes
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                  {stats.pendiente}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Esperando revisión
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Aprobados
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {stats.aprobado}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Completados
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Search and Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Estados de Proyecto
              </CardTitle>
              <CardDescription>
                Gestiona y configura los estados del ciclo de vida
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar estados..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-10 shadow-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <StatusTableSkeleton />
          ) : (
            <div className="rounded-lg shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                      Estado
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                      Descripción
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                      Fecha Creación
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStatuses.map((status: ProjectStatus) => (
                    <TableRow
                      key={status.PK_status}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {status.PK_status}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusVariant(status.status)}
                          className="shadow-sm"
                        >
                          {status.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={status.description}>
                          {status.description || "Sin descripción"}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {formatDate(status.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailModal(status)}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900 shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(status)}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900 shadow-sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredStatuses.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No se encontraron estados que coincidan con la búsqueda
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-blue-900 dark:text-blue-100">
              Editar Estado
            </DialogTitle>
            <DialogDescription>
              Modifica la información del estado de proyecto
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, status: value })
                  }
                  required
                >
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOWED_STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Describe el propósito de este estado..."
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="shadow-sm"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                Actualizar Estado
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px] shadow-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-900 dark:text-blue-100">
              Detalles del Estado
            </DialogTitle>
            <DialogDescription>
              Información completa y historial del estado de proyecto
            </DialogDescription>
          </DialogHeader>

          {selectedStatus && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    ID
                  </Label>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded shadow-sm">
                    {selectedStatus.PK_status}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Estado
                  </Label>
                  <div className="flex items-center">
                    <Badge
                      variant={getStatusVariant(selectedStatus.status)}
                      className="shadow-sm"
                    >
                      {selectedStatus.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Descripción
                  </Label>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded shadow-sm">
                    {selectedStatus.description || "Sin descripción"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Fecha de Creación
                  </Label>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded shadow-sm">
                    {formatDate(selectedStatus.createdAt)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Última Actualización
                  </Label>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded shadow-sm">
                    {formatDate(selectedStatus.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Action History */}
              {selectedStatus.actionHistory && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Historial de Acciones
                  </h4>

                  {/* Creation */}
                  {selectedStatus.actionHistory.create && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-800 dark:text-green-200">
                          Creación
                        </span>
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <p>
                          <strong>Usuario:</strong>{" "}
                          {selectedStatus.actionHistory.create.userName}
                        </p>
                        <p>
                          <strong>Rol:</strong>{" "}
                          {selectedStatus.actionHistory.create.userRole}
                        </p>
                        <p>
                          <strong>Fecha:</strong>{" "}
                          {formatDate(
                            selectedStatus.actionHistory.create.timestamp
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Updates */}
                  {selectedStatus.actionHistory.updates &&
                    selectedStatus.actionHistory.updates.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-800 dark:text-gray-200">
                          Actualizaciones
                        </h5>
                        {selectedStatus.actionHistory.updates.map(
                          (update: StatusUpdate, index: number) => (
                            <div
                              key={index}
                              className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg shadow-sm"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="font-medium text-blue-800 dark:text-blue-200">
                                  Actualización #
                                  {(selectedStatus.actionHistory?.updates
                                    ?.length ?? 0) - index}
                                </span>
                              </div>
                              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <p>
                                    <strong>Usuario:</strong> {update.userName}
                                  </p>
                                  <p>
                                    <strong>Rol:</strong> {update.userRole}
                                  </p>
                                  <p>
                                    <strong>Fecha:</strong>{" "}
                                    {formatDate(update.timestamp)}
                                  </p>
                                </div>
                                {update.changes && (
                                  <div className="mt-3">
                                    <p className="font-medium mb-2">
                                      Cambios realizados:
                                    </p>
                                    {Object.entries(update.changes).map(
                                      ([field, change]: [
                                        string,
                                        StatusChange
                                      ]) => (
                                        <div
                                          key={field}
                                          className="bg-white dark:bg-gray-800 p-2 rounded shadow-sm"
                                        >
                                          <p className="font-medium capitalize">
                                            {field}:
                                          </p>
                                          <p className="text-red-600 dark:text-red-400 text-xs">
                                            <strong>Anterior:</strong>{" "}
                                            {change.old || "Sin valor"}
                                          </p>
                                          <p className="text-green-600 dark:text-green-400 text-xs">
                                            <strong>Nuevo:</strong>{" "}
                                            {change.new || "Sin valor"}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
