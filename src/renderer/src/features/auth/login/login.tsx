import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/i18n";
import { useSettingsStore } from "@/stores/settingStore";
import { useAuthStore } from "@/stores/authStore";
import { presence_status, ROUTES } from "@/types";
import { router } from "@/routes";
import { apiPost } from "@/lib/api";

function LoginScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation();
  const { language, setLanguage, theme, setTheme } = useSettingsStore();
  const { login } = useAuthStore();

  const handleSubmit = async () => {
    const data = await apiPost("/users/login", {
      identifier: "clocktoktok@gmail.com",
      password: "Sieunhan1234!",
    });

    console.log("Work a holy shit: ", data);
    if (identifier === "test@gmail.com" && password === "sieunhan1234") {
      // login(
      //   {
      //     avatar: null,
      //     bio: "This is test account",
      //     email: identifier,
      //     id: "123",
      //     name: "Test",
      //     status: presence_status.ONLINE,
      //     tel: "0859853463",
      //     username: "@supertest",
      //   },
      //   "this_is_a_token",
      // );
      console.log("AAA");
      router.navigate({ to: ROUTES.HOME });
    }

    // const identifierError = validateIdentifier(identifier);
    // const passwordError = validatePassword(password);
    //
    // if (identifierError || passwordError) {
    //   setErrors({
    //     identifier: identifierError,
    //     password: passwordError,
    //   });
    //   return;
    // }
    //
    // setErrors({});
    // setIsLoading(true);
    //
    // setTimeout(() => {
    //   console.log("Login:", { identifier, password });
    //   setIsLoading(false);
    // }, 1500);
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
    router.navigate({ to: ROUTES.SIGNUP });
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
            <h2 className="text-2xl font-semibold">{t("welcome_back")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("sign_in_greeting")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="user@example.com"
                value={identifier}
                onChange={(e) => handleIdentifierChange(e.target.value)}
                onKeyDown={handleKeyPress}
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
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("enter_your_password")}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className={
                    errors.password ? "border-destructive pr-10" : "pr-10"
                  }
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
                {t("forgot_password")}
              </button>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full h-11"
              disabled={isLoading}
            >
              {isLoading ? t("login...") : t("login")}
            </Button>
          </div>

          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t("dont_have_account")}
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
              {t("create_account")}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {t("credit")}
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;
