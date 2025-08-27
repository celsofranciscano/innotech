"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  BookOpen,
  Settings,
  Clock,
  UserIcon,
  Star,
  Users,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatDate } from "@/utils/date/formatDate";

interface Call {
  PK_call: number;
  FK_user: number;
  title: string;
  description: string | null;
  note: string | null;
  urlImage: string | null;
  pdfGuidelines: string | null;
  submissionOpen: string;
  submissionClose: string;
  isActive: boolean;
  isIndividual: boolean;
  allowedProjectTypes: string[];
  allowedCategories: string[];
  minTeamMembers: number | null;
  maxTeamMembers: number | null;
  minExperienceLevel: string | null;
  minTechRequirements: string[];
  prizes: string[];
  materia: string;
  semestre: string;
  resultsAnnouncement: string;
  createdAt: string;
  updatedAt: string;
  actionHistory: {
    create: {
      userId: number;
      userRole: string;
      userName: string;
      timestamp: string;
    };
    updates: any[];
  };
}

interface Criteria {
  PK_criteria: number;
  FK_call: number;
  criteria: string;
  description: string | null;
  maxScore: number;
  createdAt: string;
  updatedAt: string;
}

interface Juror {
  PK_assignment: number;
  FK_call: number;
  FK_user: number;
  notes: string | null;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Participant {
  PK_user: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export default function AccountCallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [call, setCall] = useState<Call | null>(null);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [jurors, setJurors] = useState<Juror[]>([]);
  const [participants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [loadingJurors, setLoadingJurors] = useState(false);
  const fetchCall = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/account/calls/${params.PK_call}`);
      setCall(response.data);
    } catch (error) {
      console.error("Error fetching call:", error);
      toast.error("Error al cargar la convocatoria");
      router.push("/account/calls");
    } finally {
      setLoading(false);
    }
  }, [params.PK_call, router]);

  const fetchCriteria = useCallback(async () => {
    try {
      setLoadingCriteria(true);
      const response = await axios.get(
        `/api/account/calls/${params.PK_call}/criteria`
      );
      setCriteria(response.data);
    } catch (error) {
      console.error("Error fetching criteria:", error);
      toast.error("Error al cargar criterios de evaluación");
    } finally {
      setLoadingCriteria(false);
    }
  }, [params.PK_call]);

  const fetchJurors = useCallback(async () => {
    try {
      setLoadingJurors(true);
      const response = await axios.get(
        `/api/account/calls/${params.PK_call}/jurors`
      );
      setJurors(response.data);
    } catch (error) {
      console.error("Error fetching jurors:", error);
      toast.error("Error al cargar jurados");
    } finally {
      setLoadingJurors(false);
    }
  }, [params.PK_call]);

  useEffect(() => {
    if (params.PK_call) {
      fetchCall();
      fetchCriteria();
      fetchJurors();
    }
  }, [params.PK_call, fetchCall, fetchCriteria, fetchJurors]);

  const getStatusBadge = (call: Call) => {
    const now = new Date();
    const openDate = new Date(call.submissionOpen);
    const closeDate = new Date(call.submissionClose);

    if (now < openDate) {
      return <Badge variant="secondary">Próximamente</Badge>;
    } else if (now >= openDate && now <= closeDate) {
      return (
        <Badge variant="default" className="bg-green-500">
          Abierta
        </Badge>
      );
    } else {
      return <Badge variant="destructive">Cerrada</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!call) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{call.title}</h1>
          <p className="text-muted-foreground">
            {call.materia} - {call.semestre}
          </p>
        </div>
        {getStatusBadge(call)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Modalidad</h4>
                  <Badge variant="outline">
                    {call.isIndividual ? "Individual" : "Grupal"}
                  </Badge>
                </div>
                {call.minExperienceLevel && (
                  <div>
                    <h4 className="font-medium mb-2">Nivel Mínimo</h4>
                    <Badge variant="outline">{call.minExperienceLevel}</Badge>
                  </div>
                )}
              </div>

              {(call.minTeamMembers || call.maxTeamMembers) && (
                <div>
                  <h4 className="font-medium mb-2">Tamaño del Equipo</h4>
                  <p className="text-sm text-muted-foreground">
                    {call.minTeamMembers && call.maxTeamMembers
                      ? `Entre ${call.minTeamMembers} y ${call.maxTeamMembers} miembros`
                      : call.minTeamMembers
                      ? `Mínimo ${call.minTeamMembers} miembros`
                      : `Máximo ${call.maxTeamMembers} miembros`}
                  </p>
                </div>
              )}

              {call.description && (
                <div>
                  <h4 className="font-medium mb-2">Descripción</h4>
                  <p className="text-sm text-muted-foreground">
                    {call.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tipos de Proyecto y Categorías */}
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Proyecto y Categorías</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">
                  Tipos de Proyecto Permitidos
                </h4>
                <div className="flex flex-wrap gap-2">
                  {call.allowedProjectTypes.map((type, index) => (
                    <Badge key={index} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Categorías Permitidas</h4>
                <div className="flex flex-wrap gap-2">
                  {call.allowedCategories.map((category, index) => (
                    <Badge key={index} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requisitos Técnicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Requisitos Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {call.minTechRequirements.map((requirement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-primary rounded-full" />
                    <span className="text-sm">{requirement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Premios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Premios y Reconocimientos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {call.prizes.map((prize, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="text-2xl">
                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : "🏆"}
                    </div>
                    <div>
                      <p className="font-medium">
                        {index === 0
                          ? "Primer Lugar"
                          : index === 1
                          ? "Segundo Lugar"
                          : index === 2
                          ? "Tercer Lugar"
                          : `Premio ${index + 1}`}
                      </p>
                      <p className="text-sm text-muted-foreground">{prize}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Criterios de Evaluación
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCriteria ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : criteria.length > 0 ? (
                <div className="space-y-3">
                  {criteria.map((criterion) => (
                    <div
                      key={criterion.PK_criteria}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{criterion.criteria}</h4>
                          {criterion.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {criterion.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">
                          {criterion.maxScore} pts
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay criterios de evaluación definidos</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Jurados Asignados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingJurors ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : jurors.length > 0 ? (
                <div className="space-y-3">
                  {jurors.map((juror) => {
                    const participant = participants.find(
                      (p) => p.PK_user === juror.FK_user
                    );
                    return (
                      <div
                        key={juror.PK_assignment}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {participant
                                ? `${participant.firstName} ${participant.lastName}`
                                : "Usuario no encontrado"}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {participant?.email}
                            </p>
                            {juror.notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                <strong>Notas:</strong> {juror.notes}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Asignado: {formatDate(juror.assignedAt)}
                            </p>
                          </div>
                          <Badge variant="secondary">Jurado</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay jurados asignados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Fechas Importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Fechas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-1">
                  Apertura de Inscripciones
                </h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(call.submissionOpen)}
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-sm mb-1">
                  Cierre de Inscripciones
                </h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(call.submissionClose)}
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-sm mb-1">
                  Anuncio de Resultados
                </h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(call.resultsAnnouncement)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información de Creación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Información de Creación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-1">Creado por</h4>
                <p className="text-sm text-muted-foreground">
                  {call.actionHistory.create.userName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {call.actionHistory.create.userRole}
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-sm mb-1">Fecha de Creación</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(call.createdAt)}
                </p>
              </div>
              {call.updatedAt !== call.createdAt && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm mb-1">
                      Última Actualización
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(call.updatedAt)}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full text-white" asChild>
                <Link href={`/account/calls/${params.PK_call}/project/create`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Proyecto
                </Link>
              </Button>
              {/* <Button variant="outline" className="w-full bg-transparent">
                Descargar Lineamientos
              </Button> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
