"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { formatDate } from "@/utils/date/formatDate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Star,
  Users,
  Calendar,
  Globe,
  Github,
  Play,
  Tag,
  Award,
  MessageSquare,
  CheckCircle,
  Clock,
} from "lucide-react";

// Types
interface ProjectMember {
  PK_member: number;
  role: string;
  isLeader: boolean;
  tbusers: {
    PK_user: number;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
}

interface EvaluationCriteria {
  PK_criteria: number;
  criteria: string;
  description: string;
  maxScore: number;
}

interface ReviewDetail {
  PK_detail: number;
  FK_criteria: number;
  score: number;
  comments?: string;
  tbevaluationcriteria: EvaluationCriteria;
}

interface Project {
  PK_project: number;
  title: string;
  shortSummary: string;
  problem: string;
  solution?: string;
  coverImage?: string;
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  technologies: string[];
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  tbprojectmembers: ProjectMember[];
  tbreviewdetails: ReviewDetail[];
  tbprojecttypes: {
    type: string;
    description: string;
  };
  tbprojectcategories: {
    category: string;
    description: string;
  };
  tbprojectstatus: {
    status: string;
    description: string;
  };
}

interface Call {
  PK_call: number;
  title: string;
  description?: string;
}

interface ApiResponse {
  call: Call;
  project: Project;
}

interface RatingForm {
  FK_criteria: number;
  score: number;
  comments?: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratings, setRatings] = useState<RatingForm[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const callId = params.PK_call as string;
  const projectId = params.PK_project as string;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/dashboard/calls/${callId}/projects/${projectId}`
        );
        setData(response.data);

        // Asegurar que tbreviewdetails exista
        const reviewDetails: ReviewDetail[] =
          response.data.project.tbreviewdetails ?? [];

        if (reviewDetails.length > 0) {
          // Obtener IDs únicos de criterios como number[]
          const criteriaIds: number[] = Array.from(
            new Set(reviewDetails.map((r) => Number(r.FK_criteria)))
          );

          // Inicializar el formulario de ratings
          const initialRatings: RatingForm[] = criteriaIds.map((id) => ({
            FK_criteria: id,
            score: 0,
            comments: "",
          }));

          setRatings(initialRatings);
        }
      } catch (error: any) {
        console.error("Error fetching project:", error);
        toast.error(
          error.response?.data?.error || "Error al cargar el proyecto"
        );
      } finally {
        setLoading(false);
      }
    };

    if (callId && projectId) {
      fetchProject();
    }
  }, [callId, projectId]);

  // Handle rating submission
  const handleSubmitRating = async () => {
    if (!data) return;

    try {
      setSubmitting(true);
      await axios.post(`/api/dashboard/calls/${callId}/projects/${projectId}`, {
        ratings: ratings.filter((r) => r.score > 0),
      });

      toast.success("Calificación registrada correctamente");
      setIsRatingModalOpen(false);

      // Refresh data
      const response = await axios.get(
        `/api/dashboard/calls/${callId}/projects/${projectId}`
      );
      setData(response.data);
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      toast.error(
        error.response?.data?.error || "Error al registrar calificación"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Update rating score
  const updateRating = (
    criteriaId: number,
    field: "score" | "comments",
    value: number | string
  ) => {
    setRatings((prev) =>
      prev.map((r) =>
        r.FK_criteria === criteriaId ? { ...r, [field]: value } : r
      )
    );
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "borrador":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "en revisión":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "aprobado":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rechazado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Check if already rated

  const isAlreadyRated =
    Array.isArray(data?.project?.tbreviewdetails) &&
    data.project.tbreviewdetails.length > 0;

  // Skeleton components
  const ProjectSkeleton = () => (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <ProjectSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Proyecto no encontrado
          </h2>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const { call, project } = data;
  const totalScore = project.tbreviewdetails.reduce(
    (sum, detail) => sum + detail.score,
    0
  );
  const maxPossibleScore = project.tbreviewdetails.reduce(
    (sum, detail) => sum + detail.tbevaluationcriteria.maxScore,
    0
  );

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {project.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Convocatoria: {call.title}
            </p>
          </div>

          {!isAlreadyRated && (
            <Dialog
              open={isRatingModalOpen}
              onOpenChange={setIsRatingModalOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Star className="h-4 w-4 mr-2" />
                  Calificar Proyecto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Calificar Proyecto: {project.title}</DialogTitle>
                  <DialogDescription>
                    Evalúa el proyecto según los criterios establecidos para
                    esta convocatoria.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {[
                    ...new Set(
                      project.tbreviewdetails.map((r) => r.tbevaluationcriteria)
                    ),
                  ].map((criteria) => (
                    <div key={criteria.PK_criteria} className="space-y-3">
                      <div>
                        <Label className="text-base font-semibold">
                          {criteria.criteria}
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {criteria.description}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Puntuación máxima: {criteria.maxScore}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`score-${criteria.PK_criteria}`}>
                          Puntuación
                        </Label>
                        <Input
                          id={`score-${criteria.PK_criteria}`}
                          type="number"
                          min="0"
                          max={criteria.maxScore}
                          value={
                            ratings.find(
                              (r) => r.FK_criteria === criteria.PK_criteria
                            )?.score || 0
                          }
                          onChange={(e) =>
                            updateRating(
                              criteria.PK_criteria,
                              "score",
                              Number.parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`comments-${criteria.PK_criteria}`}>
                          Comentarios (opcional)
                        </Label>
                        <Textarea
                          id={`comments-${criteria.PK_criteria}`}
                          value={
                            ratings.find(
                              (r) => r.FK_criteria === criteria.PK_criteria
                            )?.comments || ""
                          }
                          onChange={(e) =>
                            updateRating(
                              criteria.PK_criteria,
                              "comments",
                              e.target.value
                            )
                          }
                          placeholder="Escribe tus comentarios sobre este criterio..."
                          className="w-full"
                        />
                      </div>

                      <Separator />
                    </div>
                  ))}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsRatingModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmitRating}
                    disabled={submitting || ratings.every((r) => r.score === 0)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? "Guardando..." : "Guardar Calificación"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Project Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Información del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Resumen
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {project.shortSummary}
                </p>
              </div>

              {project.problem && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Problema
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {project.problem}
                  </p>
                </div>
              )}

              {project.solution && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Solución
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {project.solution}
                  </p>
                </div>
              )}

              {/* Technologies */}
              {project.technologies.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Tecnologías
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {project.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Etiquetas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-3">
                {project.repoUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      Repositorio
                    </a>
                  </Button>
                )}
                {project.demoUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Demo
                    </a>
                  </Button>
                )}
                {project.videoUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={project.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Video
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Equipo de Trabajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.tbprojectmembers.map((member) => (
                  <div
                    key={member.PK_member}
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <Avatar>
                      <AvatarImage
                        src={member.tbusers.profileImage || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {member.tbusers.firstName[0]}
                        {member.tbusers.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {member.tbusers.firstName} {member.tbusers.lastName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {member.tbusers.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={member.isLeader ? "default" : "secondary"}
                        className={member.isLeader ? "bg-blue-600" : ""}
                      >
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Results */}
          {isAlreadyRated && (
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Resultados de Evaluación
                </CardTitle>
                <CardDescription>
                  Puntuación total: {totalScore} / {maxPossibleScore} puntos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.tbreviewdetails.map((detail) => (
                    <div
                      key={detail.PK_detail}
                      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {detail.tbevaluationcriteria.criteria}
                        </h4>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        >
                          {detail.score} /{" "}
                          {detail.tbevaluationcriteria.maxScore}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {detail.tbevaluationcriteria.description}
                      </p>
                      {detail.comments && (
                        <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded border-l-4 border-blue-500">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {detail.comments}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Project Info */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Estado del Proyecto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <Badge
                  className={getStatusColor(project.tbprojectstatus.status)}
                >
                  {project.tbprojectstatus.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {project.tbprojectstatus.description}
              </p>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Tipo:
                  </span>
                  <span className="font-medium">
                    {project.tbprojecttypes.type}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Categoría:
                  </span>
                  <span className="font-medium">
                    {project.tbprojectcategories.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Creado:
                  </span>
                  <span className="font-medium">
                    {formatDate(project.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Actualizado:
                  </span>
                  <span className="font-medium">
                    {formatDate(project.updatedAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Status */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Estado de Calificación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {isAlreadyRated ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 dark:text-green-400 font-medium">
                      Calificado
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                      Pendiente de calificación
                    </span>
                  </>
                )}
              </div>
              {isAlreadyRated && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Puntuación final: {totalScore} / {maxPossibleScore} puntos
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
