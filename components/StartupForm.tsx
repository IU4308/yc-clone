"use client"

import { useActionState, useState } from "react"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import MDEditor from "@uiw/react-md-editor"
import { Button } from "./ui/button"
import { Send } from "lucide-react"
import { formSchema } from "@/lib/validation"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createPitch } from "@/lib/actions"

const StartupForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [link, setLink] = useState("")
  const [pitch, setPitch] = useState("")

  const { toast } = useToast()
  const router = useRouter()

  

  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    try {
        const formValues = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            link: formData.get('link') as string,
            pitch,
        };

        
        await formSchema.parseAsync(formValues);

        // console.log(formValues);

        const result = await createPitch(prevState, formData, pitch);

        // console.log(result)

        if (result.status === 'SUCCESS') {
            toast({
                title: "Success",
                description: "Your startup pitch has been created successfully"
            })
            router.push(`/startup/${result._id}`)
        }

        return result

    } catch (error) {
        if (error instanceof z.ZodError) {
            const fieldErrors = error.flatten().fieldErrors;

            setErrors(fieldErrors as unknown as Record<string, string>);

            Object.assign(state, { 
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              category: formData.get('category') as string,
              link: formData.get('link') as string,
            })

            // console.log(state)

            setTitle(state.title)
            setDescription(state.description)
            setCategory(state.category)
            setLink(state.link)

            toast({
                title: 'Error',
                description: "Please check your inputs and try again",
                variant: "destructive",
            })

            return { ...prevState, error: "Validation failed", status: "ERROR"}
        }

        toast({
            title: 'Error',
            description: "An unexpected error has occured",
            variant: "destructive",
        })


        return {
            ...prevState,
            error: 'An unexpected error has occured',
            status: "ERROR",
        }
    }
  }

  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    error: "",
    status: "INITIAL"
  }, 
  );

  // {console.log(state)}
 
  return (
    <form action={formAction} className='startup-form'>
      
      <div>
        <label htmlFor="title" className="startup-form_label">Title</label>
        <Input 
            id="title"
            name="title" 
            className="startup-form_input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Startup Title"    
        />

        {errors.title && <p className="startup-form_error">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="startup-form_label">
            Description
        </label>
        <Textarea 
            id="description"
            name="description" 
            className="startup-form_textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Startup Description"    
        />

        {errors.description && <p className="startup-form_error">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="category" className="startup-form_label">Category</label>
        <Input 
            id="category"
            name="category" 
            className="startup-form_input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            placeholder="Startup Category (Teach, Health...)"    
        />

        {errors.category && <p className="startup-form_error">{errors.category}</p>}
      </div>

      <div>
        <label htmlFor="link" className="startup-form_label">Image URL</label>
        <Input 
            id="link"
            name="link" 
            className="startup-form_input"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
            placeholder="Startup Image URL"    
        />

        {errors.link && <p className="startup-form_error">{errors.link}</p>}
      </div>

      <div data-color-mode='light'>
        <label htmlFor="link" className="startup-form_label">Pitch</label>
        
        <MDEditor 
            value={pitch}
            onChange={(value) => setPitch(value as string)}
            id="pitch"
            preview="edit"
            height={300}
            style={{ borderRadius: 20, overflow: 'hidden'}}
            textareaProps={{
                placeholder: "Briefly describe your idea and what problem it solves",
            }}
            previewOptions={{
                disallowedElements: ["style"],
            }}
        />

        {errors.pitch && <p className="startup-form_error">{errors.pitch}</p>}

        <Button 
            type="submit" 
            className="startup-form_btn text-white mt-8"
            disabled={isPending}    
        >
            {isPending ? "Submitting..." : "Submit Your Pitch"}
            <Send className="size-6 ml-2" />
        </Button>
      </div>
    </form>
  )
}

export default StartupForm
