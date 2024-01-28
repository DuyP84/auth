"use server";

import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { error } from "console";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import {
  generateVerificationToken,
  generateTwoFactorToken,
} from "@/lib/tokens";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "@/lib/mail";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { db } from "@/lib/db";
import { getTwoFactorConfirmationById } from "@/data/two-factor-confirmation";
import { toast } from "sonner";

export const login = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) => {
  console.log(values);
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  // return{success:"Email sent!"};
  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist!" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );
    //send verification token email
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
    return { success: "Confimation Email sent! " };
    // return toast.success("Confimation Email sent!")
  }

  //2FA
  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
        //verify 2FA code
        const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

        if (!twoFactorToken) {
            return {error: "Invalid code"};
        }

        if (twoFactorToken.token !== code)
        {
            return {error: "Invalid code, code sai nhap lai di thg ngu"};
        }

        const hasExpired = new Date(twoFactorToken.expires) < new Date();
        if(hasExpired) {
            return {error: "Code expired!"};
        }

        await db.twoFactorToken.delete({
            where: {id: twoFactorToken.id},
        })

        const existingConfirmation = await getTwoFactorConfirmationById(
            existingUser.id,
        );

        if (existingConfirmation)
        {
            await db.twoFactorConfirmation.delete({
                where: {id: existingConfirmation.id},
            })
        }

        await db.twoFactorConfirmation.create({
            data: {
                userId: existingUser.id,
            }
        })

    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);
      return { twoFactor: true };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl ||  DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            error: "Invalid credentials Thong tin dang nhap khong hop le",
          };
        default:
          return { error: "Sth went wrong!!!" };
      }
    }
    throw error;
  }
};
