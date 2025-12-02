import axios from "axios";
import { useState } from "react";
import Calendar from "react-calendar";
import "./Calendar.css";
import { API_URL } from "../../config";

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
        `${API_URL}/api/campaign/${campaignId}/calendar/propose`,
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
    <div className="calendar-panel">
      {step === "date" && (
        <Calendar
          className="session-calendar"
          value={sessionDate}
          onChange={(value) => {
            const d = Array.isArray(value) ? value[0] : value;
            setSessionDate(d ?? null);
            if (d) setStep("time");
          }}
        />
      )}

      {step === "time" && (
        <div className="calendar-time-picker">
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

      <button
        className="btn-primary calendar-add-btn"
        onClick={handlePlanSession}
        disabled={saving}
      >
        {saving ? "Saving..." : "Add"}
      </button>
    </div>
  );
}
