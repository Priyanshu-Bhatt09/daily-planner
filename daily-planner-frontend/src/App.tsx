import { useEffect, useState } from "react";
import CreatePlan from "./CreatePlan";
import { BsPlusSquareDotted } from "react-icons/bs";
import { AiOutlineDelete } from "react-icons/ai";
import ConfirmModel from "./ConfirmModel";

import { MdOutlineRectangle } from "react-icons/md";
import { PiRectangleDashed } from "react-icons/pi";
import { MdIncompleteCircle } from "react-icons/md";
import { MdDoneOutline } from "react-icons/md";

//priority icons
import { PiCellSignalHigh } from "react-icons/pi";
import { PiCellSignalMedium } from "react-icons/pi";
import { PiCellSignalLow } from "react-icons/pi";
import { PiExclamationMark } from "react-icons/pi";
import { Dropdown } from "./Components/Dropdown";



interface Items {
  id: number;
  title: string;
  plan: string;
  status: string;
  priority: string;
}

function App() {

  const BASE_URL = import.meta.env.VITE_API_URL;
  const [isOpen, setIsOpen] = useState<boolean>(false); //this is for opening and closing functioning of CreatePlan
  //these are used to fetch lists
  const [item, setItem] = useState<Items[]>([]); //Items[] stores all the plans or we can say TITLE of those plans
  const [activeItem, setActiveItem] = useState<Items | null>(null); //if active item is null - then we are creating a brand new plan
  //but if activeItem has some data(that matches Items interface), then we know that we are editing an existing plan

  //this state is for showing alerts
  const [deleteId, setDeleteId] = useState<number | null>(null);

  //fetch the data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/daily/items`);//this api fetches all the titles
        const data = await res.json();
        setItem(data);
      }

      catch (error) {
        console.log("Data fetching failed of plans ", error);
      }
    };
    fetchData();
  }, []);

  const handleTitleClick = async (id: number) => {
    const res = await fetch(`${BASE_URL}/api/daily/fetchAll/${id}`); //this api fetches all the titel and body of a plan by using its id number
    const fullData = await res.json();
    setActiveItem(fullData);
    setIsOpen(true);
    // console.log(fullData);
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/daily/deletePlan/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      })
      if (res.ok) {
        //update the list filter out the items which don't match the id of the deleted one
        setItem((prev) => prev.filter((n) => n.id !== id)); //filter creates a new lists which includes only those which dosen't have the same id as deleted one
        // alert("Plan deleted successfully");
      } else {
        console.log("Failed to delete from backend");
      }
    } catch (error) {
      console.log("Delete Plan error : ", error);
    }

  }

  //icons
  const statusIcons: Record<string, React.ReactNode> = {
    "Todo": <MdOutlineRectangle className="w-5 h-5 shrink-0 text-[#ffee34]" />,
    "Backlog": <PiRectangleDashed className="w-5 h-5 shrink-0 text-[#ffee34]" />,
    "In Progress": <MdIncompleteCircle className="w-5 h-5 shrink-0 text-[#ffee34]" />,
    "Done": <MdDoneOutline className="w-5 h-5 shrink-0 text-[#ff346e]" />
  }

  //priority icons
  const priorityIcons: Record<string, React.ReactNode> = {
    "High": <PiCellSignalHigh className="w-5 h-5 shrink-0 text-[#ffee34]" />,
    "Medium": <PiCellSignalMedium className="w-5 h-5 shrink-0 text-[#ffee34]" />,
    "Low": <PiCellSignalLow className="w-5 h-5 shrink-0 text-[#ffee34]" />,
    "Urgent": <PiExclamationMark className="w-5 h-5 shrink-0 text-red-600 font-bold" />
  }

  // const [status, setStatus] = useState<string>("");
  // const [priority, setPriority] = useState<string>("");
  //this is for updating the status while showing the plans
  const updateStatus = async(id: number, newStatus: string) => {
    const res = await fetch(`${BASE_URL}/api/daily/${id}/status`, {
      method: "PATCH",
      headers: {"Content-Type" : "application/json"},
      body: JSON.stringify({status : newStatus}),
    });

    if(res.ok) {
      const updated = await res.json();

      setItem(prev => prev.map(p => (p.id === id ? updated : p)));
    }
  }
  const updatePriority = async(id: number, newPriority: string) => {
    const res = await fetch(`${BASE_URL}/api/daily/${id}/priority`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({priority: newPriority}),
    });

    if(res.ok) {
      const updated = await res.json();
      setItem(prev => prev.map(p => (p.id === id ? updated : p)));
    }
  }

  const activePlans = item.filter(i => i.status !== "Done");
  const completedPlans = item.filter(i => i.status === "Done");

  return (
    <>
      <div className="border-2 min-h-screen bg-[#DDAED3] flex flex-col justify-start items-center gap-4"
      >

        <div className=" w-70 flex flex-col items-center m-2 ">
          {/* <h3 className="pixel-font">Create Plan</h3> */}
          <button className="border-4 border-black w-full pixel-font
      flex items-center gap-4 p-1
      bg-[#FBEF76]
      hover:translate-x-0.5 hover:translate-y-0.5
      "
            onClick={() => {
              setActiveItem(null);
              setIsOpen(true)
            }}
          >
            <BsPlusSquareDotted size={30} />
            Create Plan
          </button>
        </div>

        {/* List of Plans */}
        <div className="border-2 flex justify-start 
      w-full sm:w-3/4 md:w-1/2 lg:w-1/3
      h-[80vh] lg:h-132 sm:h-[80vh] md:h-[80vh]
      overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb
      mt-20 lg:mt-12 sm:mt-12 md:mt-12
      ">

          <div className="divide-y p-1 w-full m-2">
            {item.length === 0 ? (
              <div className="text-xl pixel-font">
                No Plans yet
              </div>
            ) : (
              activePlans.map((n) => {
                
                // console.log("Current item data ", n);
                return (
                  <div
                    key={n.id}
                    className="text-xl border m-2 p-1 flex items-center justify-between cursor-pointer"
                  >
                    <span
                      onClick={() => {
                        handleTitleClick(n.id)
                      }}
                      className="cursor-pointer w-full title-font text-3xl flex items-center gap-2"
                    >
                      <Dropdown
                      options={["Low", "High", "Medium", "Urgent"]}
                      value={n.priority}
                      iconMap={priorityIcons}
                      showText= {false}
                      onChange={(newPriority) => updatePriority(n.id, newPriority)}
                      />
                      <Dropdown
                      options={["Todo", "Backlog", "In Progress", "Done"]}
                      value={n.status}
                      iconMap={statusIcons}
                      showText={false}
                      onChange={(newStatus) => updateStatus(n.id, newStatus)}
                      />
                      {n.title}
                    </span>
                    {/* delete button */}
                    <button className="border-2 plan-font p-1 bg-[#F075AE] hover:translate-x-0.5 hover:translate-y-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(n.id);
                      }}
                    ><AiOutlineDelete size={25} /></button>
                  </div>
                )
              })
            )}
            <ConfirmModel
                      open={deleteId != null}
                      message="Are you sure you want to delete this plan?"
                      confirmText="Delete"
                      cancelText="Cancel"
                      onCancel={() => {
                        setDeleteId(null)
                      }}
                      onConfirm={() => {
                        if(deleteId !== null) {
                          handleDelete(deleteId);
                        }
                        
                        setDeleteId(null);
                      }}
            ></ConfirmModel>
            {completedPlans.length > 0 && (
                  <div className="mt-4 ">
                    <div className=" title-font p-2 opacity-70">
                      {completedPlans.length} Completed Plans
                    </div>
                  

                  {completedPlans.map(plan => (
                    <div
                    key={plan.id}
                    className=" p-1"
                    >
                      <div className="flex items-center gap-2 border p-1">

                        <input type="checkbox" 
                        className="accent-[#ffee34] shrink-0 opacity-70"
                        checked = {plan.status === "Done"}
                        onChange={() => 
                          updateStatus(plan.id, 
                            plan.status === "Done" ? "Todo" : "Done"
                          )
                        }
                        readOnly/>
                        <span className="line-through pixel-font opacity-50">{plan.title}</span>


                    {/* delete button */}
                    <button className="border-2 plan-font p-1 bg-[#F075AE] opacity-70 hover:translate-x-0.5 hover:translate-y-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(plan.id)
                      }}
                    ><AiOutlineDelete size={25} />
                    </button>
                      </div>
                    </div>
                  ))}
                  </div>
            )}
          </div>
        </div>

        {/* if isOpen is true then show Create plan, if isOpen false then don't show Create plan
      and onClose is a prop of createplan so its like - createplan if you ever want to close yourself call this function
      */}

        {isOpen && (
          <div className="fixed inset-0 bg-[#E4FF30]/30 flex justify-center items-start z-50
        pt-45 lg:pt-40 sm:pt-40 md:pt-40 
        "
            onClick={(e) => {
              e.stopPropagation(),
              setIsOpen(false)
            }}
          >
            <CreatePlan
              activeItem={activeItem}
              onClose={() => setIsOpen(false)}
              onSave={(savedItem) => {
                setItem(prev => {
                  const exists = prev.find(p => p.id === savedItem.id);//prev represents already existing lists, p represents a specific already existing plan, and compares its ID with the savedItem.id which came from backend
                  if (exists) { // if the plan already exists then we can update it
                    //update
                    return prev.map(p => (p.id === savedItem.id ? savedItem : p)); //prev.map creates new list of every plan(bcz that's how react works, you can't just edit the old list), and it checks the id of plan with the savedItem.id if it matches it updates the plan, if it dosen't then it the same old plan and copies it into the new list
                  } else {
                    //new plan
                    return [...prev, savedItem];
                  }
                });
                setIsOpen(false); //once the list is updated the popup closes
              }}
            />
          </div>

        )}
      </div>
    </>
  )
}
export default App;