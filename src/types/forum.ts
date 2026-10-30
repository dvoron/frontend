export interface Comment {
  id: number
  author: string
  timestamp: string
  content: string
  replies?: Comment[]
  replyCount?: number
}

export interface Post {
  id: number
  author: string
  timestamp: string
  title: string
  content: string
  comments: Comment[]
  commentCount: number
}

export interface UserPost {
  id: number
  title: string
  content: string
  timestamp: string
}

export interface UserComment {
  id: number
  postTitle: string
  content: string
  timestamp: string
}
