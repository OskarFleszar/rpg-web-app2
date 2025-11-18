import { useEffect, useState } from "react";
import axios from "axios";
import "./UpcomingSessionsPage.css";

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
      const userId = localStorage.getItem("userId");
      const res = await axios.get<SessionProposalDto[]>(
        `http://localhost:8080/api/calendar/my-upcoming-sessions/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSessions(res.data);
      console.log(res.data);
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
      console.log(vote, localStorage.getItem("userId"));
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
    new Date(utc).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="page-wrapper">
      <div className="propositions-page">
        <h2 className="top-caption">Upcoming sessions</h2>

        {loading && <p>Loading…</p>}

        {!loading && sessions.length === 0 && <p>No planed sessions yet.</p>}

        {!loading &&
          sessions.map((s) => {
            const yesVotes = s.votes.filter((v) => v.vote === "YES");
            const noVotes = s.votes.filter((v) => v.vote === "NO");
            const myVote = s.votes.find((v) => v.userId === userId)?.vote;

            return (
              <div
                className="single-proposition-container"
                key={s.id}
                style={{
                  borderColor:
                    s.status === "CONFIRMED"
                      ? "#008000"
                      : s.status === "REJECTED"
                      ? "#D2042D"
                      : "",
                }}
              >
                <div className="top-proposal-content">
                  <div className="proposal-data">
                    <strong className="campaign-name">
                      Campaign : {s.campaignName}
                    </strong>
                    <div>Date: {formatDate(s.dateTimeUtc)}</div>
                    <p className="status">Status: {s.status}</p>
                  </div>
                  <div>
                    ✅ {yesVotes.length} | ❌ {noVotes.length}
                  </div>
                </div>

                <div style={{ marginTop: 4, fontSize: 13 }}>
                  <div>
                    <strong>Your vote: </strong>
                    {myVote ? (myVote === "YES" ? "✅ Yes" : "❌ No") : "None"}
                  </div>
                  {noVotes.length > 0 && (
                    <div>
                      <strong>No:</strong>{" "}
                      {noVotes.map((v) => v.nickname).join(", ")}
                    </div>
                  )}
                </div>

                {s.status !== "CONFIRMED" && (
                  <div style={{ marginTop: 6 }}>
                    <button
                      className="btn-primary yes-btn"
                      onClick={() => handleVote(s.campaignId, s.id, "YES")}
                      disabled={myVote === "YES"}
                    >
                      Yes
                    </button>
                    <button
                      className="btn-secondary no-btn"
                      onClick={() => handleVote(s.campaignId, s.id, "NO")}
                      disabled={myVote === "NO"}
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
