import { createRouter } from "@/lib/create-app";

import * as handlers from "./handlers";
import * as routes from "./routes";

const router = createRouter();

router
  .openapi(routes.createNotification, handlers.create)
  .openapi(routes.listNotifications, handlers.list)
  .openapi(routes.markNotificationRead, handlers.markAsRead);

export default router;
