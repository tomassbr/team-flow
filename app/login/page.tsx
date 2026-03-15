import { signIn } from "@/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "CredentialsSignin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm">
        <h1 className="mb-6 text-xl font-semibold text-foreground">
          Smart Office Access
        </h1>
        <form
          action={async (formData) => {
            "use server";
            await signIn("credentials", {
              email: formData.get("email") as string,
              password: formData.get("password") as string,
              redirectTo: "/dashboard",
            });
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@admin.com"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Heslo
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          {hasError && (
            <p className="text-sm text-error">Neplatné přihlašovací údaje.</p>
          )}
          <Button type="submit" className="w-full">
            Přihlásit se
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-foreground-muted">
          Demo: admin@admin.com / admin
        </p>
      </Card>
    </div>
  );
}
