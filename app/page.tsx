
"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const router = useRouter();
  const [updates, setUpdates] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [examUpdates, setExamUpdates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);

const [newCollege, setNewCollege] = useState("");
const [newUpdate, setNewUpdate] = useState("");
const [newPriority, setNewPriority] = useState("High");
const [newStatus, setNewStatus] = useState("Pending");
const [newAction, setNewAction] = useState("");
const statusData = [
  {
    name: "Completed",
    value: examUpdates.filter((i) => i.status === "Completed").length,
  },
  {
    name: "Pending",
    value: examUpdates.filter((i) => i.status === "Pending").length,
  },
];

const priorityData = [
  {
    name: "High",
    value: examUpdates.filter((i) => i.priority === "High").length,
  },
  {
    name: "Medium",
    value: examUpdates.filter((i) => i.priority === "Medium").length,
  },
  {
    name: "Low",
    value: examUpdates.filter((i) => i.priority === "Low").length,
  },
];
  const dashboardRef = useRef<HTMLDivElement>(null);
const collegeRef = useRef<HTMLDivElement>(null);
const seoRef = useRef<HTMLDivElement>(null);
const examRef = useRef<HTMLDivElement>(null);

  const filteredUpdates = updates.filter((item) => {

  const matchesSearch =
    item.college
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    item.update_text
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

  const matchesPriority =
    selectedPriority === "All" ||
    item.priority === selectedPriority;

  const matchesStatus =
    selectedStatus === "All" ||
    item.status === selectedStatus;

  const pendingCheck = showPendingOnly
  ? item.status !== "Completed"
  : true;
return (
  matchesSearch &&
  matchesPriority &&
  matchesStatus &&
  pendingCheck
);
});

const filteredAlerts = alerts.filter((item) => {
  const matchesSearch =
    item.college.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesPriority =
    selectedPriority === "All" ||
    item.severity === selectedPriority;

  return matchesSearch && matchesPriority;
});

const filteredExamUpdates = examUpdates.filter((item) => {

  const matchesSearch =
    item.exam_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    item.update_title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

  const matchesPriority =
    selectedPriority === "All" ||
    item.priority === selectedPriority;

  const matchesStatus =
    selectedStatus === "All" ||
    item.status === selectedStatus;

  const pendingCheck = showPendingOnly
  ? item.status !== "Completed"
  : true;

return (
  matchesSearch &&
  matchesPriority &&
  matchesStatus &&
  pendingCheck
);
});
async function fetchData() {

      // COLLEGE UPDATES
      const { data: collegeData, error: collegeError } =
        await supabase
          .from("college_updates")
          .select("*");

      console.log("COLLEGE DATA:", collegeData);
      console.log("COLLEGE ERROR:", collegeError);

      if (collegeData) {
        setUpdates(collegeData);
      }

      // SEO ALERTS
      const { data: alertsData, error: alertsError } =
        await supabase
          .from("seo_alerts")
          .select("*");

      console.log("SEO ALERTS:", alertsData);
      console.log("SEO ERROR:", alertsError);

      if (alertsData) {
        setAlerts(alertsData);
      }

// Exam Updates
const { data: examData, error: examError } = await supabase
  .from("exam_updates")
  .select("*");

console.log("EXAM DATA:", examData);
console.log("EXAM ERROR:", examError);

if (examData) {
  setExamUpdates(examData);
}
    }
    async function addCollegeUpdate() {
  const { error } = await supabase
    .from("college_updates")
    .insert([
      {
        college: newCollege,
        update_text: newUpdate,
        priority: newPriority,
        status: newStatus,
        recommended_action: newAction,
      },
    ]);

  if (!error) {
    fetchData();

    setShowModal(false);

    setNewCollege("");
    setNewUpdate("");
    setNewPriority("High");
    setNewStatus("Pending");
    setNewAction("");
  }

  console.log(error);
}
    async function updateStatus(id: number, newStatus: string) {
  await supabase
    .from("college_updates")
    .update({ status: newStatus })
    .eq("id", id);

  fetchData();
}
async function updateExamStatus(
  id: number,
  newStatus: string
) {
  console.log("Updating:", id, newStatus);

  const { data, error } = await supabase
    .from("exam_updates")
    .update({ status: newStatus })
    .eq("id", Number(id))
    .select();

  console.log("UPDATED DATA:", data);
  console.log("UPDATE ERROR:", error);

  fetchData();
}
async function deleteExamUpdate(id: number) {
  const { error } = await supabase
    .from("exam_updates")
    .delete()
    .eq("id", id);

  if (error) {
    console.log("DELETE ERROR:", error);
  } else {
    console.log("Deleted Successfully");

    fetchData();
  }
}
  useEffect(() => {

  async function checkUser() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
    } else {
      fetchData();
    }
  }

  checkUser();

}, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#581c87] text-white flex">
      {/* Sidebar */}
