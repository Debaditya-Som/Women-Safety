// import { useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { Pie } from "react-chartjs-2";
// import "leaflet/dist/leaflet.css";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import L from "leaflet";
// import reportsData from "frontend/public/harassment_reports.json";

// interface HarassmentReport {
//     type: string;
//     severity: string;
//     description: string;
//     date: string;
//     time: string;
//     isAnonymous: string;
//     contactInfo: string;
//     hasWitnesses: string;
//     witnessInfo: string;
//     latitude: number;
//     longitude: number;
//   }
  

// const Dashboard = () => {
//   const [reports, setReports] = useState<HarassmentReport[]>([]);

//   const [severityData, setSeverityData] = useState({});

//   useEffect(() => {
//     setReports(reportsData);
//     processSeverityData(reportsData);
//   }, []);

  

//   const processSeverityData = (data) => {
//     const severityCounts = data.reduce((acc, report) => {
//       acc[report.severity] = (acc[report.severity] || 0) + 1;
//       return acc;
//     }, {});

//     setSeverityData({
//       labels: Object.keys(severityCounts),
//       datasets: [
//         {
//           data: Object.values(severityCounts),
//           backgroundColor: ["red", "orange", "yellow"],
//         },
//       ],
//     });
//   };

//   const customMarker = new L.Icon({
//     iconUrl: "/marker-icon.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//   });

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Harassment Reports Dashboard</h1>
//       <div className="grid grid-cols-2 gap-4">
//         {/* Incident Map */}
//         <div className="h-96">
//           <MapContainer center={[22.5726, 88.3639]} zoom={10} className="h-full w-full">
//             <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//             {reports.map((report, index) => (
//               <Marker key={index} position={[report.latitude, report.longitude]} icon={customMarker}>
//                 <Popup>
//                   <strong>Type:</strong> {report.type} <br />
//                   <strong>Severity:</strong> {report.severity} <br />
//                   <strong>Description:</strong> {report.description}
//                 </Popup>
//               </Marker>
//             ))}
//           </MapContainer>
//         </div>

//         {/* Severity Chart */}
//         <div className="flex justify-center items-center">
//           <Pie data={severityData} />
//         </div>
//       </div>

//       {/* Recent Reports Table */}
//       <div className="mt-6">
//         <h2 className="text-xl font-bold mb-2">Recent Reports</h2>
//         <table className="w-full border-collapse border border-gray-300">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="border p-2">Type</th>
//               <th className="border p-2">Severity</th>
//               <th className="border p-2">Time</th>
//               <th className="border p-2">Location</th>
//             </tr>
//           </thead>
//           <tbody>
//             {reports.slice(0, 5).map((report, index) => (
//               <tr key={index} className="border">
//                 <td className="border p-2">{report.type}</td>
//                 <td className="border p-2">{report.severity}</td>
//                 <td className="border p-2">{report.time}</td>
//                 <td className="border p-2">{report.latitude}, {report.longitude}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;