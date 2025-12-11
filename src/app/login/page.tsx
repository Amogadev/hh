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
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <Image
          src={loginImage?.imageUrl || "/placeholder.svg"}
          alt={loginImage?.description || "Hotel Lobby"}
          data-ai-hint={loginImage?.imageHint}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-primary/70" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo className="h-8 w-8 mr-2" />
          HotelView
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;The best hotel management platform to streamline your operations and enhance guest experience.&rdquo;
            </p>
            <footer className="text-sm">HotelView Team</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Welcome Back</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>
          <LoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