<div className="w-72 min-h-screen border-r border-white/10 bg-black/20 backdrop-blur-xl p-6">

  <h2 className="text-3xl font-bold mb-10">
    KA AI OPS
  </h2>

  <div className="space-y-4">

    <button className="w-full text-left px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition">
      Dashboard
    </button>

    <button
  onClick={() =>
    collegeRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }
  className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 transition"
>
  College Updates
</button>

    <button
  onClick={() =>
    seoRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }
  className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 transition"
>
  SEO Alerts
</button>

    <button
  onClick={() =>
    examRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }
  className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 transition"
>
  Exam Updates
</button>

    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 transition">
      Settings
      <button
  onClick={async () => {

    await supabase.auth.signOut();

    router.push("/login");
  }}
  className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-300 transition"
>
  Logout
</button>
    </button>

  </div>
</div>
<div ref={dashboardRef} className="flex-1 p-10">
  <div className="flex justify-end mb-4">

  <button
    onClick={() => setShowModal(true)}
    className="bg-purple-600 hover:bg-purple-700 transition px-5 py-3 rounded-xl font-semibold shadow-lg"
  >
    + Add New Update
  </button>

</div>
  <div className="flex flex-wrap items-center gapx-4 py-4 mb-8 bg-white/5 border border-white/10 rounded-2xl p-4">
    <button
  onClick={() => setSelectedPriority("All")}
  className="px-5 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
>
  All
</button>

  <button
  onClick={() => setSelectedPriority("High")}
  className="px-5 py-2 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition"
>
    High Priority
  </button>

  <button
  onClick={() => setSelectedPriority("Medium")}
  className="px-5 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30 hover:bg-yellow-500/30 transition"
>
  Medium Priority
</button>

  <button
  onClick={() => setSelectedPriority("Low")}
  className="px-5 py-2 rounded-xl bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition"
>
  Low Priority
</button>
<div className="ml-6 flex gapx-4 py-4">

  <button
    onClick={() => setSelectedStatus("All")}
    className="px-5 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
  >
    All Status
  </button>

  <button
    onClick={() => setSelectedStatus("Pending")}
    className="px-5 py-2 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition"
  >
    Pending
  </button>

  <button
    onClick={() => setSelectedStatus("Completed")}
    className="px-5 py-2 rounded-xl bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition"
  >
    Completed
  </button>
  <button
  onClick={() => setSelectedStatus("Completed")}
  className="px-5 py-2 rounded-xl bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition"
>
  Completed
</button>

<button
  onClick={() =>
    setShowPendingOnly(!showPendingOnly)
  }
  className={`px-5 py-2 rounded-xl transition ${
    showPendingOnly
      ? "bg-green-500 text-white"
      : "bg-white/10 border border-white/20"
  }`}
>
  {showPendingOnly
    ? "Showing Pending Only"
    : "Show Pending Only"}
</button>

</div>

</div>
      <div className="mb-6">
  <input
    type="text"
    placeholder="Search colleges or exams..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-lg text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
  />
</div>

     <h1 className="text-4xl lg:text-5xl font-bold mb-8">
  KA AI SEO Ops Dashboard
</h1>


