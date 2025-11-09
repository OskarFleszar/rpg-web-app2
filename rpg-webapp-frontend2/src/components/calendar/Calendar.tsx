import axios from "axios";
import { useState } from "react";
import Calendar from "react-calendar";

type Props = {
  campaignId: string | undefined;
};

export function CalendarComponent({ campaignId }: Props) {
  const [sessionDate, setSessionDate] = useState<Date | null>(null);
  const [sessionTime, setSessionTime] = useState("");
  const [step, setStep] = useState<"date" | "time">("date");
  const [saving, setSaving] = useState(false);

  const handlePlanSession = async () => {
    if (!sessionDate || !sessionTime || !campaignId) return;
    console.log(campaignId);
    try {
      setSaving(true);

      const [hours, minutes] = sessionTime.split(":").map(Number);
      const d = new Date(sessionDate);
      d.setHours(hours ?? 0, minutes ?? 0, 0, 0);

      await axios.post(
        `http://localhost:8080/api/campaign/${campaignId}/calendar/propose`,
        {
          dateTimeUtc: d.toISOString(),
          userId: localStorage.getItem("userId"),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Campaigh date proposed.");
    } catch (e) {
      console.error("Error proposing session", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        marginTop: "0.5rem",
        padding: "0.5rem",
        borderTop: "1px solid #ccc",
      }}
    >
      {step === "date" && (
        <Calendar
          value={sessionDate}
          onChange={(value) => {
            const d = Array.isArray(value) ? value[0] : value;
            setSessionDate(d ?? null);
            if (d) setStep("time");
          }}
        />
      )}
      {step === "time" && (
        <div style={{ marginTop: 4 }}>
          <label>
            Hour:
            <input
              type="time"
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
            />
          </label>
        </div>
      )}
      <button style={{ marginTop: 6 }} onClick={handlePlanSession}>
        Add
      </button>
    </div>
  );
}
