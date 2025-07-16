import {useEffect, useState} from "react";
import {getUsers, type User} from "../api/users.ts";


// Custom hook που διαχειρίζεται την λειτουργία του autocomplete - suggestions.
// Παίρνει σαν παράμετρο την τρέχουσα τιμή του input πεδίου (string) και επιστρέφει ένα πίνακα απο χρήστες που ταιριάζουν με το input (filtered)
export function useAutoComplete(input: string) {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [filtered, setFiltered] = useState<User[]>([]);

    // Χρήση της useEffect χωρίς dependencies. Μας επιτρέπει όταν ανοίγουμε τη σελίδα να τρέξουμε μόνο μια φορά αυτό το effect όπου θα καλέσει την getUsers
    // και έπειτα να κάνουμε set το state με τους users για να μπορούμε να κάνουμε το filtering.
    useEffect( () => {
        getUsers()
            .then(setAllUsers)
    }, []);


    // Χρήση της useEffect με dependencies. Τρέχει κάθε φορά που βλέπει αλλαγή στο emailInput, και φιλτράρει με το email ή το name, για να περάσει τους
    // κατάλληλους χρήστες στο suggestion list.
    useEffect( () => {
        const search = input.toLowerCase();
        const filteredUsers = allUsers.filter(
            (user: User) =>
                user.email.toLowerCase().includes(search) ||
                user.name.toLowerCase().includes(search),
        );
        setFiltered(filteredUsers);
    }, [input, allUsers]);

    return {autoCompleteUsers: filtered}



}