import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import auth from "@/modules/auth/auth.index";
import tasks from "@/modules/tasks/tasks.index";
import index from "@/routes/index.route";

const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
  auth,
  tasks,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;
