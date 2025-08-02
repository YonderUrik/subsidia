"use client"
import { useState, useEffect } from "react"
import { Loader2, XCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Check, X, Eye, EyeOff } from "lucide-react"
import axios from "axios"
import { paths } from "@/lib/paths"

export default function ResetPasswordPage() {
   const [password, setPassword] = useState("")
   const [confirmPassword, setConfirmPassword] = useState("")
   const [isLoading, setIsLoading] = useState(false)
   const [hasSession, setHasSession] = useState(false)
   const [showPassword, setShowPassword] = useState(false)
   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
   const [passwordStrength, setPasswordStrength] = useState(0)
   const [strengthText, setStrengthText] = useState("")
   const [strengthColor, setStrengthColor] = useState("red")
   const [passwordCriteria, setPasswordCriteria] = useState({
      length: false,
      lowercase: false,
      uppercase: false,
      special: false
   })
   const router = useRouter()

   const searchParams = useSearchParams()
   const token = searchParams.get('token')

   useEffect(() => {
      const checkSession = async () => {
         try {
            const response = await axios.get(`/api/check-code-validity?type=password_reset&token=${token}`)
            const { data } = response
            setHasSession(data?.isValid)
         } catch (error) {
            setHasSession(false)
         }
      }

      checkSession()
   }, [token])

   useEffect(() => {
      if (!password) {
         setPasswordStrength(0)
         setStrengthText("")
         setStrengthColor("red")
         setPasswordCriteria({
            length: false,
            lowercase: false,
            uppercase: false,
            special: false
         })
         return
      }

      // Check password criteria
      const criteria = {
         length: password.length >= 8,
         lowercase: /[a-z]/.test(password),
         uppercase: /[A-Z]/.test(password),
         special: /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      }

      setPasswordCriteria(criteria)

      // Calculate password strength
      let strength = 0

      // Add 25% for each criterion met
      if (criteria.length) strength += 25
      if (criteria.lowercase) strength += 25
      if (criteria.uppercase) strength += 25
      if (criteria.special) strength += 25

      setPasswordStrength(strength)

      // Set text and color based on strength
      if (strength <= 25) {
         setStrengthText("Password debole")
         setStrengthColor("red")
      } else if (strength <= 50) {
         setStrengthText("Password discreta")
         setStrengthColor("orange")
      } else if (strength <= 75) {
         setStrengthText("Password buona")
         setStrengthColor("yellow")
      } else {
         setStrengthText("Password forte")
         setStrengthColor("green")
      }
   }, [password])

   const handleSubmit = async (e) => {
      e.preventDefault()

      if (password !== confirmPassword) {
         toast.error('Le password non coincidono')
         return
      }

      if (password.length < 8) {
         toast.error('La password deve essere lunga almeno 8 caratteri')
         return
      }

      // Check if password meets all criteria
      if (!passwordCriteria.length || !passwordCriteria.lowercase ||
         !passwordCriteria.uppercase || !passwordCriteria.special) {
         toast.error('La password è troppo debole')
         return
      }

      setIsLoading(true)

      try {
         await axios.post('/api/auth/reset-password', { token, password })
         router.push(paths.login)
      } catch (error) {
         toast.error('Si è verificato un errore. Riprova più tardi.')
      } finally {
         setIsLoading(false)
      }
   }

   if (!hasSession) {
      return (
         <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_50%,rgba(var(--primary-rgb),0.12),transparent)]" />
            <Card className="w-full max-w-md shadow-lg border-destructive/20">
               <CardHeader className="space-y-3">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                     <XCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <CardTitle className="text-2xl text-center">
                     Link non valido
                  </CardTitle>
                  <CardDescription className="text-center text-base">
                     Il link per reimpostare la password non è valido o è scaduto. Richiedi un nuovo link.
                  </CardDescription>
               </CardHeader>
            </Card>
         </div>
      )
   }

   return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
         <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_50%,rgba(var(--primary-rgb),0.12),transparent)]" />
         <Card className="w-full max-w-md">
            <CardHeader>
               <CardTitle className="text-2xl">Reimposta Password</CardTitle>
               <CardDescription>Inserisci la tua nuova password</CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                     <Label htmlFor="password">Nuova Password</Label>
                     <div className="relative">
                        <Input
                           id="password"
                           type={showPassword ? "text" : "password"}
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           disabled={isLoading}
                           required
                        />
                        <Button
                           type="button"
                           variant="ghost"
                           size="sm"
                           className="absolute right-0 top-0 h-full px-3"
                           onClick={() => setShowPassword(!showPassword)}
                        >
                           {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                     </div>
                     <div className="mt-2 space-y-3">
                        <div className="space-y-1">
                           <p className={`text-sm text-${strengthColor}-500`}>{strengthText}</p>
                        </div>

                        <div className="space-y-1 text-sm">
                           <div className="flex items-center gap-2">
                              {passwordCriteria.length ? (
                                 <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                 <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                              <span>Almeno 8 caratteri</span>
                           </div>

                           <div className="flex items-center gap-2">
                              {passwordCriteria.lowercase ? (
                                 <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                 <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                              <span>Almeno una lettera minuscola</span>
                           </div>

                           <div className="flex items-center gap-2">
                              {passwordCriteria.uppercase ? (
                                 <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                 <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                              <span>Almeno una lettera maiuscola</span>
                           </div>

                           <div className="flex items-center gap-2">
                              {passwordCriteria.special ? (
                                 <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                 <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                              <span>Almeno un numero o carattere speciale</span>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="confirm-password">Conferma Nuova Password</Label>
                     <div className="relative">
                        <Input
                           id="confirm-password"
                           type={showConfirmPassword ? "text" : "password"}
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           disabled={isLoading}
                           required
                        />
                        <Button
                           type="button"
                           variant="ghost"
                           size="sm"
                           className="absolute right-0 top-0 h-full px-3"
                           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                           {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                     </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                     {isLoading ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Aggiornamento in corso...
                        </>
                     ) : (
                        "Reimposta Password"
                     )}
                  </Button>
               </form>
            </CardContent>
         </Card>
      </div>
   )
}
