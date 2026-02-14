type ConfirmModelProps = {
    open: boolean;
    title?: string;
    message: string;

    confirmText: string;
    cancelText: string;

    onConfirm: () => void;
    onCancel: () => void;
};

const ConfirmModel = ({
    open,
    // title = "Confirm",
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
} : ConfirmModelProps) => {
    if(!open) return null;
    return(
        <>
        <div className="fixed inset-0 flex items-start justify-center pt-40 z-50 bg-[#E4FF30]/10
        "
        onClick={onCancel}
        >
            <div className="bg-[#DDAED3] border-4 p-4 
            w-[80vw] lg:w-1/4 sm:w-[40vw] md:w-[40vw]"
            onClick={(e) => e.stopPropagation()}
            >
                {/* <h3>{title}</h3> */}
                <p className="title-font text-2xl">{message}</p>
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel}
                    className="border-2 p-1 plan-font hover:translate-x-0.5 hover:translate-y-0.5"
                    >{cancelText}</button>
                    <button 
                    className="border-2 p-1 plan-font bg-[#F075AE] hover:translate-x-0.5 hover:translate-y-0.5"
                    onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
        </>
    )
}
export default ConfirmModel