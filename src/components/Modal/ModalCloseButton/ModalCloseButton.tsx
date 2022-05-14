import React from "react";

import CustomButton from "@components/CustomButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

interface IModalCloseButton {
    className?: string;
}

const ModalCloseButton: React.FC<IModalCloseButton> = ({ className }) => (
    <div className={`${className}`}>
        <CustomButton className="dialog-close rounded-full">
            <CloseRoundedIcon sx={{ fontSize: 32 }} />
        </CustomButton>
    </div>
);

export default ModalCloseButton;
