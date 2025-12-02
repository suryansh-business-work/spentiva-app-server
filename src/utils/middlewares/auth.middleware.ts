import jwt from 'jsonwebtoken'
import { errorResponse, badRequestResponse } from '../response-object'

export const authMiddleware = (req: any, res: any, next: any) => {
  // Support both `authorization` and `token` headers
  const rawToken = (req.headers?.authorization as string) || (req.headers?.token as string)
  // Support organizationId header - headers are lowercased by Node
  const organizationId = (req.headers?.organizationid as string) || (req.headers?.organizationid as string) || (req.headers?.organizationId as unknown as string)

  if (!rawToken) {
    return badRequestResponse(res, {}, 'Token not present in headers')
  }

  const bearerPrefix = 'Bearer '
  const token = rawToken.startsWith(bearerPrefix) ? rawToken.substring(bearerPrefix.length) : rawToken

  jwt.verify(token, 'shhhhh', function (err: any, decoded: any) {
    if (err) {
      return badRequestResponse(res, err, 'Invalid token')
    }

    if (!decoded || !decoded.userId) {
      return badRequestResponse(res, {}, 'Invalid token payload: missing userId')
    }

    // Ensure req.body exists (some requests like GET may not have body)
    if (!req.body) req.body = {}

    // Ensure organizationId present in headers
    if (!organizationId) {
      return badRequestResponse(res, {}, 'Missing required header: organizationId')
    }

    // Attach authenticated user info to request in a safe place
    req.user = req.user || {}
    req.user.userId = decoded.userId
    req.body.userId = decoded.userId
    req.user.organizationId = organizationId

    next()
  })
}
