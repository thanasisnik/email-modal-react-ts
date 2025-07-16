const API_URL: string = import.meta.env.VITE_API_URL;

export type User = {
    id: number;
    name: string;
    email: string;
}


// Η default method αν δε δηλώσουμε στη fetch είναι η get
// Περιμένουμε σαν απάντηση έναν πίνακα από objects
export async function getUsers(): Promise<User[]> {
    try {
        const options = {
            method: "GET",
            headers: {'Content-Type': 'application/json'},
        }
        const res =  await fetch(`${API_URL}`, options);

        // Εδώ είναι μια τεχνητή καθυστέρηση 2 δευτερολεπτων για να εμφανιστεί το loading. (comment out the next line if needed)
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!res.ok) throw new Error("Failed to fetch users.");
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }

}