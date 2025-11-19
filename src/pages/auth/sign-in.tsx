import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../helpers/hooks/useAuth";
import type { LoginDto } from "../../types/auth";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import {
  Loader2,
  Leaf,
  Sun,
  Zap,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import Lottie from "lottie-react";
import greenEnergyAnimation from "../../assets/Green Energy Animation.json";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const lottieRef = useRef<any>(null);
  const [formData, setFormData] = useState<LoginDto>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });

      // Auto-clear message after 10 seconds
      setTimeout(() => setSuccessMessage(""), 10000);
    }
  }, [location, navigate]);

  useEffect(() => {
    if (lottieRef.current) {
      const animation = lottieRef.current;

      // Set up smooth looping
      animation.setSpeed(0.9);

      // Use playSegments with force flag for seamless looping
      animation.playSegments([60, 270], true);
    }
  }, []);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);

      // Allow browser to detect successful login before navigation
      // Redirect to dashboard route which will auto-route based on role
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
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
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Animated background with green energy theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        {/* Decorative circles representing clean energy */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Left side - Animation */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative z-10 p-12">
        <div className="w-full max-w-2xl">
          <Lottie
            lottieRef={lottieRef}
            animationData={greenEnergyAnimation}
            loop={true}
            autoplay={false}
            className="w-full h-full"
            rendererSettings={{
              preserveAspectRatio: "xMidYMid slice",
            }}
          />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative z-10 p-4">
        {/* Login Card */}
        <Card className="border border-green-100 shadow-2xl bg-white/95 backdrop-blur-sm w-full max-w-[440px]">
          <CardHeader className="text-center space-y-4 pb-6">
            {/* Company values icons */}
            <div className="flex items-center justify-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                <Sun className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-teal-500 to-green-600 shadow-md">
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 bg-clip-text text-transparent tracking-tight mb-1.5">
                JAFA ENERGY
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                Utility Management System
              </p>
              <p className="text-xs text-emerald-600 font-medium italic mt-1">
                Powering a Sustainable Future
              </p>
            </div>
          </CardHeader>
          <form
            onSubmit={handleSubmit}
            method="post"
            action="/admin"
            name="login-form"
          >
            <CardContent className="pt-2 pb-6 px-8 space-y-5">
              {/* Success message from activation */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-green-800 font-medium">
                      {successMessage}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSuccessMessage("")}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </div>
              )}

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
                  autoComplete="username email"
                  required
                  className={`h-11 text-[15px] border-gray-300 focus-visible:border-green-500 focus-visible:ring-green-500/20 ${
                    errors.email
                      ? "border-red-500 focus-visible:ring-red-500/20"
                      : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 font-medium mt-1.5">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                    className={`h-11 text-[15px] pr-10 border-gray-300 focus-visible:border-green-500 focus-visible:ring-green-500/20 ${
                      errors.password
                        ? "border-red-500 focus-visible:ring-red-500/20"
                        : ""
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 font-medium mt-1.5">
                    {errors.password}
                  </p>
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
      </div>

      {/* Footer - Centered at bottom */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center">
        <p className="text-center text-sm text-gray-600">
          © 2025 JAFA ENERGY. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SignIn;
