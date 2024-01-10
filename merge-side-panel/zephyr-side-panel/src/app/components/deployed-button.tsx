import React from 'react';

export function DeployedBadge() {
  return (
    <div id="badge-box" className="badge-box">
      <div className="status-badge success">
        <img src="assets/icons/green-check.png" alt="" />
        Deployed
      </div>
    </div>
  );
}

export default DeployedBadge;
