import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { GlobalContext } from '../portal/GlobalContext';

export default function PasswordSetupModal({ onComplete, onClose }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const { data: session } = useSession();
    const id = session?.user?.id;
    const { server } = useContext(GlobalContext);


    // Password validation
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isPasswordValid = hasMinLength && hasNumber && hasUppercase && hasLowercase && hasSpecialChar;
    const passwordsMatch = password === confirmPassword && confirmPassword !== '';

    const handleSubmit = async () => {
        if (!isPasswordValid || !passwordsMatch) return;

        setIsSubmitting(true);
        setError('');

        try {

            console.log(session);
            console.log(password);

            const id = session?.user?.id;
            if (!id) {
                console.log("User ID missing from session");
                return;
            }

            const response = await axios.put(
                `${server}/portal/auth/register?id=${id}`,
                { password }
            );

            console.log('Password update response:', response.data);
            setSuccess(true);
            setTimeout(() => {
                onComplete();
            }, 1000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Set up Password</h3>
                    </div>

                    {/* Enter Password */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Enter Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${password && !isPasswordValid
                                    ? 'border-red-500'
                                    : 'border-gray-200 focus:border-red-500'
                                    }`}
                                placeholder="Enter password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-gray-100 rounded-lg p-4 mb-5">
                        <p className="text-sm text-gray-600 mb-2">
                            Password must be at least{' '}
                            <span className={`font-semibold ${hasMinLength ? 'text-green-600' : 'text-gray-900'}`}>
                                8 characters
                            </span>{' '}
                            and contain:
                        </p>
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
                            <span className={`font-semibold ${hasNumber ? 'text-green-600' : 'text-gray-900'}`}>1 number</span>,
                            <span className={`font-semibold ${hasUppercase ? 'text-green-600' : 'text-gray-900'}`}>1 uppercase letter</span>,
                            <span className={`font-semibold ${hasLowercase ? 'text-green-600' : 'text-gray-900'}`}>1 lowercase letter</span>,
                            <span className={`font-semibold ${hasSpecialChar ? 'text-green-600' : 'text-gray-900'}`}>1 special character</span>.
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${confirmPassword && !passwordsMatch
                                    ? 'border-red-500'
                                    : 'border-gray-200 focus:border-red-500'
                                    }`}
                                placeholder="Confirm password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <p className="text-red-600 text-sm mb-3">{error}</p>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!isPasswordValid || !passwordsMatch || isSubmitting}
                        className={`w-full py-3.5 rounded-lg font-medium transition-colors ${success
                            ? 'bg-green-600 text-white'
                            : isPasswordValid && passwordsMatch
                                ? 'bg-[#EA2147] text-white hover:bg-red-600'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isSubmitting
                            ? 'Saving...'
                            : success
                                ? 'Password Saved'
                                : 'Set Password'}
                    </button>
                </div>
            </div>
        </div>
    );
}
