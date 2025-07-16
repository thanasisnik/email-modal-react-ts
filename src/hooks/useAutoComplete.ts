import {useEffect, useState} from "react";
import {getUsers, type User} from "../api/users.ts";


export function useAutoComplete(input: string) {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [filtered, setFiltered] = useState<User[]>([]);

    // Χρήση της useEffect χωρίς dependencies. Μας επιτρέπει όταν ανοίγουμε τη σελίδα να τρέξουμε αυτό το effect όπου θα καλέσει την getUsers
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