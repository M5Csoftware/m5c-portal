import React from 'react';
import { useForm } from 'react-hook-form';


function ChangePassword() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm();

    const onSubmit = (data) => {
        console.log('Password Change Data:', data);
        reset();
    };

    // Watch newPassword to validate confirm password field
    const newPassword = watch('newPassword');

    return (
        <div className="max-w-lg p-4 rounded-md text-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
                <div className="flex flex-col gap-6">
                    <InputField
                        label="Current Password"
                        type="password"
                        name="currentPassword"
                        register={register}
                        validation={{ required: 'Current password is required' }}
                        error={errors.currentPassword}
                    />
                    <InputField
                        label="New Password"
                        type="password"
                        name="newPassword"
                        register={register}
                        validation={{
                            required: 'New password is required',
                            minLength: { value: 6, message: 'Password must be at least 6 characters' },
                        }}
                        error={errors.newPassword}
                    />
                    <InputField
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        register={register}
                        validation={{
                            required: 'Please confirm your password',
                            validate: (value) => value === newPassword || 'Passwords do not match',
                        }}
                        error={errors.confirmPassword}
                    />
                </div>

                <div className="w-full text-right">
                    <button
                        type="submit"
                        className="py-2 px-8 w-fit bg-[var(--primary-color)] ml-3 text-white font-semibold rounded-md"
                    >
                        Change Password
                    </button>
                </div>
            </form>
        </div>
    );
}


// Reusable InputField component
function InputField({ label, type, name, register, validation, error }) {
    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-[1fr_2fr] items-center">
                <label className="block font-semibold text-[#18181B]">{label}</label>
                <input
                    type={type}
                    {...register(name, validation)}
                    className="p-2 rounded-md outline-none border border-[#979797]"
                />
            </div>
            {error && <p className="text-[var(--primary-color)] text-sm text-right">{error.message}</p>}
        </div>
    );
}

export default ChangePassword;
