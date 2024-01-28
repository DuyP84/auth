"use client";
import { CardWrapper } from "./card-wrapper";
import { BeatLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/actions/new-verification";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";


export const NewVerificationForm = () => {
    const [error, setError] = useState<string | undefined>()
    const [success, setSuccess] = useState<string | undefined>()

    const searchParams = useSearchParams();

    const token = searchParams.get("token");

    const onSubmmit = useCallback(() => {
        if (success || error ) return;
        if (!token) {
            setError("Missing token!");
            return;
        }
        
        newVerification(token)
        .then((data) => {
            setSuccess(data.success);
            setError(data.error);
        })
        .catch(() => {
            setError("Sth went wrong?")
        })
    }, [token, success, error]);

    useEffect (() => {
        onSubmmit();
    },[onSubmmit]);
    return (
        <CardWrapper headerLabel="Confirm your verification"
        backButtonHref="/auth/login"
        backButtonLabel="Back to login"   
        >
            <div className="flex items-center w-full justify-center">
                {!success && !error &&(
                <BeatLoader /> 
                )}
            <FormSuccess message={success}/>
            {!success && (
                <FormError message={error} /> 
            )}
            </div>

        </CardWrapper>
    )    
}