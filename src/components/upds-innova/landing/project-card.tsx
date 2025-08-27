"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Heart,
  MessageCircle,
  Share2,
  Github,
  ExternalLink,
  Users,
  Calendar,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Send,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ProjectCardProps {
  project: {
    id: number
    title: string
    description: string
    categoryName: string
    team: string
    members: string[]
    image: string
    likes: number
    comments: Array<{
      id: number
      user: string
      avatar: string
      comment: string
      date: string
    }>
    views: number
    date: string
    technologies: string[]
    github: string
    demo: string
    status: string
    impact: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(project.likes)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState(project.comments)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const handleComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        user: "Usuario Actual",
        avatar: "/placeholder.svg?height=32&width=32",
        comment: newComment,
        date: new Date().toLocaleDateString("es-ES"),
      }
      setComments([...comments, comment])
      setNewComment("")
    }
  }

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/proyecto/${project.id}`
    const text = `¡Mira este increíble proyecto: ${project.title}!`

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
        break
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
        break
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)
        break
      case "copy":
        navigator.clipboard.writeText(url)
        break
    }
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={project.image || "/placeholder.svg"}
          alt={project.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-primary/90 text-primary-foreground">{project.categoryName}</Badge>
          <Badge variant="secondary" className="bg-background/90">
            {project.status}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="bg-background/90">
            {project.impact}
          </Badge>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="group-hover:text-primary transition-colors line-clamp-1">{project.title}</CardTitle>
        <CardDescription className="line-clamp-3">{project.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="font-medium">{project.team}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(project.date).toLocaleDateString("es-ES")}</span>
          </div>
        </div>

        {/* Interaction buttons with likes, comments, and share */}
        <div className="flex items-center justify-between py-2 border-y border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center gap-2 ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span className="font-medium">{likes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">{comments.length}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                <Share2 className="h-4 w-4" />
                <span className="font-medium">Compartir</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleShare("facebook")}>
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("twitter")}>
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("linkedin")}>
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("copy")}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar enlace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="space-y-4">
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{comment.user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.user}</span>
                      <span className="text-xs text-muted-foreground">{comment.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.comment}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] resize-none"
              />
              <Button onClick={handleComment} size="sm" className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {project.technologies.slice(0, 3).map((tech, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.technologies.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
            <a href={project.demo} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Demo
            </a>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
            <a href={project.github} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2" />
              Código
            </a>
          </Button>
        </div>

        <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          Ver Detalles
        </Button>
      </CardContent>
    </Card>
  )
}
