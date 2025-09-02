"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Code,
  Calendar,
  Sparkles,
  Zap,
  Globe,
  Star,
  Rocket,
  Send,
} from "lucide-react";
import Link from "next/link";

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
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleProjects, setVisibleProjects] = useState(6);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/landing/projects");
        const data = await response.json();
        // Filter only published projects
        const publishedProjects = data.filter(
          (project: Project) => project.isPublished
        );
        setProjects(publishedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const loadMoreProjects = () => {
    setVisibleProjects((prev) => prev + 6);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="min-h-screen w-full bg-[#0f172a] relative">
        {/* Blue Radial Glow Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `radial-gradient(circle 600px at 50% 50%, rgba(59,130,246,0.3), transparent)`,
          }}
        />

        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 animate-float">
            <Sparkles className="h-8 w-8 text-blue-400/40" />
          </div>
          <div
            className="absolute top-32 right-16 animate-float"
            style={{ animationDelay: "1s" }}
          >
            <Zap className="h-10 w-10 text-cyan-400/50" />
          </div>
          <div
            className="absolute bottom-32 left-20 animate-float"
            style={{ animationDelay: "2s" }}
          >
            <Globe className="h-12 w-12 text-blue-300/30" />
          </div>
          <div
            className="absolute top-1/2 right-20 animate-float"
            style={{ animationDelay: "3s" }}
          >
            <Star className="h-6 w-6 text-indigo-400/40" />
          </div>
          <div
            className="absolute bottom-20 right-32 animate-float"
            style={{ animationDelay: "4s" }}
          >
            <Code className="h-8 w-8 text-blue-500/35" />
          </div>
          <div
            className="absolute top-1/4 left-1/4 animate-float"
            style={{ animationDelay: "5s" }}
          >
            <Rocket className="h-7 w-7 text-purple-400/30" />
          </div>
        </div>

        <section className="relative min-h-screen flex items-center justify-center overflow-hidden z-10">
          <div className="container mx-auto px-4 text-center relative">
            <div className="animate-fade-in-up">
              {/* Brand Logo */}
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-xl opacity-30 animate-pulse-glow"></div>
                  <img
                    src="/logo-upds-innova.png"
                    alt="UPDS Innova Logo"
                    width={140}
                    height={140}
                    className="animate-scale-in relative z-10 drop-shadow-2xl w-15"
                  />
                </div>
              </div>

              <h1 className="text-7xl font-bold  mb-4 text-balance bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
                InnoTech
              </h1>

              <div className="relative mb-8">
                <p className="text-2xl md:text-3xl text-blue-100/90 mb-4 max-w-4xl mx-auto text-pretty font-light leading-relaxed">
                  La plataforma que impulsa y difunde los proyectos tecnológicos
                  más innovadores
                </p>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
              </div>

              <div className="flex justify-center items-center mb-16">
                <Link
                  href={"/auth/login"}
                  className="bg-gradient-to-r flex items-center gap-1 from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white px-12 py-3 text-xl font-semibold shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-500 rounded-2xl border border-white/20 backdrop-blur-sm group"
                >
                  <Send className=" h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  Enviar Mi Proyecto
                </Link>
              </div>

              <div className="flex flex-col items-center animate-bounce-slow">
                <p className="text-blue-200/70 text-sm mb-2 font-light">
                  Descubre proyectos increíbles
                </p>
                <div className="w-6 h-10 border-2 border-blue-300/50 rounded-full flex justify-center">
                  <div className="w-1 h-3 bg-blue-300 rounded-full mt-2 animate-scroll-indicator"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        id="projects"
        className="py-24 bg-gradient-to-b from-slate-50 via-white to-blue-50/30"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-block mb-6">
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 text-sm font-medium rounded-full">
                ✨ Proyectos Destacados
              </Badge>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent mb-8 text-balance">
              Innovación en Acción
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto text-pretty leading-relaxed">
              Descubre las ideas más revolucionarias de nuestra comunidad de
              desarrolladores y emprendedores que están cambiando el mundo
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse border-slate-200 h-96">
                  <div className="h-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-6 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.slice(0, visibleProjects).map((project, index) => (
                  <Card
                    key={project.PK_project}
                    className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-scale-in border-slate-200 hover:border-blue-300 bg-white/90 backdrop-blur-sm hover:bg-white relative overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-transparent to-cyan-50/0 group-hover:from-blue-50/30 group-hover:to-cyan-50/20 transition-all duration-500 pointer-events-none"></div>

                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={
                          project.coverImage ||
                          `/placeholder.svg?height=200&width=400&query=${
                            encodeURIComponent(project.title) ||
                            "/placeholder.svg"
                          }`
                        }
                        alt={project.title}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 left-4">
                        <Badge
                          variant="secondary"
                          className="bg-white/95 text-slate-700 shadow-lg backdrop-blur-sm"
                        >
                          {project.category}
                        </Badge>
                      </div>
                      {project.type && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
                            {project.type}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardHeader className="relative z-10">
                      <CardTitle className="text-xl text-slate-800 group-hover:text-blue-600 transition-colors text-balance font-bold">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="text-slate-600 text-pretty leading-relaxed">
                        {project.shortSummary}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="relative z-10">
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <Calendar className="h-4 w-4" />
                        {new Date(project.createdAt).toLocaleDateString(
                          "es-ES"
                        )}
                      </div>

                      {project.technologies &&
                        project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {project.technologies.slice(0, 3).map((tech, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                              >
                                {tech}
                              </Badge>
                            ))}
                            {project.technologies.length > 3 && (
                              <Badge
                                variant="outline"
                                className="text-xs border-slate-300 text-slate-600"
                              >
                                +{project.technologies.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                      <Link href={`/${project.PK_project}`}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 cursor-pointer hover:from-blue-700 hover:to-cyan-700 text-white group shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 rounded-xl">
                          Ver Proyecto
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {visibleProjects < projects.length && (
                <div className="text-center mt-16">
                  <Button
                    onClick={loadMoreProjects}
                    variant="outline"
                    size="lg"
                    className="border-blue-300 text-blue-600 hover:bg-blue-600 hover:text-white px-10 py-4 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  >
                    Cargar Más Proyectos
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/abstract-tech-pattern-background.png')] opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in-up">
            <div className="inline-block mb-8">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 text-base font-medium rounded-full shadow-lg">
                🚀 ¡Tu momento es ahora!
              </Badge>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 text-balance">
              ¿Tienes una idea innovadora?
            </h2>
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto text-pretty leading-relaxed">
              Únete a la comunidad de InnoTech y comparte tu proyecto con el
              mundo. Cada gran innovación comenzó con una idea valiente.
            </p>

            <div className="flex justify-center">
              <Link
                href={"/auth/login"}
                className="bg-gradient-to-r flex items-center gap-1 from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white px-12 py-3 text-xl font-semibold shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-500 rounded-2xl border border-white/20 backdrop-blur-sm group"
              >
                <Send className=" h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                Enviar Mi Proyecto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-cyan-900/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-lg opacity-30"></div>
                  <img
                    src="/logo-upds-innova.png"
                    alt="UPDS Innova Logo"
                    width={50}
                    height={50}
                    className="relative z-8"
                  />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  InnoTech
                </h3>
              </div>
              <p className="text-slate-300 mb-6 text-pretty leading-relaxed">
                Ecosistema independiente de innovación y tecnología que impulsa
                el futuro
              </p>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Globe className="h-5 w-5 text-cyan-400" />
                Contacto
              </h4>
              <div className="space-y-3 text-slate-300">
                <p className="hover:text-cyan-400 transition-colors cursor-pointer">
                  contacto@innotech.com
                </p>
                <p className="hover:text-cyan-400 transition-colors cursor-pointer">
                  +591 4 123 4567
                </p>
                <p>Cochabamba, Bolivia</p>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-white mb-6">Legal</h4>
              <div className="space-y-3">
                <Link
                  href="/terms"
                  className="text-slate-300 hover:text-cyan-400 transition-colors block"
                >
                  Términos de Uso
                </Link>
                <Link
                  href="/privacy"
                  className="text-slate-300 hover:text-cyan-400 transition-colors block"
                >
                  Política de Privacidad
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/50 mt-12 pt-8 text-center text-slate-400">
            <p>
              © 2024 InnoTech. Todos los derechos reservados. Hecho con ❤️ para
              innovadores.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
