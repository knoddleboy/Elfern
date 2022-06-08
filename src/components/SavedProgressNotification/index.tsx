import React from "react";

import useTranslation from "@src/utils/hooks/useTranslation";

import CustomButton from "@components/CustomButton";

/** Window to notify a user about save game progress */
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
                <CustomButton className="dialog-close" onClick={handleCancel} stylish>
                    {t("saved-progress-warning.btns.cancel")}
                </CustomButton>
                <CustomButton className="dialog-close" onClick={handleRestore} stylish>
                    {t("saved-progress-warning.btns.restore")}
                </CustomButton>
            </div>
        </div>
    );
};

export default SavedProgressNotification;
