import React from "react";

import CustomButton from "@components/CustomButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

// Separate component for the modal close button since one could forget to set dialog-close class name
const ModalCloseButton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`${className}`}>
        <CustomButton className="dialog-close rounded-full">
            <CloseRoundedIcon sx={{ fontSize: 32 }} />
        </CustomButton>
    </div>
);

export default ModalCloseButton;
