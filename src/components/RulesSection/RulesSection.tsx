import React from "react";

import BookIcon from "@mui/icons-material/Book";

import { ReactSetState } from "@src/types";

const RulesSection: React.FC<{ toggleModal: ReactSetState }> = ({ toggleModal }) => (
    <div className="relative">
        <div className="absolute top-0 right-0 flex items-center p-3">
            <div className="cursor-pointer" onClick={() => toggleModal((prevState) => !prevState)}>
                <BookIcon
                    className="text-green-dark hover:brightness-[.4]"
                    sx={{ fontSize: 36, filter: "brightness(60%)" }}
                />
            </div>
        </div>
    </div>
);

export default RulesSection;
