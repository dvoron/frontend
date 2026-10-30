import { http, HttpResponse } from 'msw'

export const handlers = [
  // Authentication
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      accessToken: 'mock-access-token'
    })
  }),
  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      accessToken: 'mock-access-token'
    })
  }),
  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      accessToken: 'mock-access-token'
    })
  }),
  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 200 })
  }),

  // Forum
  http.get('/api/forum/posts', () => {
    return HttpResponse.json([])
  }),
  http.post('/api/forum/posts', async ({ request }) => {
    const data = (await request.json()) as Record<string, any>
    return HttpResponse.json({
      id: Date.now(),
      author: 'mockuser',
      timestamp: 'Just now',
      comments: [],
      ...data
    })
  }),
  http.post('/api/forum/comments', async ({ request }) => {
    const data = (await request.json()) as Record<string, any>
    return HttpResponse.json({ id: Date.now(), ...data })
  }),
  http.get('/api/forum/users/:userId/posts', () => {
    return HttpResponse.json([])
  }),
  http.get('/api/forum/users/:userId/comments', () => {
    return HttpResponse.json([])
  }),

  // User
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, username: 'mockuser', email: 'mock@example.com' })
  }),
  http.put('/api/users/:id', async ({ request, params }) => {
    const data = (await request.json()) as Record<string, any>
    return HttpResponse.json({ id: params.id, ...data })
  }),
  http.delete('/api/users/:id', () => {
    return new HttpResponse(null, { status: 200 })
  })
]
