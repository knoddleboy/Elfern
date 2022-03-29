import React, { useState, useEffect, useRef } from "react";

import CustomButton from "@components/CustomButton";

// import BGBlack from "@assets/images/start-black.png";
// import BGRed from "@assets/images/start-red.png";

import { ReactComponent as King } from "@assets/images/sprites/trash/K/S_unrounded.svg";
import { ReactComponent as Queen } from "@assets/images/sprites/trash/Q/S_unrounded.svg";
import { ReactComponent as Jack } from "@assets/images/sprites/trash/J/S_unrounded.svg";

import CardLinker from "@utils/CardLinker";

import "./StartMenu.scss";

/**
 *
 *
 * @returns element __size__
 */
const useElementSize = (elementRef: React.RefObject<HTMLElement>) => {
    const [elementSize, setElementSize] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        // Handler to call on window resize
        const handleResize = () => {
            if (elementRef.current) {
                setElementSize({
                    width: elementRef.current.clientWidth,
                    height: elementRef.current.clientHeight,
                });
            }
        };

        window.addEventListener("resize", handleResize);

        // Call handler right away so state gets updated with initial window size
        handleResize();

        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return elementSize;
};

const StartMenu: React.FC = () => {
    const ariaRef = useRef<HTMLDivElement>(null);
    const ariaSize = useElementSize(ariaRef);

    // console.log(ariaSize);

    return (
        <React.Fragment>
            <div
                className="w-full relative flex justify-center items-center"
                style={{ height: "calc(100% - 56px)" }}
                ref={ariaRef}
            >
                {/* <img
                className="w-3/12 absolute bottom-0 left-0"
                src={BGBlack}
                alt=""
                draggable={false}
            /> */}
                {/* <img className="w-3/12 absolute top-0 right-0" src={BGRed} alt="" draggable={false} /> */}

                {/* <React.Fragment>
                <Jack
                    className="Card absolute bottom-[27.7%] -left-[4.5%] lg:bottom-[36%] rotate-[60deg]"
                    width="18%"
                />
                <Queen
                    className="Card absolute bottom-[12.3%] left-[2.5%] lg:bottom-[16.5%] rotate-[70deg]"
                    width="18%"
                />
                <King
                    className="Card absolute -bottom-[5%] left-[2%] lg:-bottom-[7%] rotate-90"
                    width="18%"
                />
            </React.Fragment> */}

                <React.Fragment>
                    {/* <CardLinker
                    rank={"jack"}
                    suit="spades"
                    cardSize={{ w: Card.totalSize }}
                    packSizes={{ rank: Card.rank, figure: "adjust" }}
                    className="Card absolute bottom-[27.7%] -left-[4.5%] lg:bottom-[36%] rotate-[60deg]"
                />

                <CardLinker
                    rank={"queen"}
                    suit="spades"
                    cardSize={{ w: Card.totalSize }}
                    packSizes={{ rank: Card.rank, figure: "adjust" }}
                    className="Card absolute bottom-[12.3%] left-[2.5%] lg:bottom-[16.5%] rotate-[70deg]"
                /> */}

                    <King className="Card absolute left-[50px]" width="18%" />

                    <CardLinker
                        rank={"king"}
                        suit={"spades"}
                        packSizes={{
                            rank: `${(ariaSize.width * 5) / 100}px`,
                            figure: `${(ariaSize.width * 15) / 100}px`,
                        }}
                        innerGaps={ariaSize.width}
                        className="Card absolute"
                    />
                </React.Fragment>

                <div className="w-full flex justify-center mb-[56px]">
                    <CustomButton styles="font-bold">Почати</CustomButton>
                </div>
            </div>
        </React.Fragment>
    );
};

export default StartMenu;
