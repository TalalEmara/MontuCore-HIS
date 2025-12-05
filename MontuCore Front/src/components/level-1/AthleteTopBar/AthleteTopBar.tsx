import React from 'react';
import './AthleteTopBar.css';

interface AthleteTopBarProps {
  athleteName?: string;
  athleteRole?: string;
  jerseyNumber?: string;
  athleteProfile?: string;
}

const AthleteTopBar: React.FC<AthleteTopBarProps> = ({
  athleteName = '',
  athleteRole = '',
  jerseyNumber = '',
  athleteProfile= '',
}) => {
  return (
    <header className="athlete-topbar">
      <div className="topbar-left">
        <div className="athlete-summary">
          <div className="athlete-profile">
            <img src={athleteProfile} alt="Athlete Profile" />
          </div>
          <div className="athlete-info">
            <div className="athlete-name">{athleteName}</div>
            <div className="athlete-role-jersey">
              <span className="athlete-role">{athleteRole}</span>
              <span className="athlete-jersey">#{jerseyNumber}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AthleteTopBar;