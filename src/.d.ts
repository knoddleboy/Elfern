declare module "*.ico" {
    const value: any;
    export = value;
}

declare module "*.svg" {
    import React from "react";
    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    const value: string;
    export default value;
}

declare module "*.ogg" {
    const value: any;
    export = value;
}

declare module "*.md" {
    const value: string;
    export default value;
}
