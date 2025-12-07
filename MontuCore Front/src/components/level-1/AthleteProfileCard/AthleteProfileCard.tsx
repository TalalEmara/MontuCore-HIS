import AdjustableCard from "../AdjustableCard/AdjustableCard";
import "./AthleteProfileCard.css";

interface AthleteStats {
  age: string;
  height: string;
  weight: string;
  status: string;
  role: string;
  jersey: string;
}

interface AthleteProfileCardProps {
  profileImage: string;
  stats: AthleteStats;
}

function AthleteProfileCard({ profileImage, stats }: AthleteProfileCardProps) {
  return (
    <AdjustableCard
      className="athlete-profile-card"
      height="400px"
      minHeight="400px"
    >
      <div
        className="profile-card-container"
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.45)), url(${profileImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="profile-card-header">
          <h2 className="profile-card-title">Personal Information</h2>
        </div>

        <div className="profile-stats-card">
          <div className="stats-content">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="stat-row">
                <span className="stat-label">{key}</span>
                <span
                  className={`stat-value ${
                    key === "status" && value === "Fit" ? "status-fit" : ""
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdjustableCard>
  );
}

export default AthleteProfileCard;