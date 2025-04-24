import {z} from "zod"

export const loginSchema = z.object({
    username: z.string()
        .min(6, "Perdoruesi nevojitet"),
    password: z.string()
        .min(1, "Fjalekalimi nevojitet")
        .min(6, "Fjalekalimi duhet te jete me 6 karaktere me se paku")
})

export type LoginFormData = z.infer<typeof loginSchema>