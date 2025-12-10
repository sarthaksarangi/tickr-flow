'use client'

import {SubmitHandler, useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import SelectField from "@/components/forms/SelectField";
import {INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS} from "@/lib/Constants";
import {CountrySelectField} from "@/components/forms/CountrySelectField";

const SignUp = () => {

    const {
        register,
        handleSubmit,
        control,
        formState: {errors, isSubmitting}
    } = useForm<SignUpFormData>({
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            country: 'US',
            investmentGoals: 'Growth',
            riskTolerance: 'Medium',
            preferredIndustry: 'Technology'
        },
        mode: 'onBlur'
    });

    const onSubmit = async (data: SignUpFormData) => {
        try {
            console.log(data)
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <>
            <h1 className='form-title'>
                Signup & Personalize
            </h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                <InputField name='fullName'
                            label="Full Name"
                            placeholder="Jhon Doe"
                            register={register}
                            error={errors.fullName}
                            validation={{required: 'Full Name is required', minLength: 5}}
                />

                <InputField name='email'
                            label="Email"
                            placeholder="contact@sarthaksarangi.com"
                            register={register}
                            error={errors.email}
                            validation={{
                                required: 'Email is required',
                                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: 'Email address is required'
                            }}
                />
                <InputField name='password'
                            label="Password"
                            placeholder="Enter a strong password"
                            type='password'
                            register={register}
                            error={errors.password}
                            validation={{required: 'Password is required', minLength: 8}}
                />
                <SelectField name='investmentGoals'
                             label='Investment Goals'
                             placeholder='Select your Investment Goals'
                             options={INVESTMENT_GOALS}
                             control={control}
                             error={errors.investmentGoals}
                             required
                />
                <SelectField name='riskTolerance'
                             label='Risk Tolerance'
                             placeholder='Select your Risk Tolerance'
                             options={RISK_TOLERANCE_OPTIONS}
                             control={control}
                             error={errors.riskTolerance}
                             required
                />
                <SelectField name='preferredIndustry'
                             label='Preffered Industry'
                             placeholder='Select your Preffered Industry'
                             options={PREFERRED_INDUSTRIES}
                             control={control}
                             error={errors.preferredIndustry}
                             required
                />
                <CountrySelectField
                    name='country'
                    label='Country'
                    required
                    control={control}
                    error={errors.country}
                />
                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? 'Creating Account' : 'Start Your Investing Journey'}
                </Button>
            </form>
        </>
    )
}
export default SignUp
