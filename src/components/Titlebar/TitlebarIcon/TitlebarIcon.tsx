import React from "react";

const TitlebarIcon: React.FC = () => (
    <div className="TitlebarIcon h-full py-1 mx-1.5">
        <img
            src={`${process.env.PUBLIC_URL}/favicon.ico`}
            alt="Elfern logo"
            className="object-contain h-full select-none pointer-events-none"
        />
    </div>
);

export default TitlebarIcon;
