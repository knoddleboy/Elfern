import React from "react";

import CustomButton from "@components/CustomButton";
import BookRoundedIcon from "@mui/icons-material/BookRounded";

import { ReactSetState } from "@src/types";

const RulesButton: React.FC<{ toggleModal: ReactSetState }> = ({ toggleModal }) => (
    <CustomButton className="mb-auto" onClick={() => toggleModal((prevState) => !prevState)}>
        <BookRoundedIcon
            className="text-green-dark hover:brightness-[.5]"
            sx={{ fontSize: 36, filter: "brightness(70%)", transition: "all 75ms linear" }}
        />
    </CustomButton>
);

export default RulesButton;
