import { createRouter } from "@/lib/create-app";

import * as handlers from "./handlers";
import * as routes from "./routes";

const router = createRouter()
  // SMS Providers routes
  .openapi(routes.createProvider, handlers.createProvider)
  .openapi(routes.getAllProviders, handlers.getAllProviders)
  .openapi(routes.getProviderById, handlers.getProviderById)
  .openapi(routes.updateProvider, handlers.updateProvider)
  .openapi(routes.deleteProvider, handlers.deleteProvider)

  // User SMS Configurations routes
  .openapi(routes.createUserConfig, handlers.createUserConfig)
  .openapi(routes.getUserConfigs, handlers.getUserConfigs)
  .openapi(routes.updateUserConfig, handlers.updateUserConfig)
  .openapi(routes.deleteUserConfig, handlers.deleteUserConfig)

  // User Default Provider routes
  .openapi(routes.setUserDefaultProvider, handlers.setUserDefaultProvider)
  .openapi(routes.getUserDefaultProvider, handlers.getUserDefaultProvider)
  .openapi(routes.removeUserDefaultProvider, handlers.removeUserDefaultProvider)

  // System Configurations routes
  .openapi(routes.createSystemConfig, handlers.createSystemConfig)
  .openapi(routes.getAllSystemConfigs, handlers.getAllSystemConfigs)
  .openapi(routes.updateSystemConfig, handlers.updateSystemConfig)
  .openapi(routes.deleteSystemConfig, handlers.deleteSystemConfig);

export default router;
