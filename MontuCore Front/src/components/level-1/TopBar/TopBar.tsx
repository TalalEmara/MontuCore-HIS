import React from 'react';
import './TopBar.css';

interface TopBarProps {
  Name?: string;
  Role?: string;
  jerseyNumber?: number;
}

const TopBar: React.FC<TopBarProps> = ({
  Name = '',
  Role = '',
  jerseyNumber,
}) => {
  return (
    <header className="user-topbar">
      <div className="topbar-left">
        <div className="user-summary">
          <div className="user-info">
            <div>
              Welcome <span className="user-name">{Name}</span>
            </div>
            <div className="user-role-jersey">
              <span className="user-role">{Role}</span>
              {jerseyNumber && (
                <span className="user-jersey">#{jerseyNumber}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
