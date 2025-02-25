import React from 'react';

const MyTeamCard = ({ idx, myUser, refetch }) => {
    return (
        <div>
            {myUser?.name}
        </div>
    );
};

export default MyTeamCard;