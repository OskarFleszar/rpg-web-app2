import { useEffect, useState } from "react";
import axios from "axios";

type SessionVoteDto = {
  userId: number;
  nickname: string;
  vote: "YES" | "NO";
};

type SessionProposalDto = {
  id: number;
  campaignId: number;
  campaignName: string;
  status: "PROPOSED" | "CONFIRMED" | "REJECTED";
  dateTimeUtc: string;
  votes: SessionVoteDto[];
};

export function UpcomingSessionsPage() {
  const [sessions, setSessions] = useState<SessionProposalDto[]>([]);
  const [loading, setLoading] = useState(false);
  const userId = Number(localStorage.getItem("userId"));

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get<SessionProposalDto[]>(
        "http://localhost:8080/api/calendar/my-upcoming-sessions",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSessions(res.data);
    } catch (e) {
      console.error("Error loading sessions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleVote = async (
    campaignId: number,
    proposalId: number,
    vote: "YES" | "NO"
  ) => {
    try {
      await axios.post(
        `http://localhost:8080/api/campaign/${campaignId}/calendar/${proposalId}/vote`,
        { vote, userId: localStorage.getItem("userId") },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      loadSessions();
    } catch (e) {
      console.error("Error voting", e);
    }
  };

  const formatDate = (utc: string) =>
    new Date(utc).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Upcoming sessions</h2>

      {loading && <p>Ładowanie…</p>}

      {!loading && sessions.length === 0 && (
        <p>Na razie nie ma zaplanowanych terminów.</p>
      )}

      {!loading &&
        sessions.map((s) => {
          const yesVotes = s.votes.filter((v) => v.vote === "YES");
          const noVotes = s.votes.filter((v) => v.vote === "NO");
          const myVote = s.votes.find((v) => v.userId === userId)?.vote;

          return (
            <div
              key={s.id}
              style={{
                marginBottom: "0.75rem",
                padding: "0.75rem",
                borderRadius: 6,
                border: "1px solid #ddd",
                background:
                  s.status === "CONFIRMED"
                    ? "#e6ffed"
                    : s.status === "PROPOSED"
                    ? "#f3f4ff"
                    : "#fff5f5",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>{s.campaignName}</strong>
                  <div>{formatDate(s.dateTimeUtc)}</div>
                  <small>Status: {s.status}</small>
                </div>
                <div style={{ fontSize: 12 }}>
                  ✅ {yesVotes.length} | ❌ {noVotes.length}
                </div>
              </div>

              <div style={{ marginTop: 4, fontSize: 13 }}>
                <div>
                  <strong>Twój głos: </strong>
                  {myVote
                    ? myVote === "YES"
                      ? "✅ pasuje"
                      : "❌ nie pasuje"
                    : "brak"}
                </div>
                {noVotes.length > 0 && (
                  <div>
                    <strong>Nie pasuje:</strong>{" "}
                    {noVotes.map((v) => v.nickname).join(", ")}
                  </div>
                )}
              </div>

              {s.status !== "CONFIRMED" && (
                <div style={{ marginTop: 6 }}>
                  <button
                    onClick={() => handleVote(s.campaignId, s.id, "YES")}
                    disabled={myVote === "YES"}
                    style={{ marginRight: 4 }}
                  >
                    Pasuje
                  </button>
                  <button
                    onClick={() => handleVote(s.campaignId, s.id, "NO")}
                    disabled={myVote === "NO"}
                  >
                    Nie pasuje
                  </button>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
