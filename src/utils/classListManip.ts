class classListManip {
    static getElement(className: string): Element[] {
        return Array.from(document.getElementsByClassName(className));
    }

    static add(classNames: string[], newClassName: string) {
        classNames.forEach((className) =>
            classListManip
                .getElement(className)
                .forEach((element) => element.classList.add(newClassName))
        );
    }

    static remove(classNames: string[], nameToRemove: string) {
        classNames.forEach((className) =>
            classListManip
                .getElement(className)
                .forEach((element) => element.classList.remove(nameToRemove))
        );
    }
}

export default classListManip;
