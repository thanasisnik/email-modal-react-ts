import {useRef} from "react";
import FormWithReactHook from "./FormWithReactHook.tsx";

const Dialog = () => {

    // Χρήση της useRef για να έχουμε πρόσβαση σε DOM element (dialog). Δεν προκαλεί rendering.
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Συναρτήσεις για το άνοιγμα και το κλείσιμο του modal.
    function openDialog() {
        dialogRef.current?.showModal();
    }


    return (
        <>

            <div className="w-full h-full min-h-[95vh] flex flex-col items-center justify-center">
                <dialog ref={dialogRef} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                                 p-5 border border-blue-500 rounded bg-white w-[95vw] max-w-4xl max-h-[90vh] overflow-auto">

                    <FormWithReactHook onClose={() => dialogRef.current?.close()} />
                </dialog>
                <button onClick={openDialog}>Open modal</button>
            </div>


        </>
    )
}

export default Dialog;