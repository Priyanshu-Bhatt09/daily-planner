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

//github icon
import { FaGithub } from "react-icons/fa";

type Priority = "High" | "Medium" | "Urgent" | "Low";

interface Items {
  id: number;
  title: string;
  plan: string;
  status: string;
  priority: string;
}

function App() {

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const [isOpen, setIsOpen] = useState<boolean>(false); //this is for opening and closing functioning of CreatePlan
  //these are used to fetch lists
  const [item, setItem] = useState<Items[]>([]); //Items[] stores all the plans or we can say TITLE of those plans
  const [activeItem, setActiveItem] = useState<Items | null>(null); //if active item is null - then we are creating a brand new plan
  //but if activeItem has some data(that matches Items interface), then we know that we are editing an existing plan

  //this state is for showing alerts
  const [deleteId, setDeleteId] = useState<number | null>(null);

  //get completed dates for streak
  const [completedDates, setCompletedDates] = useState<string[]>([]);

  //fun to convert date to local Date from backend
  // const formatLocalDate = (date: Date) => {
  //   return date.getFullYear() + "-" +
  //   String(date.getMonth() + 1).padStart(2, "0") + "-" +
  //   String(date.getDate()).padStart(2, "0");
  // }

  //fetch the dates
  useEffect(() => {
    const fetchDates = async() => {
      try {
        const res = await fetch(`${BASE_URL}/api/daily/completed-dates`);
        const data = await res.json();
        setCompletedDates(data);
      } catch(error) {
        console.error("Failed to fetch dates", error);
      }
    };
    fetchDates();
  }, []);

  //generate the last 180 days grid
  const generateDays = () => {
    const days = [];
    const today = new Date();

    for(let i = 179; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i); //this goes to the last 90 days
      days.push(d.toISOString().split("T")[0]); //this only pushes the date not time, time got spilted as - split("T")

    }
    return days;
  };

  const days = generateDays();

  //generate weeks
  // const weeks: string[][] = [];

  // for(let i = 0; i < days.length; i += 7) {
  //   weeks.push(days.slice(i, i+7));
  // }

  const groupByMonth = (days: Date[]) => {
    const months: Record<string, Date[]> = {}; //we creating an empty object that will hold our final grouped data of string and date like - {"feb 2026", [Feb 24]}, 
    //we use Record - to create a dictionary or a hash map or lookup table with key and value pair

    days.forEach(date => {
      const monthKey = date.toLocaleString("default", {month : "short", year : "numeric"}); //we take the date and create it to something like this - Dec 2026

      if(!months[monthKey]) { //if it dosen't have the key like - !months["Feb 2026"]
        months[monthKey] = []; //then create an empty array like - months["Feb 2026"] = []
      }
      months[monthKey].push(date); //then we push the value or date - months["Feb 2026"] = [Feb 24]
    });
    return months;
  };

  const monthsData = groupByMonth(days.map(dateString => new Date(dateString)));

  //month labels - if it is the first week of that month
  // const formatter = new Intl.DateTimeFormat("Default", { month: "short"});
  // const monthLabels = weeks.map((week) => {
  //   const firstDay = new Date(week[0]);
  //   return formatter.format(firstDay);
  // });

  // //but we don't want duplicate month names for every week
  // let lastMonth = "";
  // const clearMonthLabels = monthLabels.map((month) => {
  //   if(month !== lastMonth) { //this is the logic if it is the first week of the month
  //     lastMonth = month; 
  //     return month;
  //   }
  //   return ""; //if it is not the first week then the lastmonth name is same as the current month so return an empty string
  // })
  

  //count how many tasks done in one day
  const countByDate = completedDates.reduce((acc, date) => { //reduce -> takes an array and reduces it to single value - in this case a single object
    //acc -> accumulator - stores running total, it starts as an empty object {} that is provided at the very end of the function
    acc[date] = (acc[date] || 0) + 1; //acc[date] -> looks inside the accumulator object for the current date, if the date isn't object yet it defaults it to 0 or add +1 to whatever num it just found
    return acc; //reduce requires you to hand the updated accumulator back at the end of every loop iteration so it can be used in the next loop
  }, {} as Record<string, number>); //this empty object is going to be filled with dates and its count

  //calculate streak
  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    for(let i = 0; ; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      if(countByDate[dateStr]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  const currentStreak = calculateStreak();

  //getcolors function
  const getColor = (count: number) => {
    if(count === 0) return "bg-gray-200";
    if(count === 1) return "bg-green-300";
    if(count === 2) return "bg-green-400";
    if(count === 3) return "bg-green-500";

    return "bg-green-700";
  };

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

  const[filter, setFilter] = useState<"all" | "active" | "completed" | "backlog" | "in-progress">("all");

  const filteredItems = item.filter(i => {
    if(filter === "active") {
      return i.status !== "Done";
    }

    if(filter === "completed") {
      return i.status === "Done";
    }

    if(filter === "backlog") {
      return i.status === "Backlog";
    }

    if(filter === "in-progress") {
      return i.status === "In Progress"
    }

    // if(filter === "priority") {
    //   return [...item].sort((a, b) => {
    //     const priorityOrder = {High: 1, Medium: 2, Low: 3, Urgent: 0};
    //     return priorityOrder[a.priority] - priorityOrder[b.priority];
    //   })
    // }
    return true; //for all the plans
  })

  return (
    <>
      <div className="border-2 min-h-screen bg-[#DDAED3] flex items-center justify-center" //flex-row justify-start items-center gap-4
      >
        {/* <div className="border-2"> */}
        {/* SIDEBAR  */}
        <div className="w-[20vw] h-[98vh] flex flex-col items-center m-2 p-2 border-2 gap-2">
          {/* <h3 className="pixel-font">Create Plan</h3> */}
          <button className="border-4 border-black w-full plan-font text-2xl
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
          <button
          onClick={() => setFilter("all")}
          className={`border-4 border-black w-full plan-font text-2xl
      flex items-center gap-4 p-1
      ${filter === "all" ? "bg-[#fb7676]": "bg-[#F075AE]"}
      hover:translate-x-0.5 hover:translate-y-0.5`}>All Plans</button>
          <button 
          onClick={() => setFilter("in-progress")}
          className={`border-4 border-black w-full plan-font text-2xl
      flex items-center gap-4 p-1
      ${filter === "in-progress" ? "bg-[#fb7676]": "bg-[#F075AE]"}
      hover:translate-x-0.5 hover:translate-y-0.5`}>In Progress</button>

      <div className="border-2 flex flex-1 w-full items-end justify-center">

        <button className="mb-2">
          <a href="https://github.com/Priyanshu-Bhatt09/daily-planner" target="_blank" rel="noopener noreferrer">
        <FaGithub size={30}/>
        </a>
      </button>
      </div>
      
      </div>

      <div className="flex flex-col border-4 w-[60vw] h-[98vh] p-2">
        {/* TOPBAR  */}
        <div className="flex flex-row border-2 h-fit w-full p-2  gap-4">
            <button 
            onClick={() => setFilter("active")}
            className={`border-3 p-1 plan-font text-2xl ${filter === "active" ? "bg-[#fb7676]": "bg-[#F075AE]"}`}>Active</button>
            <button 
            onClick={() => setFilter("completed")}
            className={`border-3 p-1 plan-font text-2xl ${filter === "completed" ? "bg-[#fb7676]": "bg-[#F075AE]"}`}>Completed</button>
            <button 
            onClick={() => setFilter("backlog")}
            className={`border-3 p-1 plan-font text-2xl ${filter === "backlog" ? "bg-[#fb7676]": "bg-[#F075AE]"}`}>Backlog</button>
            <button 
            
            className={`border-3 p-1 plan-font text-2xl ${filter === "completed" ? "bg-[#fb7676]": "bg-[#F075AE]"}`}>Priority</button>
        </div>

        {/* List of Plans */}
        <div className=" flex justify-start 
      w-full sm:w-3/4 md:w-1/2 lg:w-full
      h-[80vh] lg:h-90 sm:h-[80vh] md:h-[80vh]
      overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb
       my-2
      ">

          <div className="divide-y p-1 w-full  border-2 ">
            {item.length === 0 ? (
              <div className="flex justify-center items-center ">
                <button className="border-4 border-black w-full plan-font text-2xl
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
            ) : (
              filteredItems.map((n) => {
                
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


        {/* streak section  */}
        <div className="text-2xl title-font ">
          Current Streak : {currentStreak} days
        </div>
        <div className="flex gap-8 overflow-x-auto border-2 w-full p-2 my-2 justify-center">
          {Object.entries(monthsData).map(([monthName, monthDays]) => (
            <div key={monthName}>

              {/* month label  */}
              <div className="mb-2  font-semibold title-font">
                {monthName}
              </div>

              {/* month grid  */}
              <div
              className="grid grid-flow-col grid-rows-7 gap-2 auto-cols-[12px]"
              >
                {monthDays.map((dateObj) => {
                  const dateStr = dateObj.toISOString().split("T")[0];
                  const count = countByDate[dateStr] || 0;

                  return(
                    <div
                    key={dateStr}
                    className={`w-3 h-3 rounded-sm ${getColor(count)} `}
                    title={`${dateStr} - ${count} plans`}
                    >
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

        

        {/* <div className="grid grid-flow-col auto-cols-[16px] grid-rows-7 gap-1 h-[25vh] m-2">
          {days.map((dateObj) => {
            const dateStr = dateObj;
            const count = countByDate[dateStr] || 0;

            return(
              <div
              key={dateStr}
              className={`w-4 h-4 ${getColor(count)} transition hover:scale-110 `}
              title={`${dateStr} - ${count} plans`}
              >
              </div>
            )
          })}
        </div> */}
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
      {/* </div> */}
    </>
  )
}
export default App;