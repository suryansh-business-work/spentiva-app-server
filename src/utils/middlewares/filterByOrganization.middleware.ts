import { NextFunction } from 'express'
import { badRequestResponse, errorResponse } from '../response-object'

export default function filterByOrganizationMiddleware(model: any) {
  return async (req: any, res: any, next: NextFunction) => {
    try {
      // organizationId may come from authenticated req.user, headers or body
      const organizationId = req.user?.organizationId || (req.headers?.organizationid as string) || req.body?.organizationId
      if (!organizationId) {
        return badRequestResponse(res, {}, 'Missing required organizationId')
      }

      const search = req.body?.search || {}
      const sort = req.body?.sort || {}

      const searchQuery = { ...search, organizationId }

      const results = await model.find(searchQuery).sort(sort).exec()

      res.filteredResults = {
        results,
        totalDatacount: Array.isArray(results) ? results.length : 0
      }

      next()
    } catch (e: any) {
      return errorResponse(res, e?.message || e)
    }
  }
}
