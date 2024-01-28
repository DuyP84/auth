"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs"
import * as z from 'zod'
import { RegisterSchema } from '@/schemas';
import { error } from 'console';
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    console.log(values);
    const validatedFields = RegisterSchema.safeParse(values);

    if(!validatedFields.success)
    {
        return{error: "Invalid fields!"};
    }
    
    const { email, password, name} = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password,10);

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        return {error: "Email already exist!"}
    }
    await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    const verificationToken = await generateVerificationToken(email)
    //send verification token email
    await sendVerificationEmail(verificationToken.email, verificationToken.token);
    return{success:"Confirmation Email Sent!"};
};