import React from "react";

import BookIcon from "@mui/icons-material/Book";

const RulesSection: React.FC = () => (
    <div className="relative">
        <div className="absolute top-0 right-0 flex items-center p-3">
            <div className="cursor-pointer">
                <BookIcon
                    className="text-green-dark"
                    sx={{ fontSize: 36, filter: "brightness(50%)" }}
                />
            </div>
        </div>
    </div>
);

export default RulesSection;
