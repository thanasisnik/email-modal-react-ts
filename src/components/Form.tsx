import {z} from 'zod';
import {useState} from "react";


// Χρησιμοποιούμε zod για να κάνουμε το validation. Πρώτα ορίζουμε το σχήμα.
const formSchema = z.object({
    // Το z.email() του zod αν δεν του περάσουμε regex, το default είναι /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i
    email: z.email("Please enter a valid email"),
    subject: z
        .string()
        .nonempty("Subject is required."),
    description: z
        .string()
        .nonempty("Description is required.")
        .min(10, "Must be at least 10 characters"),


})

// Σε έναν τύπο FormValues τραβάμε την πληροφορία από το zod σχήμα. Δηλαδή το infer δημιουργεί αυτόματα τον τύπο του σχήματος.
type FormValues = z.infer<typeof formSchema>;

// Για τα errors φτιάχνουμε έναν νέο τύπο, με τα πεδία του FormValues αλλά optional. Δεν είναι strict (Μπορεί να μην έχουμε κανένα, ένα ή και παραπάνω errors).
type FormErrors = {
    email?: string;
    subject?: string;
    description?: string;
}

const initValues = {
    email: "",
    subject: "",
    description: "",
}

const Form = () => {
    // Χρήση της useState για να αλλάζουμε την τιμή των values. Δηλώνουμε οτι είναι τύπου FormValues και οτι έχουν μια αρχική τιμή όπως δηλώσαμε στο initValues.
    const [values, setValues] = useState<FormValues>(initValues)

    // Χρήση της useState για διαχείριση του submit.
    const [submittedData, setSubmittedData] = useState<FormValues | null>(null)

    // Χρήση της useState για να αλλάζουμε την τιμή των errors. Δηλώνουμε οτι είναι τύπου FormErrors.
    const [errors, setErrors] = useState<FormErrors>({})


    const validateForm = () => {

        // Κάνει parse τα values για να γίνει το validation.
        const result = formSchema.safeParse(values);
        // Το result θα είναι της μορφής (if true {success: true, data: validatedData} else {success:false, error: errors}).

        if (!result.success) {
            const newErrors: FormErrors = {}

            // Ψάχνουμε για κάθε error
            result.error.issues.forEach( (issue) => {
                // Παίρνουμε το πρώτο στοιχείο και μετά περνάμε τα σφάλματα όπου δηλώνουμε το σφάλμα και το message.
                const fieldName = issue.path[0] as keyof FormValues;
                newErrors[fieldName] = issue.message;
            });
            setErrors(newErrors);
            return false;
        }

        setErrors({})
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = validateForm();

        if (isValid) {
            setSubmittedData(values);
            setValues(initValues);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ) => {
        const { name, value } = e.target;
        setValues(
            (prev) => ({ ...prev, [name]: value })
        )
        setErrors(
            (prev) => ({ ...prev, [name]: undefined })
        )
    }

    const handleClear = () => {
        setValues(initValues)
        setErrors({})
        setSubmittedData(null)
    }


    return (
        <>
            <div className="container mx-auto bg-white px-4 py-2">
                <h1 className="border-b border-gray-300 font-semibold text-2xl text-gray-700 my-4">Email sent FormWithReactHook</h1>
                <form onSubmit={handleSubmit} className="min-w-3xl min-h-[70vh] flex flex-col space-y-6 ">
                    {/* Το πρώτο κομμάτι με τη λίστα παραληπτών*/}
                    <div>
                        <h2 className="font-semibold text-gray-700">List of recipients</h2>
                        {/* Εδώ έχουμε ενα div για να εμφανίζεται η λίστα παραληπτών*/}
                        <div className="border border-gray-500 rounded-md min-h-[50px] max-w-3xl flex flex-wrap space-x-4 space-y-2 py-2 px-1">
                            {/* Εδώ θα μπαινουν οι παραλήπτες   */}
                            {/*    mock data*/}
                            <p className="border border-email-border rounded border-2 py-1 px-2 text-email-blue font-semibold">thanasis@outlook.com</p>
                            <p className="border border-email-border rounded border-2 py-1 px-2 text-email-blue font-semibold">thanasisfdfafdaf@outlook.com</p>
                            <p className="border border-email-border rounded border-2 py-1 px-2 text-email-blue font-semibold">thanasisfdfafdaf@outlook.com</p>
                            <p className="border border-email-border rounded border-2 py-1 px-2 text-email-blue font-semibold">thanasisfdfafdaf@outlook.com</p>

                        </div>

                        <div className="flex flex-col">
                            <input type="text" placeholder="Type name or email" name="email" onChange={handleChange} value={values.email}
                                   className="border border-gray-500 text-gray-900 mt-1 rounded-md min-h-[40px] px-2 mt-2"
                            />

                            <div className="space-x-4 flex mt-4">
                                <button className="bg-button-blue rounded-lg text-white font-semibold text-sm px-3 py-2 ">ENTER ALL CUSTOMERS</button>
                                <button className="border border-button-border-blue rounded-lg text-button-text-blue font-semibold text-sm px-3 py-2 ">REMOVE ALL CLIENTS</button>
                            </div>

                            {errors.email && (
                                <p className="text-red-500">{errors.email}</p>
                            )}
                        </div>



                    </div>

                    {/* Το δεύτερο κομμάτι με το ΘΕΜΑ   */}
                    <div className="flex flex-col">
                        <label className="font-semibold text-gray-800" htmlFor="subject" >Subject</label>
                        <input type="text" name="subject" id="subject" placeholder="Type the Subject" onChange={handleChange} value={values.subject}
                               className="border border-gray-500 text-gray-900 mt-1 rounded-md min-h-[40px] px-2"
                        />
                        {errors?.subject && (
                            <p className="text-red-500">{errors.subject}</p>
                        )}
                    </div>

                    {/*  Το τρίτο κομμάτι με το Body  */}
                    <div className="flex flex-col">
                        <label className="font-semibold text-gray-800" htmlFor="description">Body of text</label>
                        <textarea name="description" id="description" placeholder="Type your message" onChange={handleChange} value={values.description}
                                  className="border border-gray-500 text-gray-900 mt-1 rounded-md min-h-[120px] px-2"
                        >
                        </textarea>
                        {errors?.description && (
                            <p className="text-red-500">{errors.description}</p>
                        )}
                    </div>

                    {/* Το τελευταίο κομμάτι με το submit or cancel ( border top)  */}
                    <div className="space-x-4 flex justify-end border-t border-gray-300 mt-4">
                        <button className="border border-button-border-blue rounded-lg text-button-text-blue font-semibold text-sm px-3 py-2 mt-3" onClick={handleClear}>CANCEL</button>
                        <button className="bg-button-blue rounded-lg text-white font-semibold text-sm px-3 py-2 mt-3">SUBMIT</button>
                    </div>
                </form>

                {submittedData && (
                    <div className="mt-6 border-t border-gray-500 pt-4 space-y-2">
                        <h2 className="font-semibold text-gray-800">Data to submit</h2>
                        <p><strong>Email:</strong> {submittedData.email}</p>
                        <p><strong>Subject:</strong> {submittedData.subject}</p>
                        <p><strong>Description:</strong> {submittedData.description}</p>
                    </div>
                )}

            </div>

        </>
    )
}

export default Form;