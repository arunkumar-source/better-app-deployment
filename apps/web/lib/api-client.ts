import type { paths } from "@repo/shared/types/api";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

const fetchClient = createFetchClient<paths>({
  baseUrl: "https://better-app-deployment-server.vercel.app",
  credentials: "include",
});

export const $api = createClient(fetchClient);
