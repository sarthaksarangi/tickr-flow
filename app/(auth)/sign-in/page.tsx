'use client'
import React from 'react'
import InputField from "@/components/forms/InputField";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import FooterLink from "@/components/forms/FooterLink";
import {signInWithEmail} from "@/lib/actions/auth.actions";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

const SignIn = () => {
    const router = useRouter()
    const {
        register,
        handleSubmit,

        formState: {errors, isSubmitting}
    } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: ''
        },
        mode: 'onBlur',
    });
    const onSubmit = async (data: SignInFormData) => {
        try {
            // console.log(data);
            const result = await signInWithEmail(data);
            if (result?.success) {
                router.push('/');
            } else {
                console.log(result)
                toast.error('Sign in failed', {
                    description: result?.error
                })
            }
        } catch (e) {
            console.error(e);
            toast.error('Sign in failed', {
                description: e instanceof Error ? e.message : 'Failed to sign in.'
            })
        }
    }
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <h1 className='form-title'>
                    Log in to your Account </h1>
                <InputField name={'email'}
                            label={'Email'}
                            register={register}
                            placeholder="contact@sarthaksarangi.com"
                            error={errors.email}
                            validation={{
                                required: 'Email is required',
                                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: 'Email address is required'
                            }}
                />
                <InputField name={'password'}
                            label={'Password'}
                            placeholder={'Enter a strong password'}
                            register={register}
                            error={errors.password}
                            validation={{
                                required: 'Password is required',
                                minLength: 8
                            }}
                />
                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? 'Logging in' : 'Log in'}
                </Button>

                <FooterLink text={"Dont have an Account?"} linkText={"Sign up"} href="/sign-up"/>
            </form>

        </div>
    )
}
export default SignIn
