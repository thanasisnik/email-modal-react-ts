import {z} from 'zod';
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {getUsers} from "../api/users.ts";
import type {User} from "../api/users.ts";
import {useState} from "react";
import { CircleX } from 'lucide-react';
import {useAutoComplete} from "../hooks/useAutoComplete.ts";


// Χρησιμοποιούμε zod για να κάνουμε το validation. Πρώτα ορίζουμε το σχήμα.
const formSchema = z.object({
    // Το z.email() του zod αν δεν του περάσουμε regex, το default είναι /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i
    email: z
        .email("Please enter a valid email")
        .optional()
        .or(z.literal("")),
    subject: z
        .string()
        .nonempty("Subject is required."),
    description: z
        .string()
        .nonempty("Description is required.")
        .min(10, "Must be at least 10 characters")
        .max(3000, "You have reached max length"),

})

// Σε έναν τύπο FormValues τραβάμε την πληροφορία από το zod σχήμα. Δηλαδή το infer δημιουργεί αυτόματα τον τύπο του σχήματος.
type FormValues = z.infer<typeof formSchema>;

type Props = {
    onClose?: () => void;
}

type SubmittedData = {
    subject: string;
    description: string;
    recipients: User[];
}

const initValues = {
    email: "",
    subject: "",
    description: "",
}

