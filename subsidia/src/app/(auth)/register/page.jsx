"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { paths } from "@/lib/paths"
import { config } from "@/lib/config"
import { Check, X, Eye, EyeOff } from "lucide-react"
import { useSession } from "next-auth/react"
import { registerUser } from "@/lib/client/auth"
import { LogoHorizontal } from "@/components/logo/logo-horizontal"

export default function RegisterPage() {
   const router = useRouter()
   const { status } = useSession()
   const [name, setName] = useState("")
   const [email, setEmail] = useState("")
   const [password, setPassword] = useState("")
   const [confirmPassword, setConfirmPassword] = useState("")
   const [showPassword, setShowPassword] = useState(false)
   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState(null)
   const [validationErrors, setValidationErrors] = useState({})
   const [passwordStrength, setPasswordStrength] = useState(0)
   const [strengthText, setStrengthText] = useState("")
   const [strengthColor, setStrengthColor] = useState("red")
   const [passwordCriteria, setPasswordCriteria] = useState({
      length: false,
      lowercase: false,
      uppercase: false,
      special: false
   })

   // Redirect if already logged in
   useEffect(() => {
      if (status === "authenticated") {
         router.push(paths.root)
      }
   }, [status, router])

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

   const validateForm = () => {
      const errors = {}

      if (!name) errors.name = "Il nome è obbligatorio"
      if (!email) errors.email = "L'email è obbligatoria"
      if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Inserisci un'email valida"
      if (!password) errors.password = "La password è obbligatoria"
      if (password !== confirmPassword) errors.confirmPassword = "Le password non coincidono"
      if (!passwordCriteria.length) errors.password = "La password deve essere lunga almeno 8 caratteri"
      if (!passwordCriteria.lowercase) errors.password = "La password deve contenere almeno una lettera minuscola"
      if (!passwordCriteria.uppercase) errors.password = "La password deve contenere almeno una lettera maiuscola"
      if (!passwordCriteria.special) errors.password = "La password deve contenere almeno un numero o un carattere speciale"

      setValidationErrors(errors)
      return Object.keys(errors).length === 0
   }

   const handleSubmit = async (e) => {
      e.preventDefault()

      if (!validateForm()) return

      setLoading(true)
      setError(null)

      try {
         const result = await registerUser(name, email, password)
         if (result.success) {
            router.push(paths.verifyCode(result.type, result.userId))
         } else {
            setError(result.message)
         }
      } catch (err) {
         setError("Si è verificato un errore imprevisto")
         console.error(err)
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
         <Card className="w-full max-w-md">
            <CardHeader>
               <div className="flex justify-center mb-2">
                  <LogoHorizontal />
               </div>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                     <Label htmlFor="name">Nome</Label>
                     <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mario Rossi" />
                     {validationErrors.name && <p className="text-destructive text-sm">{validationErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="email">Email</Label>
                     <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@esempio.com"
                     />
                     {validationErrors.email && <p className="text-destructive text-sm">{validationErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="password">Password</Label>
                     <div className="relative">
                        <Input 
                           id="password" 
                           type={showPassword ? "text" : "password"} 
                           value={password} 
                           onChange={(e) => setPassword(e.target.value)} 
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
                           <p className={`text-sm ${strengthColor === 'green' ? 'text-green-600 dark:text-green-400' : strengthColor === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' : strengthColor === 'orange' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`}>{strengthText}</p>
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
                     {validationErrors.password && <p className="text-destructive text-sm">{validationErrors.password}</p>}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="confirmPassword">Conferma Password</Label>
                     <div className="relative">
                        <Input
                           id="confirmPassword"
                           type={showConfirmPassword ? "text" : "password"}
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
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
                     {validationErrors.confirmPassword && (
                        <p className="text-destructive text-sm">{validationErrors.confirmPassword}</p>
                     )}
                  </div>

                  {error && <p className="text-destructive text-sm">{error}</p>}

                  <Button type="submit" className="w-full" disabled={loading}>
                     {loading ? "Caricamento..." : "Registrati"}
                  </Button>
               </form>
            </CardContent>
            <CardFooter className="flex justify-center">
               <p className="text-sm text-muted-foreground">
                  Hai già un account?{" "}
                  <Link href={paths.login} className="text-primary hover:underline">
                     Accedi
                  </Link>
               </p>
            </CardFooter>
         </Card>
      </div>
   )
}
