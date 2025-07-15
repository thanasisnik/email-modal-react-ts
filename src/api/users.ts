const API_URL: string = import.meta.env.VITE_API_URL;

export type User = {
    id: number;
    name: string;
    email: string;
}


// Η default method αν δε δηλώσουμε στη fetch είναι η get
// Περιμένουμε σαν απάντηση έναν πίνακα από objects
export async function getUsers():Promise<User[]>{
    const res =  await fetch(`${API_URL}`);
    if (!res.ok) throw new Error("Failed to fetch users.");
    console.log(res)
    return await res.json();
}