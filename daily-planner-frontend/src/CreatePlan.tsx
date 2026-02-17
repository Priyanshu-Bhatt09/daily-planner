import { useEffect, useRef, useState } from "react";
import { LiaUndoSolid } from "react-icons/lia";
import { LiaRedoSolid } from "react-icons/lia";
import ConfirmModel from "./ConfirmModel";
import { Dropdown } from "./Components/Dropdown";

import { MdOutlineRectangle } from "react-icons/md";
import { PiRectangleDashed } from "react-icons/pi";
import { MdIncompleteCircle } from "react-icons/md";
import { MdDoneOutline } from "react-icons/md";

//priority icons
import { PiCellSignalHigh } from "react-icons/pi";
import { PiCellSignalMedium } from "react-icons/pi";
import { PiCellSignalLow } from "react-icons/pi";
import { PiExclamationMark } from "react-icons/pi";

interface Items {
    id: number;
    title: string;
    plan: string;
    status: string;
    priority: string;
}

interface CreatePlanProps {
    activeItem: Items | null;
    onSave: (plan: Items) => void;
    onClose: () => void;
}

function CreatePlan(
    { onClose, onSave, activeItem }: CreatePlanProps) {

    const BASE_URL = import.meta.env.VITE_API_URL;
    
    useEffect(() => {
        if (activeItem) { //if activeItem is not null, that means we are in editing mode
            setTitle(activeItem.title); //so we set the title of the already existed plan, by using activeItem.title
            setPlan(activeItem.plan); //so we also set the plan of the already exister plan
            setStatus(activeItem.status);
            setPriority(activeItem.priority);
            lastSavedValue.current = activeItem.plan; //it says start tracking changes from here, if we don't include this line then after that if we perform undo it might undo from the previous plans and undo history will get messey.
        } else { //if aciveItem is null then we are creating a brand new plan
            setTitle("");
            setPlan("");
            setStatus("Todo");
            setPriority("High");
            lastSavedValue.current = "";
        }
        setUndoStack([]); //clears undo and redo stack every time we create or edit a
        setRedoStack([]);
    }, [activeItem]);

    //close on escape button
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    const [title, setTitle] = useState<string>("");
    const [plan, setPlan] = useState<string>("");
    const [undoStack, setUndoStack] = useState<string[]>([]);
    const [redoStack, setRedoStack] = useState<string[]>([]);
    const debouncerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedValue = useRef<string>("");

    //this state is for the alert box
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    //this is for dropdown - status
    const [status, setStatus] = useState("");

    //this is for dropdown - priority
    const [priority, setPriority] = useState("");

    //icons
    const statusIcons: Record<string, React.ReactNode> = {
        "Todo": <MdOutlineRectangle className="w-6 h-6" />,
        "Backlog": <PiRectangleDashed className="w-6 h-6" />,
        "In Progress": <MdIncompleteCircle className="w-6 h-6" />,
        "Done": <MdDoneOutline className="w-6 h-6" />
    }

    //priority icons
    const priorityIcons: Record<string, React.ReactNode> = {
        "High": <PiCellSignalHigh className="w-6 h-6" />,
        "Medium": <PiCellSignalMedium className="w-6 h-6" />,
        "Low": <PiCellSignalLow className="w-6 h-6" />,
        "Urgent": <PiExclamationMark className="w-6 h-6" />
    }


    //handle text change in textarea text by text
    // const handleText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    //     const newValue = e.target.value;

    //     setUndoStack(prev => [...prev, plan]);
    //     setPlan(newValue);
    //     setRedoStack([]);
    // }

    //handle text change word by word
    const handleText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setPlan(newValue);

        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`

        //clear previous timer
        if (debouncerTimer.current) {
            clearTimeout(debouncerTimer.current);
        }

        //start new debounce timer that will run when there will be a delay of 500ms
        debouncerTimer.current = setTimeout(() => {
            //avoid duplicate texts
            if (lastSavedValue.current !== newValue) {
                setUndoStack(prev => [...prev, lastSavedValue.current]);
                lastSavedValue.current = newValue;
                setRedoStack([]); //new input clears redo history
            }
        }, 500);  //delay
    }

    //handle undo
    const handleUndo = () => {
        if (undoStack.length === 0) {
            return;
        }

        const prevText = undoStack[undoStack.length - 1];

        setUndoStack(prev => prev.slice(0, -1));
        setRedoStack(prev => [plan, ...prev]);
        setPlan(prevText);

        lastSavedValue.current = prevText;
    }

    //handle redo

    const handleRedo = () => {
        if (redoStack.length === 0) {
            return;
        }
        const nextText = redoStack[0];

        setRedoStack(prev => prev.slice(1));
        setUndoStack(prev => [...prev, plan]);
        setPlan(nextText);

        lastSavedValue.current = nextText;
    }

    //handle save
    const handleSave = async () => {
        //user can't save without title
        if (!title.trim()) {
            alert("Please enter title before saving");
            return;
        }

        const isEdit = activeItem !== null;
        const url = isEdit ? `${BASE_URL}/api/daily/${activeItem.id}`
            : `${BASE_URL}/api/daily/save`;
        const res = await fetch(url, {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, plan, status, priority }),
        });
        if (res.ok) {
            const savedItem = await res.json();
            // console.log(savedItem);
            onSave(savedItem);
            // alert(isEdit ? "Plan updated" : "Plan saved");
        }
    }

    //handle backdrop and give user a warning if he leaves without saving the plan
    const handleCloseRequest = () => {
        const hasContent = activeItem
            ? (title !== activeItem.title || plan !== activeItem.plan)
            : (title.trim() !== "" || plan.trim() !== "");

        if (hasContent) {
            setShowConfirm(true);

        } else {
            onClose();
        }
    };



    return (
        <>
            <div className="
        bg-[#DDAED3] border-4
        w-[90vw] lg:w-[50vw] sm:w-[60vw]
        max-h-100
        "
            >

                {/* boundry for title and buttons */}
                <div className=" flex flex-row gap-2
        w-full 
        "
                    onClick={(e) => e.stopPropagation()}
                >

                    {/* title */}

                    <textarea
                        placeholder="Plan"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        rows={1}
                        className="
            text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold p-2
            flex-1 min-w-0 outline-none
            resize-none scrollbar scrollbar-thin scrollbar-thumb
            max-h-40 title-font
            "
                    />
                    <div className="">

                        {/* undo  */}
                        <button className=" p-1 text-sm bg-[#FE7F2D] border-2 my-2 hover:translate-x-0.5 hover:translate-y-0.5"
                            onClick={handleUndo}
                        >
                            <LiaUndoSolid size={24} />
                        </button>

                        {/* redo  */}
                        <button className=" p-1 text-sm bg-[#FE7F2D] border-2 m-2 hover:translate-x-0.5 hover:translate-y-0.5"
                            onClick={handleRedo}
                        >
                            <LiaRedoSolid size={24} />
                        </button>


                    </div>
                </div>

                {/* Description and save,cancel button*/}
                <div className="border-2 flex flex-col
        w-full 
        "
                    onClick={(e) => { e.stopPropagation() }}
                >
                    <textarea
                        rows={5}
                        placeholder="Description"
                        value={plan}
                        onChange={handleText}
                        className=" w-full resize-none bg-transparent outline-none
            text-2xl px-2 pixel-font
            max-h-40 scrollbar scrollbar-thin scrollbar-thumb
            plan-font
            "
                    ></textarea>
                    {/* save and cancel  */}
                    <div className="flex justify-end border-t-2 gap-4 ">

                        <Dropdown
                            options={["Todo", "Backlog", "In Progress", "Done"]}
                            value={status}
                            onChange={setStatus}
                            iconMap={statusIcons}
                        >
                        </Dropdown>

                        <Dropdown
                            options={["High", "Low", "Medium", "Urgent"]}
                            value={priority}
                            onChange={setPriority}
                            iconMap={priorityIcons}
                        />
                        <button className="border p-2 text-sm pixel-font my-2 hover:translate-x-0.5 hover:translate-y-0.5"
                            onClick={handleSave}
                        // disabled={!title.trim()}
                        >
                            Save
                        </button>
                        <button className="border p-2 text-sm pixel-font my-2 mx-1
        bg-[#F075AE] hover:translate-x-0.5 hover:translate-y-0.5
        "
                            onClick={handleCloseRequest}
                        >
                            Cancel
                        </button>
                        <ConfirmModel
                            open={showConfirm}
                            message="Do you want to leave without saving plan?"
                            confirmText="Yes"
                            cancelText="No"
                            onConfirm={() => {
                                onClose(),
                                    setShowConfirm(false);
                            }}
                            onCancel={() => {
                                setShowConfirm(false);
                            }}
                        >
                        </ConfirmModel>
                    </div>

                </div>

            </div>

        </>
    )
}
export default CreatePlan;