{/* CHART SECTION START */}

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

  {/* Status Chart */}
  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
    <h2 className="text-xl font-semibold mb-4">
      Update Status
    </h2>

    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={statusData}
            dataKey="value"
            outerRadius={100}
            label
          >
            <Cell fill="#22c55e" />
            <Cell fill="#ef4444" />
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* Priority Chart */}
  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
    <h2 className="text-xl font-semibold mb-4">
      Priority Distribution
    </h2>

    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={priorityData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />

          <Tooltip />

          <Bar dataKey="value" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>

</div>

{/* CHART SECTION END */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

  <div className="bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.12)] p-6 rounded-2xl shadow-md">
    <h3 className="text-gray-500 text-lg">
      College Updates
    </h3>

    <p className="text-4xl font-bold mt-2">
      {updates.length}
    </p>
  </div>

  <div className="bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.12)] p-6 rounded-2xl shadow-md">
    <h3 className="text-gray-500 text-lg">
      SEO Alerts
    </h3>

    <p className="text-4xl font-bold mt-2">
      {alerts.length}
    </p>
  </div>

  <div className="bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.12)] p-6 rounded-2xl shadow-md">
    <h3 className="text-gray-500 text-lg">
      Exam Updates
    </h3>

    <p className="text-4xl font-bold mt-2">
      {examUpdates.length}
    </p>
  </div>

  <div className="bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.12)] p-6 rounded-2xl shadow-md">
    <h3 className="text-gray-500 text-lg">
      High Priority
    </h3>

    <p className="text-4xl font-bold mt-2 text-red-600">
      {
        updates.filter((item) => item.priority === "High").length +
        alerts.filter((item) => item.severity === "High").length +
        examUpdates.filter((item) => item.priority === "High").length
      }
    </p>
  </div>

</div>

      {/* College Updates */}
      <div ref={collegeRef}>
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.12)] rounded-3xl shadow-md p-8 mb-10">

        <h2 className="text-4xl font-bold mb-8">
          Live College Updates
        </h2>

        <div className="overflow-x-auto">
  <table className="w-full border-collapse min-w-[1200px]">

          <thead>
  <tr className="border-b">
    <th className="text-left p-4">College</th>

    <th className="text-left p-4">Update</th>

    <th className="text-left p-4">Priority</th>

    <th className="text-left p-4">Status</th>

    <th className="text-left p-4">
      Recommended Action
    </th>

    <th className="text-left p-4">
      Action
    </th>
  </tr>
