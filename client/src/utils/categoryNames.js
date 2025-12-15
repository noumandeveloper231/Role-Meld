function slugToName(slug = "") {
    const map = {
        and: "&",
        at: "@",
        plus: "+",
        hash: "#",
        slash: "/",
        dash: "-",
        dot: ".",
    };

    return slug
        .trim()
        .toLowerCase()
        .split("-")
        .map(word => map[word] ?? capitalize(word))
        .join(" ");
}

function capitalize(word) {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export default slugToName;
