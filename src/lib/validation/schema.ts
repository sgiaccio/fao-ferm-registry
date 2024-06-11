import { z } from "zod";

// creating a schema for strings
export const projectSchema = z.object({
    project: z.object({
        title: z.string(),
    }),
});

// parsing
// projectSchema.parse({ project: { title: 'a' }); // => "tuna"
// projectSchema.parse(12); // => throws ZodError

// // "safe" parsing (doesn't throw error if validation fails)
// projectSchema.safeParse("tuna"); // => { success: true; data: "tuna" }
// projectSchema.safeParse(12); // => { success: false; error: ZodError }


// const result = z
//     .object({
//         name: z.string(),
//     })
//     .safeParse({ name: undefined });






const result = z.object({
    names: z.array(z.object({ name: z.string().min(1, { message: "First Name is required" }) })),
}).safeParse({ names: [{ name: '' }, { name: 'b' }] });


export function validate(data: any) {
    const result = projectSchema.safeParse(data);
    return result;
}
