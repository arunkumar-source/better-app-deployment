import type { paths } from "@repo/shared/types/api";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

const fetchClient = createFetchClient<paths>({
  baseUrl: "http://localhost:4000",
  credentials: "include",
});

export const $api = createClient(fetchClient);
