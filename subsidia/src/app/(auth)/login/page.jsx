"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn, useSession } from "next-auth/react"
import { paths } from "@/lib/paths"
import { LogoHorizontal } from "@/components/logo/logo-horizontal"
import { oauthProviders } from "@/providers/oauth-providers"

export default function LoginPage() {
  const { data: session, status, loading } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState(null)
  const [loginError, setLoginError] = useState(() => {
    // Get error from URL params if present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      return error ? error : "";
    }
    return "";
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      window.location.href = paths.dashboard
    }
  }, [status, session])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setLoginError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result.error) {
        setLoginError(result.error)
      } else if (result.url) {
        window.location.href = result.url
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProviderSignIn = (providerId) => {
    setLoadingProvider(providerId);
    signIn(providerId);
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-white/[0.03] bg-[length:20px_20px] pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[40%] bg-primary/10 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[40%] bg-primary/10 rounded-full blur-3xl opacity-30"></div>

      <div className="flex flex-col lg:flex-row flex-1 relative z-10">
        {/* Login Form */}
        <div className="w-full flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            <Card className={`shadow-2xl bg-background/80 backdrop-blur-md transition-all ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
              <CardHeader className="space-y-1 pb-4 flex flex-col items-center">
                <LogoHorizontal className="h-8" />
              </CardHeader>

              <CardContent className="space-y-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nome@dominio.com"
                      required
                      className="h-11 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-primary/50 bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Link href={paths.forgotPassword} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                        Password dimenticata?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-primary/50 bg-background/50"
                    />
                  </div>

                  {loginError && (
                    <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm animate-shake">
                      {loginError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-lg shadow-md transition-all hover:shadow-lg relative font-medium"
                    disabled={isSubmitting || loading}
                  >
                    <span className={isSubmitting || loading ? "opacity-0" : "opacity-100"}>
                      Accedi
                    </span>
                    {(isSubmitting || loading) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Oppure</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {oauthProviders.map((provider) => (
                      <Button
                        key={provider.id}
                        variant="outline"
                        type="button"
                        className="w-full h-11 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center gap-2 transition-all"
                        onClick={() => handleProviderSignIn(provider.id)}
                        disabled={isSubmitting || loadingProvider !== null}
                      >
                        {loadingProvider === provider.id ? (
                          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            {provider.icon}
                            <span>Continua con {provider.name}</span>
                          </>
                        )}
                      </Button>
                    ))}
                  </div>
                </form>

              </CardContent>

              <CardFooter className="flex flex-col space-y-3 pt-0 pb-6">
                <p className="text-sm text-center text-muted-foreground">
                  Non hai un account?{" "}
                  <Link href={paths.register} className="text-primary font-medium hover:underline transition-colors">
                    Registrati
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}