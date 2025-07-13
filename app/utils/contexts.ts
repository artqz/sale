import { type AppLoadContext, unstable_createContext } from "react-router";
import type { AuthSession } from "./auth/auth.client";

export const adapterContext = unstable_createContext<AppLoadContext>();
export const authSessionContext = unstable_createContext<AuthSession>();
