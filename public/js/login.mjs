import { showAlert } from "./alerts.mjs";

const login = async (email, password) => {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/v1/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const result = await response.json();
    if (result.status === "success") {
      showAlert("success", "Logged in successfully!");
      setTimeout(() => {
        location.assign("/");
      }, 1000);
    } else {
      console.log(result.error);
      showAlert("error", result.error.message);
    }
  } catch (e) {
    console.log(e);
  }
};

const logout = async () => {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/v1/users/logout");
    const result = await response.json();
    if (result.status === "success") {
      showAlert("success", "Logged out!");
      setTimeout(() => {
        location.reload(true);
      }, 1000);
    } else {
      console.log(result.error);
      showAlert("error", result.error.message);
    }
  } catch (e) {
    console.log(e);
  }
};

const loginBtn = document.querySelector(".form--login");

if (loginBtn)
  loginBtn.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    await login(email, password);
  });

const logoutBtn = document.querySelector(".nav__el--logout");

if (logoutBtn)
  logoutBtn.addEventListener("click", async () => {
    await logout();
  });
