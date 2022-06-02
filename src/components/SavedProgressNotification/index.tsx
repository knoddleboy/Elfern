import React from "react";

import useTranslation from "@src/utils/hooks/useTranslation";

import StyledButton from "@components/StyledButton";

const SavedProgressNotification: React.FC<{ handleCancel: () => void; handleRestore: () => void }> = ({
    handleCancel,
    handleRestore,
}) => {
    const { t } = useTranslation();

    return (
        <div>
            <h1 className="uppercase text-center text-2xl text-dark-700">{t("saved-progress-warning.title")}</h1>
            <p className="my-7 text-center text-lg">
                {t("saved-progress-warning.desc.0")}
                <br />
                {t("saved-progress-warning.desc.1")}
            </p>
            <div className="flex justify-around">
                <StyledButton className="dialog-close" onClick={handleCancel}>
                    {t("saved-progress-warning.btns.cancel")}
                </StyledButton>
                <StyledButton className="dialog-close" onClick={handleRestore}>
                    {t("saved-progress-warning.btns.restore")}
                </StyledButton>
            </div>
        </div>
    );
};

export default SavedProgressNotification;
