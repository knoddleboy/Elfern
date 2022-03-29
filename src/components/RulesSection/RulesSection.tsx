import React from "react";

import BookRoundedIcon from "@mui/icons-material/BookRounded";

import { ReactSetState } from "@src/types";

const RulesSection: React.FC<{ toggleModal: ReactSetState }> = ({ toggleModal }) => (
    <div className="w-full h-[60px]">
        <div className="float-right flex items-center p-3">
            <div className="cursor-pointer" onClick={() => toggleModal((prevState) => !prevState)}>
                <BookRoundedIcon
                    className="text-green-dark hover:brightness-[.5]"
                    sx={{ fontSize: 36, filter: "brightness(70%)", transition: "all 75ms linear" }}
                />
            </div>
        </div>
    </div>
);

export default RulesSection;
