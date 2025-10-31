import { createAuthClient } from "better-auth/client";
import { twoFactorClient } from "better-auth/client/plugins"; 
export const authClient = createAuthClient({
    plugins: [] 
})
