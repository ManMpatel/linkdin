import { Request, Response, NextFunction } from 'express'

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.isAuthenticated()) {
    next()
    return
  }
  res.status(401).json({
    success: false,
    error: 'Not authenticated — please log in',
  })
}

export default authMiddleware