</thead>

          <tbody>
            {filteredUpdates.map((item) => (
              <tr
  key={item.id}
  className="border-b border-white/10 hover:bg-white/5 transition"
>
                <td className="p-3 text-sm font-semibold">{item.college}</td>
                <td className="px-4 py-4 text-sm font-semibold">{item.update_text}</td>
                <td className="px-4 py-4 text-sm font-semibold">
  <span
    className={`px-3 py-1 rounded-full text-sm font-semibold font-semibold ${
      item.priority === "High"
        ? "bg-red-100 text-red-600"
        : item.priority === "Medium"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-green-100 text-green-700"
    }`}
  >
    {item.priority}
  </span>
</td>
<td className="px-4 py-4 text-sm font-semibold">
  <span
    className={`px-3 py-1 rounded-full text-sm font-semibold font-semibold ${
      item.status === "Completed"
        ? "bg-green-100 text-green-700"
        : item.status === "In Progress"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {item.status || "Pending"}
  </span>
</td>
                <td className="px-4 py-4 text-sm font-semibold">
                  {item.recommended_action}
                </td>
                <td className="px-4 py-4 text-sm font-semibold">
  <button
    onClick={() =>
      updateStatus(item.id, "Completed")
    }
    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
  >
    Mark Complete
  </button>
</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
      </div>
</div>
      {/* SEO Alerts */}
<div ref={seoRef}>
  <div className="bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.12)] rounded-3xl shadow-md p-8">

        <h2 className="text-4xl font-bold mb-8">
          SEO Alerts
        </h2>

        <div className="overflow-x-auto">
  <table className="w-full border-collapse min-w-[1200px]">

          <thead>
            <tr className="border-b">
              <th className="text-left p-4">College</th>
              <th className="text-left p-4">Alert</th>
              <th className="text-left p-4">Severity</th>
              <th className="text-left p-4">
                Action Required
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredAlerts.map((item) => (
              <tr
  key={item.id}
  className={`border-b transition-all duration-300 ${
    item.status === "Completed"
      ? "opacity-60"
      : "opacity-100"
  }`}
>
                <td className="px-4 py-4 text-sm font-semibold">{item.college}</td>
                <td className="px-4 py-4 text-sm font-semibold">{item.alert_text}</td>
                <td className="px-4 py-4 text-sm font-semibold">
  <span
    className={`px-3 py-1 rounded-full text-sm font-semibold font-semibold ${
      item.severity === "High"
        ? "bg-red-100 text-red-600"
        : item.severity === "Medium"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-green-100 text-green-700"
    }`}
  >
    {item.severity}
  </span>
</td>
                <td className="px-4 py-4 text-sm font-semibold">
                  {item.action_required}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
        </div>
  </div>
</div>

{/* Exam Updates */}
      <div ref={examRef}>
<div className="bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.12)] rounded-3xl shadow-md p-8 mt-10">
  <h2 className="text-4xl font-bold mb-8">
    Exam Updates
  </h2>

  <div className="overflow-x-auto">
  <table className="w-full border-collapse min-w-[1200px]">
    <thead>
      <tr className="border-b">
        <th className="text-left p-4">Exam</th>
        <th className="text-left p-4">Title</th>
        <th className="text-left p-4">Description</th>
        <th className="text-left p-4">Priority</th>
        <th className="text-left p-4">Status</th>
        <th className="text-left p-4">Action</th>
      </tr>
    </thead>

    <tbody>
      {filteredExamUpdates.map((item) => (
        <tr
  key={item.id}
  className="border-b border-white/10 hover:bg-white/5 transition"
>
          <td className="px-4 py-4 text-sm font-semibold">{item.exam_name}</td>
          <td className="px-4 py-4 text-sm font-semibold">{item.update_title}</td>
          <td className="px-4 py-4 text-sm font-semibold">{item.update_description}</td>
          <td className="px-4 py-4 text-sm font-semibold">
  <span
    className={`px-3 py-1 rounded-full text-sm font-semibold font-semibold ${
      item.priority === "High"
        ? "bg-red-100 text-red-600"
        : item.priority === "Medium"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-green-100 text-green-700"
    }`}
  >
    {item.priority}
  </span>
</td>
          <td className="px-4 py-4 text-sm font-semibold">
  <span
    className={`px-3 py-1 rounded-full text-sm font-semibold font-semibold ${
      item.status === "Completed"
        ? "bg-green-100 text-green-700"
        : item.status === "In Progress"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {item.status || "Pending"}
  </span>
</td>
<td className="px-4 py-4 text-sm font-semibold">
  <div className="flex gap-2">

  {item.status !== "Completed" ? (
    <button
      onClick={() =>
        updateExamStatus(item.id, "Completed")
      }
      className="px-3 py-2 whitespace-nowrap bg-green-500 hover:bg-green-600 transition rounded-lg text-white text-sm font-semibold"
    >
      Mark Complete
    </button>
  ) : (
    <span className="px-3 py-2 rounded-lg bg-green-500/20 text-green-300 text-sm font-semibold">
      ✓ Completed
    </span>
  )}

  <button
    onClick={() => deleteExamUpdate(item.id)}
    className="px-3 py-2 whitespace-nowrap bg-red-500 hover:bg-red-600 transition rounded-lg text-white text-sm font-semibold"
  >
    Delete
  </button>

</div>
</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
   </div>
   </div>
</div>
{showModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

    <div className="bg-[#1e1b4b] border border-white/10 rounded-3xl p-8 w-full max-w-2xl">

      <h2 className="text-3xl font-bold mb-6">
        Add College Update
      </h2>

      <div className="space-y-4">

        <input
          type="text"
          placeholder="College Name"
          value={newCollege}
          onChange={(e) =>
            setNewCollege(e.target.value)
          }
          className="w-full p-4 rounded-xl bg-white/10 border border-white/10"
        />

        <input
          type="text"
          placeholder="Update Text"
          value={newUpdate}
          onChange={(e) =>
            setNewUpdate(e.target.value)
          }
          className="w-full p-4 rounded-xl bg-white/10 border border-white/10"
        />

        <input
          type="text"
          placeholder="Recommended Action"
          value={newAction}
          onChange={(e) =>
            setNewAction(e.target.value)
          }
          className="w-full p-4 rounded-xl bg-white/10 border border-white/10"
        />

        <select
          value={newPriority}
          onChange={(e) =>
            setNewPriority(e.target.value)
          }
          className="w-full p-4 rounded-xl bg-white/10 border border-white/10"
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <select
          value={newStatus}
          onChange={(e) =>
            setNewStatus(e.target.value)
          }
          className="w-full p-4 rounded-xl bg-white/10 border border-white/10"
        >
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>

      </div>

      <div className="flex justify-end gap-4 mt-8">

        <button
          onClick={() => setShowModal(false)}
          className="px-5 py-3 rounded-xl bg-white/10"
        >
          Cancel
        </button>

        <button
          onClick={addCollegeUpdate}
          className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition"
        >
          Save Update
        </button>

      </div>

    </div>
  </div>
)}
</main>
);
}