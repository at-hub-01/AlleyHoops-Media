const SUPABASE_URL = "https://ciomldclhrzpppbdhzcm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Sll2ktPlSgSd4ruwMKZWUA_wfN0fhug";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
        }
    }
);

const loadingView = document.getElementById("loading-view");
const loginView = document.getElementById("login-view");
const dashboardView = document.getElementById("dashboard-view");
const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-button");
const loginMessage = document.getElementById("login-message");
const logoutButton = document.getElementById("logout-button");
const adminEmail = document.getElementById("admin-email");

function showView(view) {
    loadingView.hidden = view !== "loading";
    loginView.hidden = view !== "login";
    dashboardView.hidden = view !== "dashboard";
}

function showLoginMessage(message = "") {
    loginMessage.textContent = message;
}

function showDashboard(user) {
    adminEmail.textContent = user?.email || "Authenticated admin";
    showView("dashboard");
}

async function initializeAdmin() {
    try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;

        if (data.session?.user) {
            showDashboard(data.session.user);
        } else {
            showView("login");
        }
    } catch (error) {
        console.error("Session check failed:", error);
        showLoginMessage("Could not check the current session. Please refresh and try again.");
        showView("login");
    }
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showLoginMessage("");

    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
        showLoginMessage("Enter both your email and password.");
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Logging in…";

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;

        loginForm.reset();
        showDashboard(data.user);
    } catch (error) {
        console.error("Login failed:", error);
        showLoginMessage("Login failed. Check your email and password and try again.");
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Log in";
    }
});

logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    logoutButton.textContent = "Logging out…";

    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;

        adminEmail.textContent = "";
        showLoginMessage("");
        showView("login");
    } catch (error) {
        console.error("Logout failed:", error);
        alert("Logout failed. Please try again.");
    } finally {
        logoutButton.disabled = false;
        logoutButton.textContent = "Log out";
    }
});

supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
        showDashboard(session.user);
    } else {
        showView("login");
    }
});

initializeAdmin();
