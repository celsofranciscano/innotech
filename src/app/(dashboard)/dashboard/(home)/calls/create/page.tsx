"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CalendarIcon,
  FileText,
  Users,
  Settings,
  Award,
  BookOpen,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface FormData {
  title: string;
  description: string;
  pdfGuidelines: string;
  submissionOpen: string;
  submissionClose: string;
  resultsAnnouncement: string;
  isActive: boolean;
  isIndividual: boolean;
  allowedProjectTypes: string[];
  allowedCategories: string[];
  minTeamMembers: number | null;
  maxTeamMembers: number | null;
  minExperienceLevel: string;
  minTechRequirements: string[];
  prizes: string[];
  materia: string;
  semestre: string;
  customProjectType: string;
  customCategory: string;
  customTechRequirement: string;
}

const projectTypes = [
  "Aplicación Web",
  "Aplicación Móvil",
  "Software de Escritorio",
  "Inteligencia Artificial",
  "IoT",
  "Blockchain",
  "Realidad Virtual/Aumentada",
  "Otro",
];

const categories = [
  "Educación",
  "Salud",
  "Finanzas",
  "E-commerce",
  "Entretenimiento",
  "Productividad",
  "Social",
  "Medio Ambiente",
  "Gobierno",
  "Otro",
];

const experienceLevels = ["Principiante", "Intermedio", "Avanzado", "Experto"];

const techRequirements = [
  "Frontend",
  "Backend",
  "Base de Datos",
  "API REST",
  "Autenticación",
  "Responsive Design",
  "Testing",
  "Documentación",
  "Deploy",
  "Otro",
];

const prizePositions = [
  "Primer Lugar",
  "Segundo Lugar",
  "Tercer Lugar",
  "Mención Honorífica",
  "Premio Especial",
];

const semesters = [
  "1er Semestre",
  "2do Semestre",
  "3er Semestre",
  "4to Semestre",
  "5to Semestre",
  "6to Semestre",
  "7mo Semestre",
  "8vo Semestre",
  "9no Semestre",
  "10mo Semestre",
];

