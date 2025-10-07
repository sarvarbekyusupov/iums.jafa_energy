import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { LoginDto } from "../../types/auth";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Loader2, Zap } from "lucide-react";

const SignIn = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginDto>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = "Please input your email!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email!";
    }

    if (!formData.password) {
      newErrors.password = "Please input your password!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      navigate("/admin");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 p-4">
      <div className="w-full max-w-[440px]">
        {/* Logo and Title Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
            <Zap className="w-9 h-9 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
            JAFA ENERGY
          </h1>
          <p className="text-base text-gray-600 font-medium">
            Utility Management System
          </p>
        </div>

        {/* Login Card */}
        <Card className="border border-gray-200 shadow-xl bg-white">
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-8 pb-6 px-8 space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-700"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`h-11 text-[15px] border-gray-300 focus-visible:border-green-500 focus-visible:ring-green-500/20 ${
                    errors.email ? "border-red-500 focus-visible:ring-red-500/20" : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 font-medium mt-1.5">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`h-11 text-[15px] border-gray-300 focus-visible:border-green-500 focus-visible:ring-green-500/20 ${
                    errors.password ? "border-red-500 focus-visible:ring-red-500/20" : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 font-medium mt-1.5">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200 mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardContent>

            <CardFooter className="px-8 pb-8 pt-0">
              <div className="w-full text-center">
                <a
                  href="/forgot-password"
                  className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors inline-block hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 JAFA ENERGY. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SignIn;
