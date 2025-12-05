import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

function LoginScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateIdentifier = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Identifier is required";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      return undefined;
    }

    // Phone number validation
    const phoneRegex = /^\+?\d+$/;
    if (!phoneRegex.test(value)) {
      return "Invalid format. Use email or phone number";
    }

    // Phone with country code
    if (value.startsWith("+")) {
      const countryCodeMatch = value.match(/^\+(\d{1,3})(\d+)$/);
      if (!countryCodeMatch) {
        return "Invalid phone format";
      }

      const [, countryCode, phoneNumber] = countryCodeMatch;
      const validCountryCodes = ["1", "44", "84", "86", "91", "81", "82", "33", "49", "61", "55", "7", "34", "39", "31", "46", "47", "45", "358", "48", "420", "421", "40"];
      
      if (!validCountryCodes.includes(countryCode)) {
        return "Invalid country code";
      }

      if (phoneNumber.length !== 9) {
        return "Phone number must be 9 digits after country code";
      }

      return undefined;
    }

    // Phone without country code
    if (value.startsWith("0")) {
      if (value.length !== 10) {
        return "Phone number starting with 0 must be 10 digits";
      }
      return undefined;
    }

    // Phone without country code, not starting with 0
    if (value.length !== 9) {
      return "Phone number must be 9 digits";
    }

    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return "Password is required";
    }
    if (value.length < 6) {
      return "Password must be at least 6 characters";
    }
    return undefined;
  };

  const handleSubmit = () => {
    const identifierError = validateIdentifier(identifier);
    const passwordError = validatePassword(password);

    if (identifierError || passwordError) {
      setErrors({
        identifier: identifierError,
        password: passwordError,
      });
      return;
    }

    setErrors({});
    setIsLoading(true);

    setTimeout(() => {
      console.log("Login:", { identifier, password });
      setIsLoading(false);
    }, 1500);
  };

  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    if (errors.identifier) {
      setErrors({ ...errors, identifier: undefined });
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors({ ...errors, password: undefined });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  const handleSignupNavigation = () => {
    console.log("Navigate to signup");
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
            <p className="text-sm text-muted-foreground">Yet Another Chatting App</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to continue to your account
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Phone</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="user@example.com or +84912345678"
                value={identifier}
                onChange={(e) => handleIdentifierChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className={errors.identifier ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.identifier && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.identifier}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-primary hover:underline focus:outline-none"
                onClick={() => console.log("Navigate to forgot password")}
              >
                Forgot password?
              </button>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full h-11"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </div>

          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Don't have an account?
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={handleSignupNavigation}
              disabled={isLoading}
            >
              Create Account
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Created by Le Thanh Hieu (waldy-ctt) & Nguyen Phuc Hau (Ng-Behind7)
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;
