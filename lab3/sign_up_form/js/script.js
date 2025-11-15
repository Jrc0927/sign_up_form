//Global Variable
let usernameIsAvailable = false;

//Event Listeners
document.querySelector("#zip").addEventListener("change", displayCity);
document.querySelector("#state").addEventListener("change", displayCounties);
document.querySelector("#username").addEventListener("change", checkUsername);
document.querySelector("#signupForm").addEventListener("submit", function(event){validateForm(event)});
document.querySelector("#password").addEventListener("focus", showSuggestedPassword);
//window.addEventListener("load", populateStates);



//Functions
//Displaying city from web API after entering a ZIP code
async function displayCity() {
    let zipCode = document.querySelector("#zip").value;
    let url = `https://csumb.space/api/cityInfoAPI.php?zip=${zipCode}`;
    
    try {
        let response = await fetch(url);
        let data = await response.json();

        let citySpan = document.querySelector("#city");
        let latSpan = document.querySelector("#latitude");
        let longSpan = document.querySelector("#longitude");

        // Handle "zip not found" (API usually returns a message or empty object)
        if (!data || !data.city || data.city.toLowerCase().includes("not found")) {
            citySpan.innerHTML = "Zip code not found";
            latSpan.innerHTML = "";
            longSpan.innerHTML = "";
        } else {
            citySpan.innerHTML = data.city;
            latSpan.innerHTML = data.latitude;
            longSpan.innerHTML = data.longitude;
        }
    } catch (err) {
        console.log(err);
        document.querySelector("#city").innerHTML = "Error looking up zip";
        document.querySelector("#latitude").innerHTML = "";
        document.querySelector("#longitude").innerHTML = "";
    }
}

//Displaying counties from web API based on the two-letter abbreviation of the state.
async function displayCounties() {
    let state = document.querySelector("#state").value;
    let url = `https://csumb.space/api/countyListAPI.php?state=${state}`;
    let response = await fetch(url);
    let data = await response.json();
    let countyList = document.querySelector("#county");
    countyList.innerHTML = `<option> Select County </option>`;
    for (let i=0; i < data.length; i++) {
        countyList.innerHTML += `<option> ${data[i].county}</option>`;
    }
}

//Populate state list from Web API
async function populateStates() {
    let stateSelect = document.querySelector("#state");
    try {
        let url = "https://csumb.space/api/statesAPI.php";
        let response = await fetch(url);
        let data = await response.json();

        // Start with a default option
        stateSelect.innerHTML = '<option value="">Select One</option>';

        // Adjust property names if API uses slightly different ones
        for (let i = 0; i < data.length; i++) {
            let stateCode = data[i].usps || data[i].state;  // e.g. "CA"
            let stateName = data[i].state || data[i].name;  // e.g. "California"
            stateSelect.innerHTML += `<option value="${stateCode}">${stateName}</option>`;
        }
    } catch (err) {
        console.log("Error loading states", err);
    }
}

//checking whether the username is available
async function checkUsername() {
    let username = document.querySelector("#username").value.trim();
    let usernameError = document.querySelector("#usernameError");

    if (username.length === 0) {
        usernameError.innerHTML = "Username required!";
        usernameError.style.color = "red";
        usernameIsAvailable = false;
        return;
    }

    let url = `https://csumb.space/api/usernamesAPI.php?username=${username}`;

    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.available) {
            usernameError.innerHTML = "Username available!";
            usernameError.style.color = "green";
            usernameIsAvailable = true;
        } else {
            usernameError.innerHTML = "Username is already taken";
            usernameError.style.color = "red";
            usernameIsAvailable = false;
        }
    } catch (err) {
        console.log(err);
        usernameError.innerHTML = "Error checking username.";
        usernameError.style.color = "red";
        usernameIsAvailable = false;
    }
}


//Validate form data
function validateForm(e) {
    let isValid = true;

    let username = document.querySelector("#username").value.trim();
    let password = document.querySelector("#password").value;
    let passwordAgain = document.querySelector("#passwordAgain").value;

    let usernameError = document.querySelector("#usernameError");
    let passwordError = document.querySelector("#passwordError");

    // clear old messages
    passwordError.innerHTML = "";

    // 1) username required
    if (username.length === 0) {
        usernameError.innerHTML = "Username required!";
        usernameError.style.color = "red";
        isValid = false;
    }
    // 2) username must be available
    else if (!usernameIsAvailable) {
        usernameError.innerHTML = "Please choose an available username.";
        usernameError.style.color = "red";
        isValid = false;
    }

    // 3) password at least 6 chars
    if (password.length < 6) {
        passwordError.innerHTML = "Password must be at least 6 characters.";
        passwordError.style.color = "red";
        isValid = false;
    }

    // 4) passwords must match
    if (password !== passwordAgain) {
        passwordError.innerHTML = "Passwords do not match.";
        passwordError.style.color = "red";
        isValid = false;
    }

    // if anything failed, stop the form from going to welcome.html
    if (!isValid) {
        e.preventDefault();
    }
}


//Show a suggested password when clicking in the password box
function showSuggestedPassword() {
    let suggested = generatePassword();
    document.querySelector("#suggestedPwd").innerHTML = "Suggested password: " + suggested;
}

//simple random password generator (8 characters)
function generatePassword(length = 8) {
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pwd = "";
    for (let i = 0; i < length; i++) {
        let index = Math.floor(Math.random() * chars.length);
        pwd += chars.charAt(index);
    }
    return pwd;
}