export default function CreateCallPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    pdfGuidelines: "",
    submissionOpen: "",
    submissionClose: "",
    resultsAnnouncement: "",
    isActive: true,
    isIndividual: true,
    allowedProjectTypes: [],
    allowedCategories: [],
    minTeamMembers: null,
    maxTeamMembers: null,
    minExperienceLevel: "",
    minTechRequirements: [],
    prizes: [],
    materia: "",
    semestre: "",
    customProjectType: "",
    customCategory: "",
    customTechRequirement: "",
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (
    field: keyof FormData,
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => {
      let finalValue = value;

      if (value === "Otro") {
        if (field === "allowedProjectTypes" && prev.customProjectType.trim()) {
          finalValue = prev.customProjectType.trim();
        } else if (
          field === "allowedCategories" &&
          prev.customCategory.trim()
        ) {
          finalValue = prev.customCategory.trim();
        } else if (
          field === "minTechRequirements" &&
          prev.customTechRequirement.trim()
        ) {
          finalValue = prev.customTechRequirement.trim();
        } else if (checked) {
          return prev;
        }
      }

      return {
        ...prev,
        [field]: checked
          ? [...(prev[field] as string[]), finalValue]
          : (prev[field] as string[]).filter(
              (item) => item !== finalValue && item !== "Otro"
            ),
      };
    });
  };

  const handlePrizeChange = (index: number, value: string) => {
    const newPrizes = [...formData.prizes];
    newPrizes[index] = value;
    setFormData((prev) => ({ ...prev, prizes: newPrizes }));
  };

  const addPrize = () => {
    setFormData((prev) => ({ ...prev, prizes: [...prev.prizes, ""] }));
  };

  const removePrize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("El título es obligatorio");
      return false;
    }
    if (!formData.submissionOpen || !formData.submissionClose) {
      toast.error("Las fechas de apertura y cierre son obligatorias");
      return false;
    }
    if (
      new Date(formData.submissionOpen) >= new Date(formData.submissionClose)
    ) {
      toast.error("La fecha de apertura debe ser anterior al cierre");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
     
      await axios.post("/api/dashboard/calls", {
        ...formData,
        prizes: formData.prizes.filter((prize) => prize.trim() !== ""),
        minTechRequirements:
          formData.minTechRequirements.length > 0
            ? formData.minTechRequirements
            : null,
        allowedProjectTypes:
          formData.allowedProjectTypes.length > 0
            ? formData.allowedProjectTypes
            : null,
        allowedCategories:
          formData.allowedCategories.length > 0
            ? formData.allowedCategories
            : null,
      });

      toast.success("¡Convocatoria creada correctamente!");

      router.push("/dashboard/calls");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Error al crear la convocatoria"
      );
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Crear Nueva Convocatoria</h1>
        <p className="text-muted-foreground">
          Complete los detalles para crear una nueva convocatoria
        </p>
      </div>

      <div className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Detalles principales de la convocatoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ej: Convocatoria de Innovación 2025"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materia">Materia</Label>
                <Input
                  id="materia"
                  value={formData.materia}
                  onChange={(e) => handleInputChange("materia", e.target.value)}
                  placeholder="Ej: Programación Web"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semestre">Semestre</Label>
                <Select
                  value={formData.semestre}
                  onValueChange={(value) =>
                    handleInputChange("semestre", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdfGuidelines">URL de Lineamientos (PDF)</Label>
                <Input
                  id="pdfGuidelines"
                  value={formData.pdfGuidelines}
                  onChange={(e) =>
                    handleInputChange("pdfGuidelines", e.target.value)
                  }
                  placeholder="https://ejemplo.com/lineamientos.pdf"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Descripción detallada de la convocatoria..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Fechas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Fechas Importantes
            </CardTitle>
            <CardDescription>
              Configure las fechas clave de la convocatoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submissionOpen">Fecha de Apertura *</Label>
                <Input
                  id="submissionOpen"
                  type="datetime-local"
                  value={formData.submissionOpen}
                  onChange={(e) =>
                    handleInputChange("submissionOpen", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submissionClose">Fecha de Cierre *</Label>
                <Input
                  id="submissionClose"
                  type="datetime-local"
                  value={formData.submissionClose}
                  onChange={(e) =>
                    handleInputChange("submissionClose", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resultsAnnouncement">
                  Anuncio de Resultados
                </Label>
                <Input
                  id="resultsAnnouncement"
                  type="datetime-local"
                  value={formData.resultsAnnouncement}
                  onChange={(e) =>
                    handleInputChange("resultsAnnouncement", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Participación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Configuración de Participación
            </CardTitle>
            <CardDescription>
              Defina los requisitos de participación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isIndividual"
                checked={formData.isIndividual}
                onCheckedChange={(checked) =>
                  handleInputChange("isIndividual", checked)
                }
              />
              <Label htmlFor="isIndividual">Participación Individual</Label>
            </div>

            {!formData.isIndividual && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minTeamMembers">Mínimo de Miembros</Label>
                  <Input
                    id="minTeamMembers"
                    type="number"
                    min="1"
                    value={formData.minTeamMembers || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "minTeamMembers",
                        e.target.value ? Number.parseInt(e.target.value) : null
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTeamMembers">Máximo de Miembros</Label>
                  <Input
                    id="maxTeamMembers"
                    type="number"
                    min="1"
                    value={formData.maxTeamMembers || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "maxTeamMembers",
                        e.target.value ? Number.parseInt(e.target.value) : null
                      )
                    }
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Nivel de Experiencia Mínimo</Label>
              <Select
                value={formData.minExperienceLevel}
                onValueChange={(value) =>
                  handleInputChange("minExperienceLevel", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nivel" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requisitos del Proyecto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Requisitos del Proyecto
            </CardTitle>
            <CardDescription>
              Especifique los tipos y categorías permitidas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipos de Proyecto Permitidos</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {projectTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`project-${type}`}
                      checked={
                        formData.allowedProjectTypes.includes(type) ||
                        (type === "Otro" &&
                          formData.allowedProjectTypes.includes(
                            formData.customProjectType
                          ))
                      }
                      onChange={(e) =>
                        handleArrayChange(
                          "allowedProjectTypes",
                          type,
                          e.target.checked
                        )
                      }
                      className="rounded"
                    />
                    <Label htmlFor={`project-${type}`} className="text-sm">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.allowedProjectTypes.some(() =>
                projectTypes.includes("Otro")
              ) && (
                <div className="space-y-2">
                  <Label htmlFor="customProjectType">
                    Especificar otro tipo de proyecto
                  </Label>
                  <Input
                    id="customProjectType"
                    value={formData.customProjectType}
                    onChange={(e) =>
                      handleInputChange("customProjectType", e.target.value)
                    }
                    placeholder="Ingrese el tipo de proyecto personalizado"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Categorías Permitidas</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      checked={
                        formData.allowedCategories.includes(category) ||
                        (category === "Otro" &&
                          formData.allowedCategories.includes(
                            formData.customCategory
                          ))
                      }
                      onChange={(e) =>
                        handleArrayChange(
                          "allowedCategories",
                          category,
                          e.target.checked
                        )
                      }
                      className="rounded"
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.allowedCategories.some(() =>
                categories.includes("Otro")
              ) && (
                <div className="space-y-2">
                  <Label htmlFor="customCategory">
                    Especificar otra categoría
                  </Label>
                  <Input
                    id="customCategory"
                    value={formData.customCategory}
                    onChange={(e) =>
                      handleInputChange("customCategory", e.target.value)
                    }
                    placeholder="Ingrese la categoría personalizada"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Requisitos Técnicos Mínimos</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {techRequirements.map((req) => (
                  <div key={req} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`tech-${req}`}
                      checked={
                        formData.minTechRequirements.includes(req) ||
                        (req === "Otro" &&
                          formData.minTechRequirements.includes(
                            formData.customTechRequirement
                          ))
                      }
                      onChange={(e) =>
                        handleArrayChange(
                          "minTechRequirements",
                          req,
                          e.target.checked
                        )
                      }
                      className="rounded"
                    />
                    <Label htmlFor={`tech-${req}`} className="text-sm">
                      {req}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.minTechRequirements.some(() =>
                techRequirements.includes("Otro")
              ) && (
                <div className="space-y-2">
                  <Label htmlFor="customTechRequirement">
                    Especificar otro requisito técnico
                  </Label>
                  <Input
                    id="customTechRequirement"
                    value={formData.customTechRequirement}
                    onChange={(e) =>
                      handleInputChange("customTechRequirement", e.target.value)
                    }
                    placeholder="Ingrese el requisito técnico personalizado"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Premios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Premios y Reconocimientos
            </CardTitle>
            <CardDescription>
              Configure los premios por posición
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.prizes.map((prize, index) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="min-w-[120px]">
                  <Label className="text-sm font-medium">
                    {prizePositions[index] || `Premio ${index + 1}`}:
                  </Label>
                </div>
                <Input
                  value={prize}
                  onChange={(e) => handlePrizeChange(index, e.target.value)}
                  placeholder={`Descripción del ${
                    prizePositions[index]?.toLowerCase() ||
                    `premio ${index + 1}`
                  }`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePrize(index)}
                >
                  Eliminar
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addPrize}>
              Agregar Premio
            </Button>
          </CardContent>
        </Card>

        {/* Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Estado de la Convocatoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange("isActive", checked)
                }
              />
              <Label htmlFor="isActive">Convocatoria Activa</Label>
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button onClick={() => setShowConfirmModal(true)}>
            Crear Convocatoria
          </Button>
        </div>
      </div>

      {/* Modal de Confirmación */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmar Creación de Convocatoria</DialogTitle>
            <DialogDescription>
              Revise los detalles antes de crear la convocatoria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Información Básica</h4>
              <p>
                <strong>Título:</strong> {formData.title}
              </p>
              {formData.materia && (
                <p>
                  <strong>Materia:</strong> {formData.materia}
                </p>
              )}
              {formData.semestre && (
                <p>
                  <strong>Semestre:</strong> {formData.semestre}
                </p>
              )}
              {formData.description && (
                <p>
                  <strong>Descripción:</strong>{" "}
                  {formData.description.substring(0, 100)}...
                </p>
              )}
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold">Fechas</h4>
              <p>
                <strong>Apertura:</strong>{" "}
                {formData.submissionOpen
                  ? format(
                      new Date(formData.submissionOpen),
                      "PPP 'a las' HH:mm",
                      { locale: es }
                    )
                  : "No definida"}
              </p>
              <p>
                <strong>Cierre:</strong>{" "}
                {formData.submissionClose
                  ? format(
                      new Date(formData.submissionClose),
                      "PPP 'a las' HH:mm",
                      { locale: es }
                    )
                  : "No definida"}
              </p>
              {formData.resultsAnnouncement && (
                <p>
                  <strong>Resultados:</strong>{" "}
                  {format(
                    new Date(formData.resultsAnnouncement),
                    "PPP 'a las' HH:mm",
                    { locale: es }
                  )}
                </p>
              )}
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold">Configuración</h4>
              <p>
                <strong>Tipo:</strong>{" "}
                {formData.isIndividual ? "Individual" : "Grupal"}
              </p>
              {!formData.isIndividual && (
                <p>
                  <strong>Miembros:</strong>{" "}
                  {formData.minTeamMembers || "Sin mínimo"} -{" "}
                  {formData.maxTeamMembers || "Sin máximo"}
                </p>
              )}
              <p>
                <strong>Estado:</strong>{" "}
                {formData.isActive ? "Activa" : "Inactiva"}
              </p>
            </div>

            {formData.allowedProjectTypes.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold">Tipos de Proyecto</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.allowedProjectTypes.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {formData.prizes.filter((p) => p.trim()).length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold">Premios</h4>
                  <ul className="list-disc list-inside">
                    {formData.prizes
                      .filter((p) => p.trim())
                      .map((prize, index) => (
                        <li key={index}>{prize}</li>
                      ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Revisar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Creando..." : "Confirmar y Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
