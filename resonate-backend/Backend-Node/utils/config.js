import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@clerk/backend";

export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const getUserId = async (token) => {
    const decoded = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY
    })
    return decoded.sub
}
