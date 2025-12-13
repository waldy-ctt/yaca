// src/features/auth/signup/signup.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { presence_status, ROUTES } from "@/types";
import { t } from "i18next";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { router } from "@/routes";
import { AuthDto } from "@/types/auth";

function SignupScreen() {
  const { login } = useAuthStore();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    email?: string;
    name?: string;
    password?: string;
    confirmPassword?: string;
    api?: string;
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email";
    return undefined;
  };

  const validateName = (name: string) => {
    if (!name?.trim()) return "Name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    return undefined;
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return undefined;
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "text-destructive" };
    if (strength <= 3) return { strength, label: "Fair", color: "text-yellow-500" };
    if (strength <= 4) return { strength, label: "Good", color: "text-blue-500" };
    return { strength, label: "Strong", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async () => {
    const emailError = validateEmail(email);
    const nameError = validateName(name);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    if (emailError || nameError || passwordError || confirmPasswordError) {
      setErrors({
        email: emailError,
        name: nameError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // ✅ Only send email, password, and name (username & tel auto-generated)
      const data: AuthDto = await apiPost<AuthDto>("/users/signup", {
        email,
        password,
        name,
      });

      login(
        {
          avatar: data.user?.avatar ?? null,
          bio: data.user?.bio ?? "",
          email: data.user?.email ?? "",
          id: data.user?.id ?? "",
          name: data.user?.name ?? "",
          status: data.user?.status ?? presence_status.ONLINE,
          tel: data.user?.tel ?? "",
          username: data.user?.username ?? "",
        },
        data.token,
      );

      router.navigate({ to: ROUTES.HOME });
    } catch (error: any) {
      setErrors({ api: error.message || "Signup failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors({ ...errors, email: undefined });
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (errors.name) {
      setErrors({ ...errors, name: undefined });
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors({ ...errors, password: undefined });
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors({ ...errors, confirmPassword: undefined });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  const handleLoginNavigation = () => {
    router.navigate({ to: ROUTES.LOGIN });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-24 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20">
            <div className="text-4xl font-bold text-primary">Y</div>
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">YACA</h1>
            <p className="text-sm text-muted-foreground">
              Yet Another Chatting App
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">Create Account</h2>
            <p className="text-sm text-muted-foreground">
              Join us and start chatting today
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onKeyDown={handleKeyPress}
                className={errors.name ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onKeyDown={handleKeyPress}
                className={errors.email ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {password && !errors.password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.strength <= 2
                            ? "bg-destructive"
                            : passwordStrength.strength <= 3
                              ? "bg-yellow-500"
                              : passwordStrength.strength <= 4
                                ? "bg-blue-500"
                                : "bg-green-500"
                        }`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use 6+ characters with mix of letters, numbers & symbols
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {confirmPassword && !errors.confirmPassword && confirmPassword === password && (
                <p className="text-sm text-green-500 flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  Passwords match
                </p>
              )}
              {errors.confirmPassword && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {errors.api && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {errors.api}
              </div>
            )}

            <Button onClick={handleSubmit} className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>

          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={handleLoginNavigation}
              disabled={isLoading}
            >
              Sign In
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {t("create_account_accept_policy")}
        </p>
      </div>
    </div>
  );
}

export default SignupScreen;
