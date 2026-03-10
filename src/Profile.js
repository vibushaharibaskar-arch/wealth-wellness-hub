// Profile.js

import React, { useState } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const DEFAULT_PROFILE = {
  reminders: [
    { name: "Credit Card Bill", due: "2026-03-10", type: "Essential" },
    { name: "Phone Bill", due: "2026-03-12", type: "Essential" },
    { name: "Netflix", due: "2026-03-15", type: "Cuttable" },
    { name: "Spotify", due: "2026-03-18", type: "Flexible" },
  ],
};

export default function Profile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter bills by the selected date
  const getBillsForDate = (date) => {
    const formattedDate = date.toISOString().split('T')[0]; // format date as YYYY-MM-DD
    return profile.reminders.filter(bill => bill.due === formattedDate);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: 32, fontWeight: 800, color: "#0c4a6e" }}>Your Bill Calendar</h3>
        <p style={{ color: "#64748b", marginTop: 10, fontSize: 15 }}>
          View and manage your upcoming bill due dates.
        </p>
      </div>

      {/* React Calendar */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
        />
      </div>

      {/* Display bills for the selected date */}
      <div style={{ marginTop: 20 }}>
        <h4 style={{ fontSize: 24, fontWeight: 700, color: "#0c4a6e" }}>Bills Due on {selectedDate.toLocaleDateString()}</h4>
        <div style={{ marginTop: 10 }}>
          {getBillsForDate(selectedDate).length > 0 ? (
            getBillsForDate(selectedDate).map((bill, index) => (
              <div key={index} style={{
                background: "#f0f9ff", padding: "14px 20px", marginBottom: 10,
                borderRadius: 8, border: "1px solid #e0f2fe", display: "flex", justifyContent: "space-between"
              }}>
                <div>
                  <h5 style={{ fontSize: 16, fontWeight: 700, color: "#0c4a6e" }}>{bill.name}</h5>
                  <span style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase" }}>
                    {bill.type}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#10b981" }}>
                    Due Date: {bill.due}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "#94a3b8" }}>No bills due on this date.</p>
          )}
        </div>
      </div>
    </div>
  );
}
