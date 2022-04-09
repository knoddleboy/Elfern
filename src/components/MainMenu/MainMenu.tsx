import React, { useRef, useState } from "react";

import CustomButton from "@components/CustomButton";
import CardLinker from "@utils/CardLinker";

import { ReactSetState } from "@src/types";
import { CYRILLIC_THEME_OFF } from "@constants/applicationTheme";

import "./MainMenu.scss";

const CARD_SIZE = 20;
const cardShadow = "0px 3px 28px 0px rgba(0, 0, 0, 0.3)";

const MainMenu: React.FC<{ render: ReactSetState }> = ({ render }) => {
    const mainMenuRef = useRef<HTMLDivElement>(null);
    const [menuAnimationState, setMenuAnimationState] = useState(false);

    return (
        <React.Fragment>
            <div
                className={`w-full h-[calc(100%-56px)] mt-[56px] relative flex justify-center items-center ${
                    menuAnimationState ? "menu-out-animation" : ""
                }`}
                ref={mainMenuRef}
                onAnimationEnd={() => render((prevState) => !prevState)}
            >
                <div className="left-cards">
                    <CardLinker
                        rank={"jack"}
                        suit={"spades"}
                        cyrillic={CYRILLIC_THEME_OFF}
                        cardSize={CARD_SIZE}
                        relativeElement={{ ref: mainMenuRef }}
                        className="absolute bottom-[28.5%] -left-[4.5%] transition-all duration-200 lg:bottom-[38%] rotate-[60deg]"
                        shadow={`${cardShadow}`}
                    />
                    <CardLinker
                        rank={"queen"}
                        suit={"spades"}
                        cyrillic={CYRILLIC_THEME_OFF}
                        cardSize={CARD_SIZE}
                        relativeElement={{ ref: mainMenuRef }}
                        className="absolute bottom-[12%] left-[2.5%] transition-all duration-200 lg:bottom-[16%] rotate-[70deg]"
                        shadow={`${cardShadow}`}
                    />
                    <CardLinker
                        rank={"king"}
                        suit={"spades"}
                        cyrillic={CYRILLIC_THEME_OFF}
                        cardSize={CARD_SIZE}
                        relativeElement={{ ref: mainMenuRef }}
                        className="absolute -bottom-[5.2%] left-[2%] transition-all duration-200 lg:-bottom-[7%] rotate-90"
                        shadow={`${cardShadow}`}
                    />
                </div>

                <div className="right-cards">
                    <CardLinker
                        rank={"jack"}
                        suit={"hearts"}
                        cyrillic={CYRILLIC_THEME_OFF}
                        cardSize={CARD_SIZE}
                        relativeElement={{ ref: mainMenuRef }}
                        className="absolute top-[28.5%] -right-[4.5%] transition-all duration-200 lg:top-[38%] -rotate-[120deg]"
                        shadow={`${cardShadow}`}
                    />
                    <CardLinker
                        rank={"queen"}
                        suit={"hearts"}
                        cyrillic={CYRILLIC_THEME_OFF}
                        cardSize={CARD_SIZE}
                        relativeElement={{ ref: mainMenuRef }}
                        className="absolute top-[12%] right-[2.5%] transition-all duration-200 lg:top-[16%] -rotate-[110deg]"
                        shadow={`${cardShadow}`}
                    />
                    <CardLinker
                        rank={"king"}
                        suit={"hearts"}
                        cyrillic={CYRILLIC_THEME_OFF}
                        cardSize={CARD_SIZE}
                        relativeElement={{ ref: mainMenuRef }}
                        className="absolute -top-[5.2%] right-[2%] transition-all duration-200 lg:-top-[7%] -rotate-90"
                        shadow={`${cardShadow}`}
                    />
                </div>

                <div
                    className={`w-full flex justify-center mb-[56px] ${
                        menuAnimationState
                            ? "pointer-events-none cursor-pointer"
                            : "pointer-events-auto cursor-auto"
                    }`}
                >
                    <CustomButton
                        className="PlayButton
                        bg-blue-500 hover:bg-blue-400
                        text-white-text font-bold
                        tracking-wide sm:text-sm md:text-base lg:text-lg xl:text-2xl
                        py-[1.2%] px-[calc(4%)]
                        rounded md:rounded-md lg:rounded-lg"
                        onClick={() => setMenuAnimationState((prevState) => !prevState)}
                    >
                        Play
                    </CustomButton>
                </div>
            </div>
        </React.Fragment>
    );
};

export default MainMenu;
