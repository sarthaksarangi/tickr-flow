'use client'
import React from 'react'
import InputField from "@/components/forms/InputField";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import FooterLink from "@/components/forms/FooterLink";

const SignIn = () => {

    const {
        register,
        handleSubmit,

        formState: {errors, isSubmitting}
    } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: ''
        }
    });
    const onSubmit = async (data: SignInFormData) => {
        try {
            console.log(data)
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <h1 className='form-title'>
                    Log in to your Account </h1>
                <InputField name={'Email'}
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
                <InputField name={'Password'}
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
