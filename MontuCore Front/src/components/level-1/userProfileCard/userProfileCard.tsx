import AdjustableCard from "../AdjustableCard/AdjustableCard";
import "./userProfileCard.css";

interface UserStats {
  age?: string;
  height?: string;
  weight?: string;
  status?: string;
  role?: string;
  jersey?: string;
}

interface UserProfileCardProps {
  profileImage: string;
  stats: UserStats;
  width?: string;      
  minWidth?: string;  
  height?: string;    
  minHeight?: string;  
}

function UserProfileCard({
  profileImage,
  stats,
  width = "100%",      
  minWidth = "0",      
  height = "400px",    
  minHeight = "400px",
}: UserProfileCardProps) {
  return (
    <AdjustableCard
      className="user-profile-card"
      width={width}
      minWidth={minWidth}
      height={height}
      minHeight={minHeight}
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

export default UserProfileCard;
