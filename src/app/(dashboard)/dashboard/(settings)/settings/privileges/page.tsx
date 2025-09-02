"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Plus,
  Edit,
  Shield,
  Users,
  Eye,
  Clock,
  User,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/utils/date/formatDate";

interface ActionHistoryItem {
  userId: number;
  userRole: string;
  userName: string;
  timestamp: string;
  changes?: {
    [key: string]: {
      old: string;
      new: string;
    };
  };
}

interface Privilege {
  PK_privilege: number;
  privilege: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  actionHistory?: {
    create: ActionHistoryItem;
    updates: ActionHistoryItem[];
  };
}

const ALLOWED_PRIVILEGES = [
  "Superadministrador",
  "Coordinador",
  "Estudiante",
  "Supervisor",
  "Invitado",
];

const StatsCardsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
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
);

const PrivilegeTableSkeleton = () => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Privilegio</TableHead>
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
              <Skeleton className="h-6 w-20 rounded-full" />
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
);

export default function UserAdministration() {
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPrivilege, setSelectedPrivilege] = useState<Privilege | null>(
    null
  );
  const [detailPrivilege, setDetailPrivilege] = useState<Privilege | null>(
    null
  );
  const [formData, setFormData] = useState({
    privilege: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch all privileges
  const fetchPrivileges = async () => {
    try {
      setLoading(true);
      setStatsLoading(true);
      const response = await axios.get("/api/settings/privileges");
      setPrivileges(response.data);
      setStatsLoading(false);
    } catch (error) {
      toast.error("Error al cargar los privilegios");
      console.error("Error fetching privileges:", error);
      setStatsLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivilegeDetail = async (id: number) => {
    try {
      const response = await axios.get(`/api/settings/privileges/${id}`);
      setDetailPrivilege(response.data.privilege);
      setIsDetailModalOpen(true);
    } catch (error) {
      toast.error("Error al cargar los detalles del privilegio");
      console.error("Error fetching privilege detail:", error);
    }
  };

  // Create new privilege
  const createPrivilege = async () => {
    if (!formData.privilege.trim()) {
      toast.error("El privilegio es obligatorio");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post("/api/settings/privileges", formData);
      toast.success("Privilegio creado exitosamente");
      setIsCreateModalOpen(false);
      setFormData({ privilege: "", description: "" });
      fetchPrivileges();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Error al crear el privilegio"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Update privilege
  const updatePrivilege = async () => {
    if (!selectedPrivilege || !formData.privilege.trim()) {
      toast.error("El privilegio es obligatorio");
      return;
    }

    try {
      setSubmitting(true);
      await axios.patch(
        `/api/settings/privileges/${selectedPrivilege.PK_privilege}`,
        formData
      );
      toast.success("Privilegio actualizado exitosamente");
      setIsEditModalOpen(false);
      setSelectedPrivilege(null);
      setFormData({ privilege: "", description: "" });
      fetchPrivileges();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Error al actualizar el privilegio"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (privilege: Privilege) => {
    setSelectedPrivilege(privilege);
    setFormData({
      privilege: privilege.privilege,
      description: privilege.description || "",
    });
    setIsEditModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({ privilege: "", description: "" });
    setSelectedPrivilege(null);
  };

  // Get privilege badge color
  const getPrivilegeBadgeColor = (privilege: string) => {
    switch (privilege) {
      case "Superadministrador":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Coordinador":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Supervisor":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Estudiante":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Invitado":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  useEffect(() => {
    fetchPrivileges();
  }, []);

  return (
   
      <div className="">
        <div className="container mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shadow-md">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Administración de Privilegios
                </h1>
                <p className="text-muted-foreground">
                  Gestiona los privilegios del sistema
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                    onClick={resetForm}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Privilegio
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Privilegio</DialogTitle>
                    <DialogDescription>
                      Agrega un nuevo privilegio al sistema
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="privilege">Privilegio *</Label>
                      <select
                        id="privilege"
                        className="w-full mt-1 px-3 py-2 bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.privilege}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            privilege: e.target.value,
                          })
                        }
                      >
                        <option value="">Seleccionar privilegio</option>
                        {ALLOWED_PRIVILEGES.map((priv) => (
                          <option key={priv} value={priv}>
                            {priv}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        placeholder="Descripción del privilegio..."
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
                        setIsCreateModalOpen(false);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={createPrivilege}
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {submitting && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Privilegios
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {privileges.length}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Superadministradores
                  </CardTitle>
                  <Shield className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {
                      privileges.filter(
                        (p) => p.privilege === "Superadministrador"
                      ).length
                    }
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Coordinadores
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      privileges.filter((p) => p.privilege === "Coordinador")
                        .length
                    }
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Estudiantes
                  </CardTitle>
                  <Users className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {
                      privileges.filter((p) => p.privilege === "Estudiante")
                        .length
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Privileges Table */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Lista de Privilegios</CardTitle>
              <CardDescription>
                Administra todos los privilegios del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <PrivilegeTableSkeleton />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Privilegio</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Descripción
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Creado
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Actualizado
                        </TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {privileges.map((privilege) => (
                        <TableRow key={privilege.PK_privilege}>
                          <TableCell className="font-medium">
                            {privilege.PK_privilege}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getPrivilegeBadgeColor(
                                privilege.privilege
                              )}
                            >
                              {privilege.privilege}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell max-w-xs truncate">
                            {privilege.description || "Sin descripción"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {formatDate(privilege.createdAt)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {formatDate(privilege.updatedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  fetchPrivilegeDetail(privilege.PK_privilege)
                                }
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(privilege)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {privileges.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No hay privilegios registrados
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
                <DialogTitle>Editar Privilegio</DialogTitle>
                <DialogDescription>
                  Modifica los datos del privilegio seleccionado
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-privilege">Privilegio *</Label>
                  <select
                    id="edit-privilege"
                    className="w-full mt-1 px-3 py-2 bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.privilege}
                    onChange={(e) =>
                      setFormData({ ...formData, privilege: e.target.value })
                    }
                  >
                    <option value="">Seleccionar privilegio</option>
                    {ALLOWED_PRIVILEGES.map((priv) => (
                      <option key={priv} value={priv}>
                        {priv}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-description">Descripción</Label>
                  <Textarea
                    id="edit-description"
                    placeholder="Descripción del privilegio..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-1 shadow-sm"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={updatePrivilege}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Actualizar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Detalles del Privilegio
                </DialogTitle>
                <DialogDescription>
                  Información completa y historial de cambios
                </DialogDescription>
              </DialogHeader>

              {detailPrivilege && (
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
                          <Label className="text-sm font-medium text-muted-foreground">
                            ID
                          </Label>
                          <p className="text-sm font-mono bg-muted px-2 py-1 rounded shadow-sm">
                            {detailPrivilege.PK_privilege}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">
                            Privilegio
                          </Label>
                          <Badge
                            className={getPrivilegeBadgeColor(
                              detailPrivilege.privilege
                            )}
                          >
                            {detailPrivilege.privilege}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Descripción
                        </Label>
                        <p className="text-sm bg-muted px-3 py-2 rounded shadow-sm">
                          {detailPrivilege.description || "Sin descripción"}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">
                            Fecha de Creación
                          </Label>
                          <p className="text-sm bg-muted px-2 py-1 rounded shadow-sm">
                            {formatDate(detailPrivilege.createdAt)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">
                            Última Actualización
                          </Label>
                          <p className="text-sm bg-muted px-2 py-1 rounded shadow-sm">
                            {formatDate(detailPrivilege.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Action History */}
                    {detailPrivilege.actionHistory && (
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
                                {detailPrivilege.actionHistory.create.userName}
                              </div>
                              <div>
                                <span className="font-medium">Rol:</span>{" "}
                                {detailPrivilege.actionHistory.create.userRole}
                              </div>
                              <div className="md:col-span-2">
                                <span className="font-medium">Fecha:</span>{" "}
                                {formatDate(
                                  detailPrivilege.actionHistory.create.timestamp
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Updates */}
                        {detailPrivilege.actionHistory.updates &&
                          detailPrivilege.actionHistory.updates.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                                <Edit className="h-4 w-4" />
                                Actualizaciones (
                                {detailPrivilege.actionHistory.updates.length})
                              </div>
                              <div className="space-y-3">
                                {detailPrivilege.actionHistory.updates.map(
                                  (update, index) => (
                                    <div
                                      key={index}
                                      className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg shadow-sm"
                                    >
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                                        <div>
                                          <span className="font-medium">
                                            Usuario:
                                          </span>{" "}
                                          {update.userName}
                                        </div>
                                        <div>
                                          <span className="font-medium">
                                            Rol:
                                          </span>{" "}
                                          {update.userRole}
                                        </div>
                                        <div className="md:col-span-2">
                                          <span className="font-medium">
                                            Fecha:
                                          </span>{" "}
                                          {formatDate(update.timestamp)}
                                        </div>
                                      </div>
                                      {update.changes && (
                                        <div className="space-y-2">
                                          <div className="text-sm font-medium text-muted-foreground">
                                            Cambios realizados:
                                          </div>
                                          {Object.entries(update.changes).map(
                                            ([field, change]) => (
                                              <div
                                                key={field}
                                                className="bg-background p-2 rounded shadow-sm"
                                              >
                                                <div className="text-xs font-medium text-muted-foreground mb-1">
                                                  Campo: {field}
                                                </div>
                                                <div className="grid grid-cols-1 gap-1 text-xs">
                                                  <div className="text-red-600">
                                                    <span className="font-medium">
                                                      Anterior:
                                                    </span>{" "}
                                                    {change.old || "Vacío"}
                                                  </div>
                                                  <div className="text-green-600">
                                                    <span className="font-medium">
                                                      Nuevo:
                                                    </span>{" "}
                                                    {change.new}
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                )}
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
  
  );
}
