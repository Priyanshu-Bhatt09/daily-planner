import React, { useEffect, useRef, useState } from "react";

type DropdownProps = {
    options: string[];
    value: string;
    onChange?: (value: string) => void;
    iconMap?: Record<string, React.ReactNode>; //Record creates an object of Keys and type pair Record<Keys, Type>
    showText?: boolean;
};

export default function Dropdown({
    options,
    value,
    onChange,
    iconMap,
    showText = true
}: DropdownProps) {

    const[open, setOpen] = useState<boolean>(false);
    const selected = value;
    const[list, setList] = useState(
        options.filter((o) => o !== value) //this is the logic for - keep only those in the list which are not the default values(or already selected)
    );
    const ref = useRef<HTMLDivElement>(null);

    //this useeffect is for the syncronization for the default value
    useEffect(() => {
        setList(options.filter(o => o !== value));
    }, [options, selected]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if(ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (value: string) => {
        setList((prev) => [selected, ...prev.filter((v) => v !== value)]);//this takes the old list (prev) and filters the values which user selected then creates a new array and takes the old selected value and combines it with the prev list.
        // setSelected(value);
        onChange?.(value);
        setOpen(false);
    };

    return(
        <>
        <div ref={ref} className="relative inline-block">

            <button
            onClick={(e) => {setOpen((prev) => !prev),
                e.stopPropagation()
            }}
            className="p-1.5 text-sm pixel-font my-1 mt-2 hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-1 cursor-pointer "
            >
                {iconMap?.[value]}
                {showText && value}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 w-max min-w-full border plan-font divide-y">
                    {list.map((opt) => (
                        <div
                        key={opt}
                        onClick={(e) => {handleSelect(opt),
                            e.stopPropagation()
                        }}
                        className="px-2 py-1 cursor-pointer text-2xl flex items-center gap-2 bg-[#F075AE]"
                        >
                            {iconMap?.[opt]}
                            {showText && opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
        </>
    )
}