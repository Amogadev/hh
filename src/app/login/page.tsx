import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/icons";

export default function LoginPage() {
  const loginImage = PlaceHolderImages.find(
    (image) => image.id === "login-background"
  );

  return (
    <div className="relative w-full h-screen flex items-center justify-center p-4">
      <Image
        src={loginImage?.imageUrl || "/placeholder.svg"}
        alt={loginImage?.description || "Hotel Lobby"}
        data-ai-hint={loginImage?.imageHint}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mx-auto grid gap-6 bg-card p-8 rounded-lg shadow-lg">
          <div className="grid gap-2 text-center">
            <div className="flex items-center justify-center text-2xl font-semibold mb-2">
                <Logo className="h-8 w-8 mr-2" />
                HOTEL
            </div>
            <h1 className="text-3xl font-bold font-headline">Welcome Back</h1>
          </div>
          <LoginForm />
          <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
