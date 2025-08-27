import { Navigation } from "@/components/upds-innova/landing/navigation";
import { Footer } from "@/components/upds-innova/landing/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Lightbulb,
  Rocket,
  Code,
  Smartphone,
  Brain,
  Shield,
  Database,
  Globe,
  ArrowRight,
  Star,
  Eye,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  Universidad Privada Domingo Savio
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold font-space-grotesk leading-tight">
                  UPDS
                  <span className="text-primary block">Innova</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  La plataforma que impulsa y difunde los mejores proyectos
                  innovadores de nuestros estudiantes de Ingeniería de Sistemas.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/proyectos">
                    Explorar Proyectos
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/register">Enviar Proyecto</Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">150+</div>
                  <div className="text-sm text-muted-foreground">Proyectos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">
                    Estudiantes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">25+</div>
                  <div className="text-sm text-muted-foreground">
                    Categorías
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="/upds.jpg"
                  alt="Estudiantes trabajando en proyectos innovadores"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-accent/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-space-grotesk">
              Categorías de Innovación
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre proyectos en diversas áreas tecnológicas desarrollados
              por nuestros talentosos estudiantes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Globe,
                title: "Desarrollo Web",
                count: "45 proyectos",
                color: "text-blue-600",
              },
              {
                icon: Smartphone,
                title: "Apps Móviles",
                count: "32 proyectos",
                color: "text-green-600",
              },
              {
                icon: Brain,
                title: "Inteligencia Artificial",
                count: "28 proyectos",
                color: "text-purple-600",
              },
              {
                icon: Shield,
                title: "Ciberseguridad",
                count: "18 proyectos",
                color: "text-red-600",
              },
              {
                icon: Database,
                title: "Big Data",
                count: "22 proyectos",
                color: "text-orange-600",
              },
              {
                icon: Code,
                title: "APIs y Backend",
                count: "35 proyectos",
                color: "text-indigo-600",
              },
              {
                icon: Rocket,
                title: "IoT",
                count: "15 proyectos",
                color: "text-teal-600",
              },
              {
                icon: Lightbulb,
                title: "Innovación",
                count: "25 proyectos",
                color: "text-yellow-600",
              },
            ].map((category, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <CardContent className="p-6 text-center">
                  <category.icon
                    className={`h-12 w-12 mx-auto mb-4 ${category.color} group-hover:scale-110 transition-transform`}
                  />
                  <h3 className="font-semibold text-lg mb-2">
                    {category.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold font-space-grotesk mb-4">
                Proyectos Destacados
              </h2>
              <p className="text-lg text-muted-foreground">
                Los proyectos más innovadores y con mayor impacto social
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/proyectos">Ver Todos</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "EcoTrack Bolivia",
                description:
                  "Plataforma web para monitoreo ambiental en tiempo real usando IoT y machine learning.",
                category: "IoT + IA",
                team: "Equipo Verde",
                image: "/placeholder.svg?height=200&width=400",
                rating: 4.9,
                views: 1250,
              },
              {
                title: "MediConnect",
                description:
                  "App móvil que conecta pacientes con médicos especialistas en zonas rurales de Bolivia.",
                category: "Salud Digital",
                team: "HealthTech UPDS",
                image: "/placeholder.svg?height=200&width=400",
                rating: 4.8,
                views: 980,
              },
              {
                title: "SmartAgro",
                description:
                  "Sistema de agricultura inteligente con sensores IoT para optimizar cultivos.",
                category: "AgTech",
                team: "Innovadores Rurales",
                image: "/placeholder.svg?height=200&width=400",
                rating: 4.7,
                views: 756,
              },
            ].map((project, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground">
                    {project.category}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span className="font-medium">{project.team}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{project.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{project.views}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                  >
                    Ver Proyecto
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold font-space-grotesk">
              ¿Tienes una idea innovadora?
            </h2>
            <p className="text-xl opacity-90">
              Únete a la comunidad de innovadores de UPDS y comparte tu proyecto
              con el mundo. Recibe feedback de expertos y conecta con
              oportunidades únicas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <Link href="/register" className="flex items-center">
                  Enviar Mi Proyecto
                  <Rocket className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link href="/quienes-somos">Conocer Más</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