const FormWithReactHook = ({onClose} : Props) => {
    const [users, setUsers] = useState<User[]>([]) // Το state για τους παραλήπτες
    // const [allUsers, setAllUsers] = useState<User[]>([]) // Το state για να κρατάμε όλους τους χρήστες από το API.
    // const [autoComplete, setAutoComplete] = useState<User[]>([]) // Το state για να διαχειριστούμε το suggestion list όταν ο χρήστης θέλει να εισάγει κάποιον στους παραλήπτες.
    const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null) // Το state για να εκτυπώσουμε το submit.
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const {
        register, // Είναι σαν το name="value"
        handleSubmit,
        formState: {errors},
        setError,
        setValue,
        reset,
        watch, // Παρακολουθεί live το input σαν να έχουμε onChange.
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema), // Δηλώνουμε στον resolver οτι χρησιμοποίησε  για validator το zod schema
        defaultValues: initValues,
    })

    // Με το watch του useForm, μπορούμε να παρακολουθούμε live τις αλλαγές στο πεδίο, σαν να είχαμε onChange.
    const emailInput = watch("email");
    const { autoCompleteUsers } = useAutoComplete(emailInput || "");

    // Χρήση της onSubmit στην handleSubmit() για να ελέγξουμε οτι υπάρχει τουλάχιστον ένας παραλήπτης και να περάσουμε τα data της φόρμας στο submittedData ώστε να τα εμφανίσουμε.
    const onSubmit = (data: FormValues) => {
        if (users.length === 0) {
            setError("email", {message: "Please enter at least a valid email"});
            return;
        }

        setSubmittedData({
            subject: data.subject,
            description: data.description,
            recipients: users
        });

        setUsers([]);
        reset();
    }

    // Χρήση της onClear για να κάνουμε cancel και να καθαρίσουμε όλη την φόρμα.
    const onClear = () => {
        setUsers([]);
        setSubmittedData(null);
        reset();

    }

    // Εισαγωγή όλων των χρηστών στους παραλήπτες με το button enter all.
    const enterAll = () => {
        // Ενεργοποιούμε το loading state για να εμφανιστεί στον χρήστη.
        setIsLoading(true);

        // Καλούμε το API για να πάρουμε τους χρήστες και να τους περάσουμε στο state. Οταν ολοκληρωθεί αλλάζουμε και το state του loading.
        getUsers()
            .then(users => setUsers(users))
            .finally(() => setIsLoading(false));
    }

    // Καθαρισμός του πεδίου με τους παραλήπτες με το button remove all.
    const clearAll = () => {
        setUsers([]);
    };

    // Χρήση της συνάρτησης για να διαχειριστούμε το suggestion list. Δηλαδή να μπορούμε να κλικάρουμε έναν user και αυτός να περνάει στη λίστα παραληπτών.
    const handleAutoComplete = (user: User) => {
        // Αρχικά ελέγχουμε αν υπάρχει ο χρήστης αλλιώς τον προσθέτουμε.
        setUsers(prev => {
            const exists = prev.some(u => u.email === user.email );
            if (exists) return prev;
            return [...prev, user];
        })
        setValue("email", "")
    }

    // Χρήση της συνάρτησης για να διαγράψουμε έναν user απο τη λίστα παραληπτών.
    const onClearOne = (user: User) => {
        setUsers(prev => {
            const exists = prev.some( u => u.email === user.email);
            if (!exists) return prev;

            // Η .filter() επιστρέφει έναν νέο πίνακα που περιέχει ότι πληρεί τη συνθήκη. Δηλαδή ο νέος πίνακας περιλαμβάνει όλα τα email
            // που δεν είναι ίδιο με αυτό που αφαιρούμε
            return prev.filter(u => u.email !== user.email);
        });
    };


    return (
        <>
            <div className="bg-white w-full mx-auto px-4 py-2 overflow-hidden">
                <div className="flex justify-between border-b border-gray-300 pb-2 mb-6">
                    <h1 className=" font-semibold text-2xl text-gray-700 my-4">Email sent Form</h1>
                    {/* Το button για να κλείσουμε το modal. */}
                    <button
                        type="button"
                        className="text-button-blue font-semibold p-2 "
                        onClick={onClose}
                    > Χ </button>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full flex flex-col space-y-6 ">

                    {/* Το πρώτο κομμάτι με τη λίστα παραληπτών*/}
                    <div className="flex flex-col w-full">
                        <h2 className="font-semibold text-gray-700 mb-1">List of recipients</h2>
                        {/* Εδώ έχουμε ενα div για να εμφανίζεται η λίστα παραληπτών*/}
                        <div className="border border-gray-500 rounded-md h-[130px] w-full overflow-auto flex flex-wrap gap-2 py-2 px-1">

                            {/* Εμφανίζει τους χρήστες που έχουν προστεθεί ως παραλήπτες, και κάθε στοιχείο έχει κουμπί για διαγραφή του χρήστη από τη λίστα. */}
                            {users.map(user => (
                                <p key={user.id} className="border-2 border-email-border rounded max-h-10 py-1 px-2 text-sm text-email-blue font-semibold flex items-center">
                                    {user.email}
                                    <button
                                        type="button"
                                        className="text-center ml-1 hover:text-red-700 transition duration-150"
                                        onClick={() => onClearOne(user)}
                                    >
                                        <CircleX size={22}/>
                                    </button>
                                </p>
                            ))}

                        </div>

                        <div className="flex flex-col w-full">
                            {/* Το πεδίο για την αναζήτηση παραλήπτη με βάση το όνομα ή το email */}
                            <input
                                {...register("email")} // name = "email"
                                placeholder="Type name or email"
                                autoComplete="off"
                                className="border border-gray-500 text-gray-900 rounded-md min-h-[40px] px-2 mt-2"
                            />
                            {/* Εμφανίζεται οταν υπάρχει input και ταιριάζει με χρήστες. Με κλικ σε ένα στοιχείο γίνεται προσθήκη στους παραλήπτες. */}
                            {emailInput && autoCompleteUsers.length > 0 && (
                                <ul className="max-w-md max-h-[150px] py-1 px-0.5 overflow-auto scrollbar-hidden" >
                                    {autoCompleteUsers.map(user => (
                                        <li
                                            key={user.id}
                                            onClick={ () => handleAutoComplete(user)}
                                            className="border-b border-white bg-button-blue rounded-md text-white p-2 hover:border hover:border-button-blue hover:bg-white hover:text-button-text-blue
                                            transition duration-300"
                                        >
                                            <span><strong>Name:</strong> {user.name} </span>
                                            <br/>
                                            <span><strong>Email:</strong> {user.email}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Buttons για την προσθήκη όλων των χρηστών με loading state και για τον καθαρισμό της λίστας. */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={enterAll}
                                    disabled={isLoading}
                                    className="bg-button-blue rounded-lg text-white font-semibold text-sm px-3 py-2 hover:scale-105 transition duration-300 cursor-pointer"
                                >
                                    {isLoading? "Loading..." : "ENTER ALL CUSTOMERS"}
                                </button>
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className="border border-button-border-blue rounded-lg text-button-text-blue font-semibold text-sm px-3 py-2 hover:scale-105 transition duration-300 cursor-pointer "
                                >
                                    REMOVE ALL CUSTOMERS
                                </button>
                            </div>

                            {errors.email && (
                                <p className="text-red-500">{errors.email.message}</p>
                            )}
                        </div>



                    </div>

                    {/* Το δεύτερο κομμάτι με το Subject. Είναι required.   */}
                    <div className="flex flex-col">
                        <label className="font-semibold text-gray-800" htmlFor="subject" >Subject <span className="text-red-500 font-semibold">*</span></label>
                        <input
                            {...register("subject")} // name = "subject"
                            placeholder="Type the Subject"
                            className="border border-gray-500 text-gray-900 mt-1 rounded-md min-h-[40px] px-2"
                        />
                        {errors.subject && (
                            <p className="text-red-500">{errors.subject.message}</p>
                        )}
                    </div>

                    {/*  Το τρίτο κομμάτι με το Body. Required με min/max χαρακτήρες.  */}
                    <div className="flex flex-col">
                        <label className="font-semibold text-gray-800" htmlFor="description">Body of text</label>
                        <textarea
                            {...register("description")}
                            placeholder="Type your message"
                            className="border border-gray-500 text-gray-900 mt-1 rounded-md min-h-[120px] px-2"
                        >
                        </textarea>
                        {errors.description && (
                            <p className="text-red-500">{errors.description.message}</p>
                        )}
                    </div>


                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-gray-300 mt-4 pt-4">
                        {/* Button που ακυρώνει, καθαρίζει όλα τα πεδία */}
                        <button
                            type="button"
                            className="border border-button-border-blue rounded-lg text-button-text-blue font-semibold text-sm px-3 py-2 mt-3 hover:scale-105 transition duration-300 cursor-pointer"
                            onClick={onClear}
                        >CANCEL</button>

                        <button
                            className="bg-button-blue rounded-lg text-white font-semibold text-sm px-3 py-2 mt-3 hover:scale-105 transition duration-300 cursor-pointer"
                        >
                            SUBMIT
                        </button>
                    </div>
                </form>

                {/* Εκτυπώνουμε όλα τα στοιχεία μετά το submit για επιβεβαίωση της φόρμας. Fake form submission */}
                {submittedData && (
                    <div>
                        <h2 className="font-bold text-xl mt-6">Submitted Data</h2>
                        <p><strong>Subject:</strong>{submittedData.subject}</p>
                        <p><strong>Description</strong>{submittedData.description}</p>
                        <h3 className="font-bold text-xl mt-2">Recipients:</h3>
                        <ul className="list-disc list-inside text-gray-700">
                            {submittedData.recipients.map((recipient) => (
                                <li key={recipient.id}>{recipient.email}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

        </>
    )
}

export default FormWithReactHook;