"use server";

import { signOut } from "@/auth";
export const logOut =async () => {
    //server stuff...
    await signOut();
}