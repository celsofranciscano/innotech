"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Calendar,
  Tag,
  Users,
  Mail,
  Linkedin,
  Globe,
  Target,
  Lightbulb,
  UserCheck,
  LinkIcon,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface User {
  PK_user: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  profession: string;
  specialization: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
}

interface Member {
  PK_member: number;
  role: string;
  isLeader: boolean;
  user: User;
}

interface Project {
  PK_project: number;
  title: string;
  shortSummary: string;
  problem: string;
  solution: string;
  coverImage: string;
  repoUrl: string;
  demoUrl: string;
  videoUrl: string;
  technologies: string[];
  tags: string[];
  createdAt: string;
  isPublished: boolean;
  type: string;
  category: string;
  members: Member[];
}

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(
          `/api/landing/projects/${params.PK_project}`
        );
        if (!response.ok) {
          throw new Error("Proyecto no encontrado");
        }
        const data = await response.json();
        setProject(data);

        // Update page title and meta description
        if (data.title) {
          document.title = `${data.title} - InnoTech`;
          const metaDescription = document.querySelector(
            'meta[name="description"]'
          );
          if (metaDescription) {
            metaDescription.setAttribute(
              "content",
              data.shortSummary || "Proyecto innovador en InnoTech"
            );
          }
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setError("Error al cargar el proyecto");
      } finally {
        setLoading(false);
      }
    };

    if (params.PK_project) {
      fetchProject();
    }
  }, [params.PK_project]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-12 max-w-6xl">
          <div className="animate-pulse space-y-8">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Proyecto no encontrado
          </h1>
          <p className="text-gray-600 mb-8">
            El proyecto que buscas no existe o no está disponible.
          </p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const videoId = project.videoUrl ? getYouTubeVideoId(project.videoUrl) : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <Link href="/">
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Proyectos
          </Button>
        </Link>

        <header className="mb-12">
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge variant="default" className="bg-blue-600 text-white">
              {project.category}
            </Badge>
            {project.type && (
              <Badge
                variant="outline"
                className="border-gray-300 text-gray-700"
              >
                {project.type}
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {project.title}
          </h1>

          <div className="flex items-center gap-6 text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {new Date(project.createdAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            {project.members.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">
                  {project.members.length} miembro
                  {project.members.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

      
        </header>

        {videoId && (
          <section className="mb-12">
            <div className="bg-gray-50 rounded-lg p-6">
         
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={project.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Summary */}
            {project.shortSummary && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Resumen
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {project.shortSummary}
                </p>
              </section>
            )}

            {/* Problem & Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.problem && (
                <section className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-red-600" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Problema
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {project.problem}
                  </p>
                </section>
              )}

              {project.solution && (
                <section className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-green-600" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Solución
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {project.solution}
                  </p>
                </section>
              )}
            </div>

            {project.members.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <UserCheck className="h-5 w-5 text-gray-700" />
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Equipo
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.members.map((member) => (
                    <div
                      key={member.PK_member}
                      className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={
                            member.user.profileImage ||
                            `https://ui-avatars.com/api/?name=${
                              encodeURIComponent(
                                member.user.firstName +
                                  " " +
                                  member.user.lastName
                              ) || "/placeholder.svg"
                            }&background=3b82f6&color=ffffff&size=48`
                          }
                          alt={`${member.user.firstName} ${member.user.lastName}`}
                        />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {member.user.firstName[0]}
                          {member.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {member.user.firstName} {member.user.lastName}
                          </h4>
                          {member.isLeader && (
                            <Badge variant="secondary" className="text-xs">
                              Líder
                            </Badge>
                          )}
                        </div>
                        <p className="text-blue-600 font-medium text-sm mb-1">
                          {member.role}
                        </p>
                        {member.user.profession && (
                          <p className="text-gray-600 text-sm mb-3">
                            {member.user.profession}
                          </p>
                        )}

                        <div className="flex gap-2">
                          {member.user.email && (
                            <a
                              href={`mailto:${member.user.email}`}
                              className="text-gray-500 hover:text-gray-700 p-1"
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                          {member.user.linkedinUrl && (
                            <a
                              href={member.user.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-blue-600 p-1"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                          {member.user.githubUrl && (
                            <a
                              href={member.user.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-gray-900 p-1"
                            >
                              <Github className="h-4 w-4" />
                            </a>
                          )}
                          {member.user.websiteUrl && (
                            <a
                              href={member.user.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-green-600 p-1"
                            >
                              <Globe className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-8">
            {/* Technologies */}
            <section className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="h-5 w-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Tecnologías
                </h3>
              </div>
              {project.technologies && project.technologies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, i) => (
                    <Badge key={i} variant="secondary" className="text-sm">
                      {tech}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No especificadas</p>
              )}

              {project.tags && project.tags.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-gray-700" />
                    <h4 className="font-medium text-gray-900">Etiquetas</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Links */}
            <section className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <LinkIcon className="h-5 w-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Enlaces</h3>
              </div>
              <div className="space-y-3">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver el sistema
                    </Button>
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      Código Fuente
                    </Button>
                  </a>
                )}
                {!project.demoUrl && !project.repoUrl && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay enlaces disponibles
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
