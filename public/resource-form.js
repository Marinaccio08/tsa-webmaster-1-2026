const resourceDropdown = document.getElementById("resourceType");

resourceDropdown.onchange = () => {
    const selectedValue = resourceDropdown.value;
    switch (selectedValue) {
        case "nonprofit":
            document.getElementById("addressBox").classList.remove("hidden");
            document.getElementById("contactInfo").classList.remove("hidden");
            document.getElementById("linkBox").classList.remove("hidden");
            document.getElementById("dates").classList.add("hidden");
            break;
        case "event":
            document.getElementById("addressBox").classList.remove("hidden");
            document.getElementById("dates").classList.remove("hidden");
            document.getElementById("contactInfo").classList.remove("hidden");
            document.getElementById("linkBox").classList.remove("hidden");
            break;
        case "program": 
            document.getElementById("addressBox").classList.remove("hidden");
            document.getElementById("contactInfo").classList.remove("hidden");
            document.getElementById("linkBox").classList.remove("hidden");
            document.getElementById("dates").classList.add("hidden");
            break;
        case "hotline":
            document.getElementById("contactInfo").classList.remove("hidden");
            document.getElementById("linkBox").classList.remove("hidden");
            document.getElementById("addressBox").classList.add("hidden");
            document.getElementById("dates").classList.add("hidden");
            break;
        case "info":
            document.getElementById("linkBox").classList.remove("hidden");
            document.getElementById("addressBox").classList.add("hidden");
            document.getElementById("dates").classList.add("hidden");
            document.getElementById("contactInfo").classList.add("hidden");
            break;
    }
}

const dateCheckbox = document.getElementById("isMultiDay")
dateCheckbox.addEventListener("input", () => {
    if (dateCheckbox.value) {
        document.getElementById("dateRange").classList.remove("hidden")
        document.getElementById("singleDate").classList.add("hidden")
    } else {
        document.getElementById("dateRange").classList.remove("hidden")
        document.getElementById("singleDate").classList.add("hidden")
    }
})
