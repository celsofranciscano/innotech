"use client";

import type React from "react";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Plus,
  Eye,
  Edit,
  Users,
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import { formatDate } from "@/utils/date/formatDate";

// Types
interface User {
  PK_user: number;
  FK_privilege: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  tbprivileges: {
    privilege: string;
  };
  lastDevice?: {
    lastOnlineAt: string | null;
    isActiveSession: boolean;
    lastSessionClosedAt: string | null;
  } | null;
  actionHistory?: {
    create: {
      userId: number;
      userRole: string;
      userName: string;
      timestamp: string;
    };
    updates: Array<{
      userId: number;
      userRole: string;
      userName: string;
      timestamp: string;
      changes: Record<string, { old: any; new: any }>;
    }>;
  };
}

interface Privilege {
  PK_privilege: number;
  privilege: string;
  description: string;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  FK_privilege: number | null;
}

// Skeleton Components
const UserTableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="flex items-center space-x-4 p-4 bg-card rounded-lg shadow-sm"
      >
        <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
          <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
        </div>
        <div className="h-6 w-20 bg-muted rounded animate-pulse" />
        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

const StatCardSkeleton = () => (
  <Card className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      <div className="h-4 w-4 bg-muted rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="h-8 bg-muted rounded animate-pulse w-1/3 mb-2" />
      <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
    </CardContent>
  </Card>
);

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);
  const [privilegesLoading, setPrivilegesLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [privilegeFilter, setPrivilegeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    FK_privilege: null,
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/settings/users");
      setUsers(response.data);
    } catch (error) {
      toast.error("Error al cargar usuarios");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch privileges
  const fetchPrivileges = async () => {
    try {
      setPrivilegesLoading(true);
      const response = await axios.get("/api/settings/privileges");
      setPrivileges(response.data);
    } catch (error) {
      toast.error("Error al cargar privilegios");
      console.error("Error fetching privileges:", error);
    } finally {
      setPrivilegesLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPrivileges();
  }, []);

  // Create user
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.FK_privilege
    ) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    try {
      await axios.post("/api/settings/users", formData);
      toast.success("Usuario creado exitosamente");
      setIsCreateModalOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        FK_privilege: null,
      });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al crear usuario");
    }
  };

  // Update user
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        FK_privilege: formData.FK_privilege,
      };

      await axios.patch(
        `/api/settings/users/${selectedUser.PK_user}`,
        updateData
      );
      toast.success("Usuario actualizado exitosamente");
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        FK_privilege: null,
      });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al actualizar usuario");
    }
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      FK_privilege: user.FK_privilege,
    });
    setIsEditModalOpen(true);
  };

  // Open detail modal
  const openDetailModal = async (user: User) => {
    try {
      const response = await axios.get(`/api/settings/users/${user.PK_user}`);
      setSelectedUser(response.data);
      setIsDetailModalOpen(true);
    } catch {
      toast.error("Error al cargar detalles del usuario");
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.tbprivileges.privilege
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesPrivilege =
      privilegeFilter === "all" ||
      user.tbprivileges.privilege === privilegeFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.lastDevice?.isActiveSession) ||
      (statusFilter === "inactive" && !user.lastDevice?.isActiveSession);

    return matchesSearch && matchesPrivilege && matchesStatus;
  });

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter((u) => u.lastDevice?.isActiveSession).length,
    inactive: users.filter((u) => !u.lastDevice?.isActiveSession).length,
    byPrivilege: privileges.reduce((acc, priv) => {
      acc[priv.privilege] = users.filter(
        (u) => u.tbprivileges.privilege === priv.privilege
      ).length;
      return acc;
    }, {} as Record<string, number>),
  };

  // Get privilege badge color
  const getPrivilegeBadgeColor = (privilege: string) => {
    const colors = {
      Superadministrador:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Coordinador:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Supervisor:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Estudiante:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Invitado: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return (
      colors[privilege as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    );
  };

  // Get status badge
  const getStatusBadge = (user: User) => {
    if (user.lastDevice?.isActiveSession) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Activo
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
        Inactivo
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Administración de Usuarios
          </h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios del sistema
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">
                Crear Nuevo Usuario
              </DialogTitle>
              <DialogDescription>
                Completa la información para crear un nuevo usuario
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="Ingresa el nombre"
                    className="shadow-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Ingresa el apellido"
                    className="shadow-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="usuario@ejemplo.com"
                  className="shadow-sm"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Mínimo 8 caracteres"
                  className="shadow-sm"
                />
              </div>
              <div>
                <Label htmlFor="privilege">Privilegio</Label>
                {privilegesLoading ? (
                  <div className="h-10 bg-muted rounded animate-pulse" />
                ) : (
                  <Select
                    value={formData.FK_privilege?.toString() || ""}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        FK_privilege: Number.parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger className="shadow-sm">
                      <SelectValue placeholder="Selecciona un privilegio" />
                    </SelectTrigger>
                    <SelectContent>
                      {privileges.map((privilege) => (
                        <SelectItem
                          key={privilege.PK_privilege}
                          value={privilege.PK_privilege.toString()}
                        >
                          {privilege.privilege}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Crear Usuario
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Usuarios
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  Usuarios registrados
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuarios Activos
                </CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.active}
                </div>
                <p className="text-xs text-muted-foreground">
                  Con sesión activa
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuarios Inactivos
                </CardTitle>
                <UserX className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">
                  {stats.inactive}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sin sesión activa
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Superadministradores
                </CardTitle>
                <Clock className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.byPrivilege["Superadministrador"] || 0}
                </div>
                <p className="text-xs text-muted-foreground">Acceso completo</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, apellido, email o privilegio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {privilegesLoading ? (
                <div className="h-10 w-40 bg-muted rounded animate-pulse" />
              ) : (
                <Select
                  value={privilegeFilter}
                  onValueChange={setPrivilegeFilter}
                >
                  <SelectTrigger className="w-40 shadow-sm">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los privilegios</SelectItem>
                    {privileges.map((privilege) => (
                      <SelectItem
                        key={privilege.PK_privilege}
                        value={privilege.privilege}
                      >
                        {privilege.privilege}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">
            Lista de Usuarios ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <UserTableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Privilegio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.PK_user} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.firstName.charAt(0)}
                              {user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          className={getPrivilegeBadgeColor(
                            user.tbprivileges.privilege
                          )}
                        >
                          {user.tbprivileges.privilege}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell>
                        {user.lastDevice?.lastOnlineAt ? (
                          <div className="text-sm">
                            <div>
                              {formatDate(user.lastDevice.lastOnlineAt)}
                            </div>
                            {user.lastDevice.isActiveSession && (
                              <div className="text-green-600 text-xs">
                                Sesión activa
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Sin datos
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailModal(user)}
                            className="shadow-sm"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(user)}
                            className="shadow-sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron usuarios que coincidan con los filtros
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              Editar Usuario
            </DialogTitle>
            <DialogDescription>
              Modifica la información del usuario seleccionado
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFirstName">Nombre</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="shadow-sm"
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Apellido</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="shadow-sm"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editEmail">Correo Electrónico</Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="shadow-sm"
              />
            </div>
            <div>
              <Label htmlFor="editPrivilege">Privilegio</Label>
              {privilegesLoading ? (
                <div className="h-10 bg-muted rounded animate-pulse" />
              ) : (
                <Select
                  value={formData.FK_privilege?.toString() || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      FK_privilege: Number.parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {privileges.map((privilege) => (
                      <SelectItem
                        key={privilege.PK_privilege}
                        value={privilege.PK_privilege.toString()}
                      >
                        {privilege.privilege}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Actualizar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl shadow-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              Detalles del Usuario
            </DialogTitle>
            <DialogDescription>
              Información completa y historial del usuario
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Nombre Completo
                  </Label>
                  <p className="text-sm font-medium">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Email
                  </Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Privilegio
                  </Label>
                  <Badge
                    className={getPrivilegeBadgeColor(
                      selectedUser.tbprivileges.privilege
                    )}
                  >
                    {selectedUser.tbprivileges.privilege}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Estado
                  </Label>
                  {getStatusBadge(selectedUser)}
                </div>
              </div>

              {/* Device Info */}
              {selectedUser.lastDevice && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Información de Dispositivo
                  </Label>
                  <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                    {selectedUser.lastDevice.lastOnlineAt && (
                      <div className="flex justify-between">
                        <span className="text-sm">Último acceso:</span>
                        <span className="text-sm font-medium">
                          {formatDate(selectedUser.lastDevice.lastOnlineAt)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm">Sesión activa:</span>
                      <span className="text-sm font-medium">
                        {selectedUser.lastDevice.isActiveSession ? "Sí" : "No"}
                      </span>
                    </div>
                    {selectedUser.lastDevice.lastSessionClosedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm">Última sesión cerrada:</span>
                        <span className="text-sm font-medium">
                          {formatDate(
                            selectedUser.lastDevice.lastSessionClosedAt
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Fecha de Creación
                  </Label>
                  <p className="text-sm">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Última Actualización
                  </Label>
                  <p className="text-sm">
                    {formatDate(selectedUser.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Action History */}
              {selectedUser.actionHistory && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Historial de Acciones
                  </Label>

                  {/* Creation */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Creación
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(
                          selectedUser.actionHistory.create.timestamp
                        )}
                      </span>
                    </div>
                    <p className="text-sm">
                      <strong>Creado por:</strong>{" "}
                      {selectedUser.actionHistory.create.userName} (
                      {selectedUser.actionHistory.create.userRole})
                    </p>
                  </div>

                  {/* Updates */}
                  {selectedUser.actionHistory.updates &&
                    selectedUser.actionHistory.updates.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">
                          Actualizaciones (
                          {selectedUser.actionHistory.updates.length})
                        </h4>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                          {selectedUser.actionHistory.updates.map(
                            (update, index) => (
                              <div
                                key={index}
                                className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg shadow-sm"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    Actualización #
                                    {(selectedUser.actionHistory?.updates
                                      ?.length ?? 0) - index}
                                  </Badge>

                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(update.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm mb-2">
                                  <strong>Actualizado por:</strong>{" "}
                                  {update.userName} ({update.userRole})
                                </p>
                                <div className="text-xs space-y-1">
                                  {Object.entries(update.changes).map(
                                    ([field, change]) => (
                                      <div
                                        key={field}
                                        className="flex justify-between"
                                      >
                                        <span className="font-medium">
                                          {field}:
                                        </span>
                                        <span>
                                          <span className="text-red-600 line-through">
                                            {String(change.old)}
                                          </span>
                                          {" → "}
                                          <span className="text-green-600">
                                            {String(change.new)}
                                          </span>
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
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
